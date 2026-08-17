import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getState, hydrateState } from "@/lib/store";
import type {
  AppState,
  DailyStat,
  EnglishLevel,
  Favorite,
  LearningGoal,
  StudyRecord,
  UserProfile,
  WordProgress,
  WrongWordEntry,
} from "@/lib/types";

/**
 * Supabase 云同步（第三阶段）
 * 仅当配置了 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 时生效；
 * 未配置时所有函数自动返回空结果，应用保持本地模式。
 */

/* ---------- 行结构（与 supabase/schema.sql 对应） ---------- */

interface ProfileRow {
  id: string;
  email: string | null;
  nickname: string | null;
  english_level: EnglishLevel | null;
  learning_goal: LearningGoal | null;
  daily_word_target: number;
}

interface ProgressRow {
  user_id: string;
  word_id: string;
  familiarity_level: number;
  correct_count: number;
  wrong_count: number;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  review_interval: number;
  is_mastered: boolean;
  pinned: boolean;
  updated_at: string;
}

interface RecordRow {
  id: string;
  user_id: string;
  word_id: string;
  question_type: string;
  user_answer: string | null;
  is_correct: boolean | null;
  familiarity_level: number;
  studied_at: string;
}

interface FavoriteRow {
  user_id: string;
  word_id: string;
  folder_name: string;
  created_at: string;
}

interface DailyStatRow {
  user_id: string;
  study_date: string;
  new_words_count: number;
  review_words_count: number;
  correct_count: number;
  wrong_count: number;
  study_duration: number;
}

interface WrongWordRow {
  user_id: string;
  word_id: string;
  wrong_count: number;
  last_wrong_at: string;
  main_question_type: string | null;
  resolved: boolean;
}

/* ---------- 拉取 ---------- */

async function pullProfile(uid: string): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase!
    .from("users")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  return (data as ProfileRow) ?? null;
}

async function pullAllRows(uid: string) {
  if (!isSupabaseConfigured) {
    return { progress: [], records: [], favorites: [], dailyStats: [], wrongWords: [] };
  }
  const [p, r, f, d, w] = await Promise.all([
    supabase!.from("user_word_progress").select("*").eq("user_id", uid),
    supabase!.from("study_records").select("*").eq("user_id", uid).order("studied_at"),
    supabase!.from("favorites").select("*").eq("user_id", uid),
    supabase!.from("daily_statistics").select("*").eq("user_id", uid),
    supabase!.from("wrong_words").select("*").eq("user_id", uid),
  ]);
  return {
    progress: (p.data ?? []) as ProgressRow[],
    records: (r.data ?? []) as RecordRow[],
    favorites: (f.data ?? []) as FavoriteRow[],
    dailyStats: (d.data ?? []) as DailyStatRow[],
    wrongWords: (w.data ?? []) as WrongWordRow[],
  };
}

/** 登录后：拉取服务端数据并合并进本地状态 */
export async function pullAllAndMerge(user: {
  id: string;
  email?: string | null;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const profile = await pullProfile(user.id);
  const rows = await pullAllRows(user.id);
  const local = getState();

  const patch: Partial<AppState> = {};

  // 资料：服务端有值则覆盖，没有则保留本地
  if (profile) {
    const p: Partial<UserProfile> = {};
    if (profile.nickname) p.nickname = profile.nickname;
    if (profile.english_level) p.englishLevel = profile.english_level;
    if (profile.learning_goal) p.learningGoal = profile.learning_goal;
    if (profile.daily_word_target) p.dailyTarget = profile.daily_word_target;
    patch.profile = p as UserProfile;
  }

  // 进度（服务端优先）
  if (rows.progress.length) {
    const merged: Record<string, WordProgress> = { ...local.progress };
    for (const row of rows.progress) {
      merged[row.word_id] = {
        wordId: row.word_id,
        familiarity: row.familiarity_level as WordProgress["familiarity"],
        correctCount: row.correct_count,
        wrongCount: row.wrong_count,
        lastReviewedAt: row.last_reviewed_at,
        nextReviewAt: row.next_review_at,
        intervalMs: row.review_interval,
        mastered: row.is_mastered,
        pinned: row.pinned,
      };
    }
    patch.progress = merged;
  }

  // 学习记录（按 id 去重合并）
  if (rows.records.length) {
    const byId = new Map<string, StudyRecord>();
    local.records.forEach((r) => byId.set(r.id, r));
    rows.records.forEach((r) =>
      byId.set(r.id, {
        id: r.id,
        wordId: r.word_id,
        questionType: r.question_type as StudyRecord["questionType"],
        userAnswer: r.user_answer ?? "",
        isCorrect: r.is_correct ?? true,
        familiarity: r.familiarity_level as StudyRecord["familiarity"],
        studiedAt: r.studied_at,
      })
    );
    patch.records = Array.from(byId.values()).sort(
      (a, b) => new Date(a.studiedAt).getTime() - new Date(b.studiedAt).getTime()
    );
  }

  // 收藏（按 wordId+folderName 去重）
  if (rows.favorites.length) {
    const key = (f: Favorite) => `${f.wordId}::${f.folderName}`;
    const byKey = new Map<string, Favorite>();
    local.favorites.forEach((f) => byKey.set(key(f), f));
    rows.favorites.forEach((f) =>
      byKey.set(`${f.word_id}::${f.folder_name}`, {
        wordId: f.word_id,
        folderName: f.folder_name,
        createdAt: f.created_at,
      })
    );
    patch.favorites = Array.from(byKey.values());
    patch.folders = Array.from(new Set(patch.favorites.map((f) => f.folderName).concat(local.folders)));
  }

  // 错词本（服务端优先）
  if (rows.wrongWords.length) {
    const merged: Record<string, WrongWordEntry> = { ...local.wrongWords };
    for (const row of rows.wrongWords) {
      merged[row.word_id] = {
        wordId: row.word_id,
        wrongCount: row.wrong_count,
        lastWrongAt: row.last_wrong_at,
        mainQuestionType: row.main_question_type as WrongWordEntry["mainQuestionType"],
        resolved: row.resolved,
      };
    }
    patch.wrongWords = merged;
  }

  // 每日统计
  if (rows.dailyStats.length) {
    const merged: Record<string, DailyStat> = { ...local.dailyStats };
    for (const row of rows.dailyStats) {
      merged[row.study_date] = {
        date: row.study_date,
        newCount: row.new_words_count,
        reviewCount: row.review_words_count,
        correctCount: row.correct_count,
        wrongCount: row.wrong_count,
        durationSec: row.study_duration,
      };
    }
    patch.dailyStats = merged;
    patch.studyDates = Object.keys(merged);
  }

  if (Object.keys(patch).length) {
    hydrateState(patch);
  }
  return true;
}

/* ---------- 推送 ---------- */

async function pushProfile(uid: string, profile: UserProfile) {
  if (!isSupabaseConfigured) return;
  const row: ProfileRow = {
    id: uid,
    email: profile.email,
    nickname: profile.nickname || "同学",
    english_level: profile.englishLevel,
    learning_goal: profile.learningGoal,
    daily_word_target: profile.dailyTarget,
  };
  await supabase!.from("users").upsert(row, { onConflict: "id" });
}

async function pushProgress(uid: string, progress: Record<string, WordProgress>) {
  if (!isSupabaseConfigured) return;
  const rows: ProgressRow[] = Object.values(progress).map((p) => ({
    user_id: uid,
    word_id: p.wordId,
    familiarity_level: p.familiarity,
    correct_count: p.correctCount,
    wrong_count: p.wrongCount,
    last_reviewed_at: p.lastReviewedAt,
    next_review_at: p.nextReviewAt,
    review_interval: p.intervalMs,
    is_mastered: p.mastered,
    pinned: p.pinned,
    updated_at: new Date().toISOString(),
  }));
  if (!rows.length) return;
  await supabase!.from("user_word_progress").upsert(rows, {
    onConflict: "user_id,word_id",
  });
}

async function pushRecords(uid: string, records: StudyRecord[]) {
  if (!isSupabaseConfigured) return;
  const rows: RecordRow[] = records.map((r) => ({
    id: r.id,
    user_id: uid,
    word_id: r.wordId,
    question_type: r.questionType,
    user_answer: r.userAnswer,
    is_correct: r.isCorrect,
    familiarity_level: r.familiarity,
    studied_at: r.studiedAt,
  }));
  if (!rows.length) return;
  await supabase!.from("study_records").upsert(rows, { onConflict: "id" });
}

async function pushFavorites(uid: string, favorites: Favorite[]) {
  if (!isSupabaseConfigured) return;
  const rows: FavoriteRow[] = favorites.map((f) => ({
    user_id: uid,
    word_id: f.wordId,
    folder_name: f.folderName,
    created_at: f.createdAt,
  }));
  if (!rows.length) return;
  await supabase!.from("favorites").upsert(rows, {
    onConflict: "user_id,word_id,folder_name",
  });
}

async function pushDailyStats(uid: string, stats: Record<string, DailyStat>) {
  if (!isSupabaseConfigured) return;
  const rows: DailyStatRow[] = Object.values(stats).map((s) => ({
    user_id: uid,
    study_date: s.date,
    new_words_count: s.newCount,
    review_words_count: s.reviewCount,
    correct_count: s.correctCount,
    wrong_count: s.wrongCount,
    study_duration: s.durationSec,
  }));
  if (!rows.length) return;
  await supabase!.from("daily_statistics").upsert(rows, {
    onConflict: "user_id,study_date",
  });
}

async function pushWrongWords(uid: string, wrongWords: Record<string, WrongWordEntry>) {
  if (!isSupabaseConfigured) return;
  const rows: WrongWordRow[] = Object.values(wrongWords).map((w) => ({
    user_id: uid,
    word_id: w.wordId,
    wrong_count: w.wrongCount,
    last_wrong_at: w.lastWrongAt,
    main_question_type: w.mainQuestionType,
    resolved: w.resolved,
  }));
  if (!rows.length) return;
  await supabase!.from("wrong_words").upsert(rows, {
    onConflict: "user_id,word_id",
  });
}

/** 把当前本地状态整体推送到服务端（防抖调用） */
export async function pushAll(state: AppState): Promise<void> {
  if (!isSupabaseConfigured) return;
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) return;

  const uid = user.id;
  await Promise.allSettled([
    pushProfile(uid, state.profile),
    pushProgress(uid, state.progress),
    pushRecords(uid, state.records),
    pushFavorites(uid, state.favorites),
    pushDailyStats(uid, state.dailyStats),
    pushWrongWords(uid, state.wrongWords),
  ]);
}
