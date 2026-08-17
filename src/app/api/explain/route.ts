import { NextRequest, NextResponse } from "next/server";
import { getWord } from "@/data/words";
import { mockExplain } from "@/lib/ai-mock";
import type { ExplainMode, EnglishLevel } from "@/lib/types";

export const runtime = "nodejs";

function buildUserPrompt(
  wordId: string,
  level: EnglishLevel,
  mode: ExplainMode
): string {
  const word = getWord(wordId);
  const levelText: Record<EnglishLevel, string> = {
    beginner: "英语零基础，几乎看不懂英文",
    basic: "能看懂简单英文",
    intermediate: "能阅读部分技术资料",
    advanced: "可以正常阅读英文文档",
  };
  const modeText: Record<ExplainMode, string> = {
    teacher: "像一位耐心的老师一样，条理清晰地讲解这个单词",
    plain: "用大白话、最简单的话讲明白",
    case: "用真实 AI 使用场景举例讲解",
    analogy: "用一个通俗的类比帮助记忆",
    "prompt-example": "生成 2-3 个可直接套用的提示词例句",
    "coding-example": "生成 AI 编程场景的例句和用法",
    confused: "对比它的易混淆词，讲清区别",
  };
  return `单词：${word?.word ?? wordId}
中文释义：${word?.coreTranslation ?? "未知"}
AI 领域含义：${word?.aiMeaning ?? "未知"}
学习者英语水平：${levelText[level]}
请用中文，${modeText[mode]}。
要求：口语化、实用、突出 AI 场景，长度控制在 150-250 字。`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    wordId?: string;
    level?: EnglishLevel;
    mode?: ExplainMode;
  } | null;

  const wordId = body?.wordId ?? "";
  const level: EnglishLevel = body?.level ?? "basic";
  const mode: ExplainMode = body?.mode ?? "teacher";
  const word = getWord(wordId);

  if (!word) {
    return NextResponse.json({ error: "单词不存在" }, { status: 404 });
  }

  // 未配置 API 密钥 → 本地模拟回答
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      text: mockExplain(word, level, mode),
      source: "mock",
    });
  }

  try {
    const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "你是 AI Words 的英语学习助手，帮助中文用户理解 AI 场景英语词汇。始终用中文回答，讲解要准确、实用、口语化。",
          },
          { role: "user", content: buildUserPrompt(wordId, level, mode) },
        ],
      }),
    });

    if (!res.ok) {
      // 失败（超时 / 额度不足等）→ 降级为本地模拟，不让用户看到裸错误
      return NextResponse.json({ text: mockExplain(word, level, mode), source: "mock" });
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ text: mockExplain(word, level, mode), source: "mock" });
    }
    return NextResponse.json({ text: text.trim(), source: "ai" });
  } catch {
    return NextResponse.json({ text: mockExplain(word, level, mode), source: "mock" });
  }
}
