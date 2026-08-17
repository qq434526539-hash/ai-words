import { create } from "zustand";
import type { DailyStat, Familiarity, StudyRecord, WordProgress } from "@/lib/types";
import { loadLearningData, saveLearningData, type PersistedLearningData } from "@/db/database";
import { scheduleReview } from "@/services/srs";

interface LearningStore {
  hydrated: boolean;
  dailyTarget: number;
  progress: Record<string, WordProgress>;
  records: StudyRecord[];
  dailyStats: Record<string, DailyStat>;
  studyDates: string[];
  initialize: () => Promise<void>;
  reviewWord: (wordId: string, familiarity: Familiarity, wasNew: boolean) => void;
  setDailyTarget: (target: number) => void;
}

const initialData: PersistedLearningData = {
  schemaVersion: 1,
  dailyTarget: 10,
  progress: {},
  records: [],
  dailyStats: {},
  studyDates: []
};

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function persist(state: LearningStore) {
  const snapshot: PersistedLearningData = {
    schemaVersion: 1,
    dailyTarget: state.dailyTarget,
    progress: state.progress,
    records: state.records,
    dailyStats: state.dailyStats,
    studyDates: state.studyDates
  };
  void saveLearningData(snapshot);
}

export const useLearningStore = create<LearningStore>((set, get) => ({
  hydrated: false,
  ...initialData,
  initialize: async () => {
    if (get().hydrated) return;
    const saved = await loadLearningData();
    set({ ...(saved ?? initialData), hydrated: true });
  },
  reviewWord: (wordId, familiarity, wasNew) => {
    const now = new Date();
    const today = dateKey(now);
    const state = get();
    const previous = state.progress[wordId];
    const progress = scheduleReview(wordId, familiarity, previous);
    const record: StudyRecord = {
      id: crypto.randomUUID(),
      wordId,
      questionType: "self",
      userAnswer: String(familiarity),
      isCorrect: familiarity >= 2,
      familiarity,
      studiedAt: now.toISOString()
    };
    const oldStat = state.dailyStats[today] ?? { date: today, newCount: 0, reviewCount: 0, correctCount: 0, wrongCount: 0, durationSec: 0 };
    set({
      progress: { ...state.progress, [wordId]: progress },
      records: [...state.records, record],
      dailyStats: {
        ...state.dailyStats,
        [today]: {
          ...oldStat,
          newCount: oldStat.newCount + (wasNew ? 1 : 0),
          reviewCount: oldStat.reviewCount + (wasNew ? 0 : 1),
          correctCount: oldStat.correctCount + (familiarity >= 2 ? 1 : 0),
          wrongCount: oldStat.wrongCount + (familiarity === 0 ? 1 : 0)
        }
      },
      studyDates: state.studyDates.includes(today) ? state.studyDates : [...state.studyDates, today]
    });
    persist(get());
  },
  setDailyTarget: (dailyTarget) => {
    set({ dailyTarget });
    persist(get());
  }
}));
