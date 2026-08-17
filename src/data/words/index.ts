import type { Word } from "@/lib/types";
import { AI_BASICS_WORDS } from "./ai-basics";
import { LLM_CHATGPT_WORDS } from "./llm-chatgpt";
import { PROMPT_ENGINEERING_WORDS } from "./prompt-engineering";
import { AI_CODING_WORDS } from "./ai-coding";
import { AGENT_WORDS } from "./agent";
import { API_DOCS_WORDS } from "./api-docs";
import { ERROR_MESSAGES_WORDS } from "./error-messages";

/** 全部种子单词（105 词） */
export const ALL_WORDS: Word[] = [
  ...AI_BASICS_WORDS,
  ...LLM_CHATGPT_WORDS,
  ...PROMPT_ENGINEERING_WORDS,
  ...AI_CODING_WORDS,
  ...AGENT_WORDS,
  ...API_DOCS_WORDS,
  ...ERROR_MESSAGES_WORDS,
];

/** wordId → Word 查询表 */
export const WORD_MAP: Record<string, Word> = Object.fromEntries(
  ALL_WORDS.map((w) => [w.id, w])
);

/** 按分类分组 */
export const WORDS_BY_CATEGORY: Record<string, Word[]> = ALL_WORDS.reduce(
  (acc, w) => {
    (acc[w.categoryId] ||= []).push(w);
    return acc;
  },
  {} as Record<string, Word[]>
);

/** 未登录用户可体验的示例词（前 10 个） */
export const SAMPLE_WORDS: Word[] = ALL_WORDS.slice(0, 10);

export function getWordsByCategory(categoryId: string): Word[] {
  return WORDS_BY_CATEGORY[categoryId] ?? [];
}

export function getWord(id: string): Word | undefined {
  return WORD_MAP[id];
}
