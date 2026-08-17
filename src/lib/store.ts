import type {
  AppState,
  DailyStat,
  Favorite,
  Familiarity,
  QuestionType,
  StudyRecord,
  UserProfile,
  WordProgress,
  WrongWordEntry,
} from "@/lib/types";
import { scheduler, scheduleNextReview } from "@/lib/srs";
import { formatDateKey } from "@/lib/utils";

const STORAGE_KEY = "ai-words-state-v1";

/** 初始状态（本地模式） */
function createInitialState(): AppState {
  return {
    profile: {
      nickname: "",
      email: null,
      englishLevel: null,
      learningGoal: null,
      dailyTarget: 10,
      onboarded: false,
      selectedCategoryIds: [],
    },
    progress: {},
    records: [],
    wrongWords: {},
    favorites: [],
    folders: ["默认收藏夹"],
    studyDates: [],
    dailyStats: {},
  };
}

function load(): AppState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...createInitialState(), ...parsed };
  } catch {
    return createInitialState();
  }
}

function persist(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage 不可用（隐私模式等）时静默降级为内存模式
  }
}

let state: AppState = load();
/** 服务端渲染时使用的稳定快照（避免水合不一致） */
const serverState: AppState = createInitialState();
const listeners = new Set<() => void>();

export function getState(): AppState {
  return state;
}

/** SSR / 首次渲染快照（始终返回空状态，水合后再读取 localStorage） */
export function getServerState(): AppState {
  return serverState;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function update(mutate: (draft: AppState) => void) {
  const draft = structuredClone(state);
  mutate(draft);
  state = draft;
  persist(state);
  emit();
}

/* ---------- 工具 ---------- */

function todayKey(now = new Date()): string {
  return formatDateKey(now);
}

/** 记录今天有学习行为，并初始化当日统计 */
function ensureStudyDay(draft: AppState, now = new Date()) {
  const key = todayKey(now);
  if (!draft.studyDates.includes(key)) draft.studyDates.push(key);
  if (!draft.dailyStats[key]) {
    draft.dailyStats[key] = {
      date: key,
      newCount: 0,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      durationSec: 0,
    };
  }
}

function getOrCreateProgress(draft: AppState, wordId: string): WordProgress {
  if (!draft.progress[wordId]) {
    draft.progress[wordId] = {
      wordId,
      familiarity: 0,
      correctCount: 0,
      wrongCount: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
      intervalMs: 0,
      mastered: false,
      pinned: false,
    };
  }
  return draft.progress[wordId];
}

function pushRecord(
  draft: AppState,
  wordId: string,
  questionType: QuestionType,
  userAnswer: string,
  isCorrect: boolean,
  familiarity: Familiarity
) {
  const record: StudyRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    wordId,
    questionType,
    userAnswer,
    isCorrect,
    familiarity,
    studiedAt: new Date().toISOString(),
  };
  draft.records.push(record);
}

/* ---------- 学习动作 ---------- */

/** 学习卡片上选择掌握程度 */
export function setFamiliarity(wordId: string, familiarity: Familiarity) {
  update((draft) => {
    const existed = Boolean(draft.progress[wordId]);
    const progress = getOrCreateProgress(draft, wordId);
    const schedule = scheduleNextReview(familiarity, progress);

    progress.familiarity = familiarity;
    progress.lastReviewedAt = new Date().toISOString();
    progress.nextReviewAt = schedule.nextReviewAt;
    progress.intervalMs = schedule.intervalMs;
    progress.mastered = scheduler.isMastered(progress);

    ensureStudyDay(draft);
    const stat = draft.dailyStats[todayKey()];
    if (existed) stat.reviewCount += 1;
    else stat.newCount += 1;

    pushRecord(draft, wordId, "self", familiarity.toString(), true, familiarity);
  });
}

/** 练习答题结果 */
export function recordAnswer(
  wordId: string,
  questionType: QuestionType,
  userAnswer: string,
  isCorrect: boolean
) {
  update((draft) => {
    const progress = getOrCreateProgress(draft, wordId);
    if (isCorrect) progress.correctCount += 1;
    else progress.wrongCount += 1;

    ensureStudyDay(draft);
    const stat = draft.dailyStats[todayKey()];
    if (isCorrect) stat.correctCount += 1;
    else stat.wrongCount += 1;

    pushRecord(draft, wordId, questionType, userAnswer, isCorrect, progress.familiarity);

    if (!isCorrect) {
      const entry: WrongWordEntry = draft.wrongWords[wordId] ?? {
        wordId,
        wrongCount: 0,
        lastWrongAt: new Date().toISOString(),
        mainQuestionType: questionType,
        resolved: false,
      };
      entry.wrongCount += 1;
      entry.lastWrongAt = new Date().toISOString();
      entry.mainQuestionType = questionType;
      draft.wrongWords[wordId] = entry;
    }
  });
}

/** 手动加入重点复习（答错解析页 / 单词详情） */
export function pinForReview(wordId: string) {
  update((draft) => {
    const progress = getOrCreateProgress(draft, wordId);
    progress.pinned = true;
    progress.intervalMs = 10 * 60 * 1000;
    progress.nextReviewAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  });
}

/** 错词本：标记为已掌握（移出） */
export function resolveWrongWord(wordId: string) {
  update((draft) => {
    const entry = draft.wrongWords[wordId];
    if (entry) entry.resolved = true;
  });
}

/** 错词本：彻底移除 */
export function removeWrongWord(wordId: string) {
  update((draft) => {
    delete draft.wrongWords[wordId];
  });
}

/** 收藏 / 取消收藏 */
export function toggleFavorite(wordId: string, folderName: string) {
  update((draft) => {
    const idx = draft.favorites.findIndex(
      (f) => f.wordId === wordId && f.folderName === folderName
    );
    if (idx >= 0) {
      draft.favorites.splice(idx, 1);
    } else {
      if (!draft.folders.includes(folderName)) draft.folders.push(folderName);
      draft.favorites.push({
        wordId,
        folderName,
        createdAt: new Date().toISOString(),
      });
    }
  });
}

/** 创建自定义收藏夹 */
export function createFolder(name: string) {
  update((draft) => {
    const trimmed = name.trim();
    if (!trimmed || draft.folders.includes(trimmed)) return;
    draft.folders.push(trimmed);
  });
}

/** 删除收藏夹（同时删除其中的收藏） */
export function deleteFolder(name: string) {
  update((draft) => {
    draft.folders = draft.folders.filter((f) => f !== name);
    draft.favorites = draft.favorites.filter((f) => f.folderName !== name);
  });
}

/** 移除某个收藏夹下的单词 */
export function removeFavorite(wordId: string, folderName: string) {
  update((draft) => {
    draft.favorites = draft.favorites.filter(
      (f) => !(f.wordId === wordId && f.folderName === folderName)
    );
  });
}

/** 更新用户资料 */
export function updateProfile(patch: Partial<UserProfile>) {
  update((draft) => {
    draft.profile = { ...draft.profile, ...patch };
  });
}

/** 完成首次引导 */
export function completeOnboarding(patch: Partial<UserProfile>) {
  update((draft) => {
    draft.profile = {
      ...draft.profile,
      ...patch,
      onboarded: true,
    };
  });
}

/** 本地模式注册/登录（第三阶段换成 Supabase Auth） */
export function localLogin(nickname: string, email: string | null) {
  update((draft) => {
    draft.profile.nickname = nickname;
    draft.profile.email = email;
  });
}

/** 清空所有本地数据 */
export function clearAllData() {
  state = createInitialState();
  persist(state);
  emit();
}

/**
 * 从服务端合并数据（登录拉取时使用）。
 * 服务端有值的字段合并进本地；本地已有的独立数据保留。
 */
export function hydrateState(patch: Partial<AppState>) {
  update((draft) => {
    if (patch.profile) {
      draft.profile = { ...draft.profile, ...patch.profile };
    }
    if (patch.progress) {
      draft.progress = { ...draft.progress, ...patch.progress };
    }
    if (patch.records) {
      const byId = new Map<string, StudyRecord>();
      draft.records.forEach((r) => byId.set(r.id, r));
      patch.records!.forEach((r) => byId.set(r.id, r));
      draft.records = Array.from(byId.values());
    }
    if (patch.favorites) {
      const key = (f: { wordId: string; folderName: string }) => `${f.wordId}::${f.folderName}`;
      const byKey = new Map<string, Favorite>();
      draft.favorites.forEach((f) => byKey.set(key(f), f));
      patch.favorites!.forEach((f) => byKey.set(key(f), f));
      draft.favorites = Array.from(byKey.values());
    }
    if (patch.wrongWords) {
      draft.wrongWords = { ...draft.wrongWords, ...patch.wrongWords };
    }
    if (patch.dailyStats) {
      draft.dailyStats = { ...draft.dailyStats, ...patch.dailyStats };
    }
    if (patch.folders) {
      draft.folders = Array.from(new Set([...draft.folders, ...patch.folders]));
    }
    if (patch.studyDates) {
      draft.studyDates = Array.from(new Set([...draft.studyDates, ...patch.studyDates]));
    }
  });
}

/** 仅用于调试/统计页：累计学习时长（秒） */
export function addStudyDuration(seconds: number) {
  update((draft) => {
    ensureStudyDay(draft);
    const stat = draft.dailyStats[todayKey()];
    stat.durationSec += seconds;
  });
}

/** 获取当日统计（无则返回空） */
export function getTodayStat(state: AppState): DailyStat | null {
  return state.dailyStats[todayKey()] ?? null;
}
