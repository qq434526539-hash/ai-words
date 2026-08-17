import type { QuestionType, QuizQuestion, StudyRecord, Word } from "@/lib/types";

const QUESTION_TYPES: QuestionType[] = ["en2zh", "zh2en", "fill-blank", "judge-ai"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(pool: Word[], excludeId: string, count: number, skip: (w: Word) => boolean): Word[] {
  const candidates = pool.filter((w) => w.id !== excludeId && !skip(w));
  return shuffle(candidates).slice(0, count);
}

/** 在例句中找出目标单词并替换为下划线；找不到返回 null */
function blankWordInSentence(sentence: string, word: string): { prompt: string; answer: string } | null {
  const lower = sentence.toLowerCase();
  const target = word.toLowerCase();
  const idx = lower.indexOf(target);
  if (idx >= 0) {
    const matched = sentence.slice(idx, idx + target.length);
    const prompt = sentence.slice(0, idx) + "______" + sentence.slice(idx + target.length);
    return { prompt, answer: matched };
  }
  return null;
}

/** 从常见搭配中构造填空题（如 system ______） */
function blankCollocation(collocations: string[], word: string): { prompt: string; answer: string } | null {
  const target = word.toLowerCase();
  for (const col of collocations) {
    const parts = col.toLowerCase().split(/\s+/);
    const idx = parts.indexOf(target);
    if (idx >= 0) {
      parts[idx] = "______";
      return { prompt: parts.join(" "), answer: word };
    }
  }
  return null;
}

function buildQuestion(word: Word, type: QuestionType, pool: Word[]): QuizQuestion | null {
  const base = {
    type,
    wordId: word.id,
    explanation: "",
    aiMeaning: word.aiMeaning,
    example: word.aiExample,
    exampleTranslation: word.aiExampleTranslation,
  };

  switch (type) {
    case "en2zh": {
      const distractors = pickDistractors(pool, word.id, 3, (w) => w.coreTranslation === word.coreTranslation);
      const options = shuffle([word.coreTranslation, ...distractors.map((w) => w.coreTranslation)]);
      return {
        ...base,
        id: `en2zh-${word.id}`,
        prompt: word.word,
        options,
        answerIndex: options.indexOf(word.coreTranslation),
        explanation: `正确答案是「${word.coreTranslation}」。${word.memoryTip}`,
      };
    }
    case "zh2en": {
      const distractors = pickDistractors(pool, word.id, 3, (w) => w.word === word.word);
      const options = shuffle([word.word, ...distractors.map((w) => w.word)]);
      return {
        ...base,
        id: `zh2en-${word.id}`,
        prompt: word.coreTranslation,
        options,
        answerIndex: options.indexOf(word.word),
        explanation: `正确答案是「${word.word}」。AI 场景中它表示：${word.aiMeaning}`,
      };
    }
    case "fill-blank": {
      const blanked =
        blankWordInSentence(word.aiExample, word.word) ?? blankCollocation(word.collocations, word.word);
      if (!blanked) return null;
      return {
        ...base,
        id: `fill-${word.id}`,
        prompt: `AI 场景填空：${blanked.prompt}`,
        blankAnswer: blanked.answer,
        explanation: `此处应填「${blanked.answer}」。${word.aiMeaning}`,
      };
    }
    case "judge-ai": {
      const isTrue = Math.random() < 0.5;
      const wrongSource = pickDistractors(pool, word.id, 1, () => false)[0];
      const wrongMeaning = wrongSource ? wrongSource.aiMeaning : word.generalMeaning;
      const statement = isTrue
        ? `“${word.word}” 在 AI 场景中：${word.aiMeaning}`
        : `“${word.word}” 在 AI 场景中：${wrongMeaning}`;
      return {
        ...base,
        id: `judge-${word.id}`,
        prompt: `判断下面的 AI 含义是否正确`,
        statement,
        judgmentCorrect: isTrue,
        explanation: `“${word.word}” 在 AI 场景中的真实含义是：${word.aiMeaning}`,
      };
    }
    default:
      return null;
  }
}

/**
 * 生成一组练习题。
 * @param words 出题词池
 * @param count 题目数量
 * @param exclude 已出过的题（格式 wordId:type），用于同一天避免重复
 */
export function buildQuizQuestions(words: Word[], count = 10, exclude: Set<string> = new Set()): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const shuffled = shuffle(words);
  let typeIndex = 0;

  for (const word of shuffled) {
    if (questions.length >= count) break;
    const type = QUESTION_TYPES[typeIndex % QUESTION_TYPES.length];
    typeIndex += 1;
    const key = `${word.id}:${type}`;
    if (exclude.has(key)) continue;
    const q = buildQuestion(word, type, shuffled);
    if (q) questions.push(q);
  }
  return questions;
}

/** 今天已出过的题集合（wordId:type），保证同一天不重复出完全相同的题 */
export function buildAskedTodaySet(records: StudyRecord[], today: string): Set<string> {
  const set = new Set<string>();
  for (const r of records) {
    if (r.studiedAt.startsWith(today) || new Date(r.studiedAt).toDateString() === new Date().toDateString()) {
      if (r.questionType !== "self") set.add(`${r.wordId}:${r.questionType}`);
    }
  }
  return set;
}
