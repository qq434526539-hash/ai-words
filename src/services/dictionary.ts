export interface DictionaryDefinition {
  definition: string;
  example?: string;
  synonyms: string[];
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  audio?: string;
  meanings: DictionaryMeaning[];
  sourceUrl?: string;
  cachedAt: string;
}

interface ApiEntry {
  word: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string; audio?: string }>;
  meanings?: Array<{
    partOfSpeech?: string;
    definitions?: Array<{ definition?: string; example?: string; synonyms?: string[] }>;
  }>;
  sourceUrls?: string[];
}

export class DictionaryLookupError extends Error {
  constructor(public code: "not-found" | "offline" | "service-error", message: string) {
    super(message);
  }
}

export async function fetchDictionaryEntry(term: string, signal?: AbortSignal): Promise<DictionaryEntry> {
  const word = term.trim().toLowerCase();
  if (!/^[a-z][a-z '-]*$/i.test(word)) throw new DictionaryLookupError("not-found", "请输入有效的英文单词或短语。");

  let response: Response;
  try {
    response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new DictionaryLookupError("offline", "无法连接在线词典，请检查网络后重试。");
  }
  if (response.status === 404) throw new DictionaryLookupError("not-found", "在线词典暂时没有收录这个词。");
  if (!response.ok) throw new DictionaryLookupError("service-error", "在线词典暂时不可用，请稍后重试。");

  const entries = await response.json() as ApiEntry[];
  const first = entries[0];
  if (!first) throw new DictionaryLookupError("not-found", "没有找到该单词的释义。");
  const phoneticItem = first.phonetics?.find((item) => item.text) ?? first.phonetics?.[0];
  const audioItem = first.phonetics?.find((item) => item.audio);
  return {
    word: first.word,
    phonetic: first.phonetic || phoneticItem?.text || "",
    audio: audioItem?.audio,
    meanings: (first.meanings ?? []).map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech || "未分类",
      definitions: (meaning.definitions ?? []).slice(0, 5).filter((item) => item.definition).map((item) => ({
        definition: item.definition!, example: item.example, synonyms: (item.synonyms ?? []).slice(0, 8)
      }))
    })).filter((meaning) => meaning.definitions.length > 0),
    sourceUrl: first.sourceUrls?.[0],
    cachedAt: new Date().toISOString()
  };
}
