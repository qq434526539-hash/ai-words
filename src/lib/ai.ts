"use client";

import { getWord } from "@/data/words";
import { mockExplain } from "@/lib/ai-mock";
import type { ExplainMode, EnglishLevel } from "@/lib/types";

export interface ExplainResult {
  text: string;
  source: "ai" | "mock";
}

/**
 * 请求 AI 讲解。
 * 优先调用服务端 /api/explain（密钥只在服务端），失败时用本地模拟回答兜底。
 */
export async function requestExplain(
  wordId: string,
  level: EnglishLevel,
  mode: ExplainMode
): Promise<ExplainResult> {
  const word = getWord(wordId);
  if (!word) throw new Error("单词不存在");

  try {
    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordId, level, mode }),
    });
    if (res.ok) {
      const data = (await res.json()) as { text?: string; source?: "ai" | "mock" };
      if (data?.text) {
        return { text: data.text, source: data.source === "ai" ? "ai" : "mock" };
      }
    }
  } catch {
    // 网络失败 → 本地模拟
  }

  return { text: mockExplain(word, level, mode), source: "mock" };
}
