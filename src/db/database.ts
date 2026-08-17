import { openDB, type DBSchema } from "idb";
import type { DailyStat, StudyRecord, WordProgress } from "@/lib/types";
import type { DictionaryEntry } from "@/services/dictionary";

export interface PersistedLearningData {
  schemaVersion: 1;
  dailyTarget: number;
  progress: Record<string, WordProgress>;
  records: StudyRecord[];
  dailyStats: Record<string, DailyStat>;
  studyDates: string[];
}

interface AIWordsDatabase extends DBSchema {
  app: { key: "learning-data"; value: PersistedLearningData };
  dictionary: { key: string; value: DictionaryEntry };
}

const databasePromise = openDB<AIWordsDatabase>("ai-words", 2, {
  upgrade(database) {
    if (!database.objectStoreNames.contains("app")) database.createObjectStore("app");
    if (!database.objectStoreNames.contains("dictionary")) database.createObjectStore("dictionary");
  }
});

export async function loadLearningData() {
  return (await databasePromise).get("app", "learning-data");
}

export async function saveLearningData(data: PersistedLearningData) {
  await (await databasePromise).put("app", data, "learning-data");
}

export async function loadDictionaryEntry(word: string) {
  return (await databasePromise).get("dictionary", word.toLowerCase());
}

export async function saveDictionaryEntry(entry: DictionaryEntry) {
  await (await databasePromise).put("dictionary", entry, entry.word.toLowerCase());
}
