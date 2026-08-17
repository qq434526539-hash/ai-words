import { ALL_WORDS } from "@/data/words";
import type { DailyStat, WordProgress } from "@/lib/types";
import { isDue } from "@/services/srs";

export function buildStudyQueue(progress: Record<string, WordProgress>, dailyTarget: number) {
  const due = ALL_WORDS.filter((word) => progress[word.id] && isDue(progress[word.id]));
  const fresh = ALL_WORDS.filter((word) => !progress[word.id]).slice(0, dailyTarget);
  return { words: [...due, ...fresh], dueCount: due.length, newCount: fresh.length };
}

export function learningSummary(progress: Record<string, WordProgress>, dailyStats: Record<string, DailyStat>, studyDates: string[], dailyTarget: number) {
  const plan = buildStudyQueue(progress, dailyTarget);
  const values = Object.values(progress);
  return {
    ...plan,
    learned: values.length,
    mastered: values.filter((item) => item.mastered).length,
    studyDays: new Set(studyDates).size,
    total: ALL_WORDS.length,
    todayStats: dailyStats[toDateKey(new Date())]
  };
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
