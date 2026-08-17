import type { Familiarity, WordProgress } from "@/lib/types";

/**
 * 简化间隔重复（第一版）
 * 0 完全不认识 → 10 分钟后再次出现
 * 1 有点印象   → 1 天后复习
 * 2 基本掌握   → 3 天后复习
 * 3 非常熟悉   → 7 天后复习（低频复习，防止遗忘）
 */
export const INTERVAL_MS: Record<Familiarity, number> = {
  0: 10 * 60 * 1000,
  1: 24 * 60 * 60 * 1000,
  2: 3 * 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000,
};

export const FAMILIARITY_LABELS: Record<Familiarity, string> = {
  0: "完全不认识",
  1: "有点印象",
  2: "基本掌握",
  3: "非常熟悉",
};

/**
 * 复习调度器接口 —— 后续升级 FSRS 时实现同一接口即可无缝替换
 */
export interface ReviewScheduler {
  /** 根据本次掌握程度返回下一次复习间隔（毫秒） */
  nextInterval(familiarity: Familiarity, previous?: WordProgress): number;
  /** 是否已达到掌握标准 */
  isMastered(progress: WordProgress): boolean;
}

/** 第一版简化调度器 */
class SimpleScheduler implements ReviewScheduler {
  nextInterval(familiarity: Familiarity, previous?: WordProgress): number {
    // 完全不认识 → 保持最短间隔，10 分钟后重新出现
    if (familiarity === 0) return INTERVAL_MS[0];
    // 从「有点印象」升级到更高档位时，间隔取两者中的较大值，保证只增不减
    const base = INTERVAL_MS[familiarity];
    if (previous && previous.intervalMs > base) return previous.intervalMs;
    return base;
  }

  isMastered(progress: WordProgress): boolean {
    // 非常熟悉且连续正确 2 次以上视为掌握
    return progress.familiarity === 3 && progress.correctCount >= 2;
  }
}

export const scheduler: ReviewScheduler = new SimpleScheduler();

/** 计算下一次复习时间（ISO 字符串） */
export function scheduleNextReview(familiarity: Familiarity, previous?: WordProgress): {
  intervalMs: number;
  nextReviewAt: string;
} {
  const intervalMs = scheduler.nextInterval(familiarity, previous);
  return {
    intervalMs,
    nextReviewAt: new Date(Date.now() + intervalMs).toISOString(),
  };
}
