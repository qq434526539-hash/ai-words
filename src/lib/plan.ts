import type { AppState, Word } from "@/lib/types";
import { ALL_WORDS, SAMPLE_WORDS } from "@/data/words";
import { CATEGORIES } from "@/data/categories";

/** 已掌握：非常熟悉且正确次数 ≥ 2 */
export function isMasteredProgress(state: AppState, wordId: string): boolean {
  return state.progress[wordId]?.mastered ?? false;
}

/** 今天到期待复习的单词（按到期时间升序，最多 30 个） */
export function getDueWords(state: AppState, now = new Date()): Word[] {
  const due = Object.values(state.progress)
    .filter((p) => p.nextReviewAt && new Date(p.nextReviewAt).getTime() <= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt!).getTime() - new Date(b.nextReviewAt!).getTime()
    )
    .slice(0, 30)
    .map((p) => ALL_WORDS.find((w) => w.id === p.wordId))
    .filter((w): w is Word => Boolean(w));
  return due;
}

/**
 * 今日计划：复习优先，新词补足每日配额
 * 未登录（本地体验）模式只能学习示例词
 */
export function buildTodayPlan(state: AppState, now = new Date()) {
  const isGuest = !state.profile.email;
  const due = getDueWords(state, now);

  // 候选新词：已选词库中还没有学习记录的词
  const learnedIds = new Set(Object.keys(state.progress));
  const selected = state.profile.selectedCategoryIds;
  const pool = selected.length
    ? ALL_WORDS.filter((w) => selected.includes(w.categoryId))
    : ALL_WORDS;

  let candidates = pool.filter((w) => !learnedIds.has(w.id));
  if (isGuest) {
    const sampleIds = new Set(SAMPLE_WORDS.map((w) => w.id));
    candidates = candidates.filter((w) => sampleIds.has(w.id));
  }

  const newCount = Math.max(0, state.profile.dailyTarget - due.length);
  const newWords = candidates.slice(0, newCount);

  return {
    due,
    newWords,
    dueCount: due.length,
    newWordsCount: newWords.length,
    isGuest,
  };
}

/** 今日队列：先复习后新词 */
export function buildTodayQueue(state: AppState): Word[] {
  const plan = buildTodayPlan(state);
  return [...plan.due, ...plan.newWords];
}

/** 统计：已学 / 已掌握 / 待复习 */
export function computeLearningStats(state: AppState) {
  const progressList = Object.values(state.progress);
  const mastered = progressList.filter((p) => p.mastered).length;
  const due = progressList.filter(
    (p) => p.nextReviewAt && new Date(p.nextReviewAt).getTime() <= Date.now()
  ).length;
  const totalCorrect = progressList.reduce((s, p) => s + p.correctCount, 0);
  const totalWrong = progressList.reduce((s, p) => s + p.wrongCount, 0);
  const totalAnswered = totalCorrect + totalWrong;

  return {
    learned: progressList.length,
    mastered,
    due,
    totalWords: ALL_WORDS.length,
    totalCorrect,
    totalWrong,
    totalAnswered,
    accuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
    streak: calcStreak(state.studyDates),
    studyDays: state.studyDates.length,
  };
}

/** 连续学习天数（从最近一次学习日往回数） */
export function calcStreak(studyDates: string[]): number {
  if (!studyDates.length) return 0;
  const set = new Set(studyDates);
  let streak = 0;
  const cursor = new Date();
  // 今天没学则从昨天开始算（给当天还没学留余地）
  const key = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  if (!set.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(key(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** 最近 7 天学习量（供图表使用） */
export function getRecent7Days(state: AppState) {
  const days: { date: string; label: string; count: number; correct: number; wrong: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const stat = state.dailyStats[key];
    days.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: (stat?.newCount ?? 0) + (stat?.reviewCount ?? 0),
      correct: stat?.correctCount ?? 0,
      wrong: stat?.wrongCount ?? 0,
    });
  }
  return days;
}

/** 各词库掌握进度 */
export function getCategoryProgress(state: AppState) {
  return CATEGORIES.map((cat) => {
    const words = ALL_WORDS.filter((w) => w.categoryId === cat.id);
    const learned = words.filter((w) => state.progress[w.id]).length;
    const mastered = words.filter((w) => state.progress[w.id]?.mastered).length;
    return {
      category: cat,
      total: words.length,
      learned,
      mastered,
      percent: words.length ? Math.round((learned / words.length) * 100) : 0,
    };
  });
}

/** 最薄弱的分类（正确率最低且学过 ≥ 3 词） */
export function getWeakestCategories(state: AppState) {
  return getCategoryProgress(state)
    .map((cp) => {
      const words = ALL_WORDS.filter((w) => w.categoryId === cp.category.id);
      let correct = 0;
      let wrong = 0;
      for (const w of words) {
        const p = state.progress[w.id];
        if (p) {
          correct += p.correctCount;
          wrong += p.wrongCount;
        }
      }
      const accuracy = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : null;
      return { ...cp, accuracy };
    })
    .filter((cp) => cp.learned >= 3 && cp.accuracy !== null)
    .sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))
    .slice(0, 3);
}

/** 最易出错的单词 */
export function getTopWrongWords(state: AppState, limit = 5) {
  return Object.values(state.wrongWords)
    .filter((w) => !w.resolved)
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, limit)
    .map((w) => ({ entry: w, word: ALL_WORDS.find((x) => x.id === w.wordId) }))
    .filter((x) => Boolean(x.word));
}
