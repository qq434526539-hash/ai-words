import type { Familiarity, WordProgress } from "@/lib/types";

export const REVIEW_INTERVALS: Record<Familiarity, number> = {
  0: 10 * 60 * 1000,
  1: 24 * 60 * 60 * 1000,
  2: 3 * 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000
};

export const FAMILIARITY_OPTIONS: Array<{ value: Familiarity; label: string; hint: string }> = [
  { value: 0, label: "完全不会", hint: "10 分钟后" },
  { value: 1, label: "有点印象", hint: "1 天后" },
  { value: 2, label: "已经掌握", hint: "3 天后" },
  { value: 3, label: "非常熟悉", hint: "7 天后" }
];

export function scheduleReview(wordId: string, familiarity: Familiarity, previous?: WordProgress): WordProgress {
  const now = new Date();
  const intervalMs = REVIEW_INTERVALS[familiarity];
  return {
    wordId,
    familiarity,
    correctCount: (previous?.correctCount ?? 0) + (familiarity >= 2 ? 1 : 0),
    wrongCount: (previous?.wrongCount ?? 0) + (familiarity === 0 ? 1 : 0),
    lastReviewedAt: now.toISOString(),
    nextReviewAt: new Date(now.getTime() + intervalMs).toISOString(),
    intervalMs,
    mastered: familiarity >= 2,
    pinned: previous?.pinned ?? false
  };
}

export function isDue(progress: WordProgress, now = Date.now()) {
  return Boolean(progress.nextReviewAt && new Date(progress.nextReviewAt).getTime() <= now);
}
