import type { ExplainMode, EnglishLevel, Word } from "@/lib/types";

/**
 * 本地模拟 AI 讲解（未配置 API 或调用失败时使用）
 * 纯函数，根据单词数据和解释模式拼装中文讲解。
 */
export function mockExplain(word: Word, level: EnglishLevel, mode: ExplainMode): string {
  const beginner = level === "beginner" || level === "basic";

  switch (mode) {
    case "teacher":
      return [
        `【老师讲解】${word.word} ${word.phonetic}`,
        ``,
        `核心释义：${word.coreTranslation}`,
        ``,
        `① 普通含义：${word.generalMeaning}`,
        `② AI 领域含义：${word.aiMeaning}`,
        ``,
        `AI 场景例句：${word.aiExample}`,
        `中文翻译：${word.aiExampleTranslation}`,
        ``,
        `记忆提示：${word.memoryTip}`,
        ``,
        `常见搭配：${word.collocations.join("、")}`,
      ].join("\n");

    case "plain":
      return [
        `用大白话说，「${word.word}」就是「${word.coreTranslation}」。`,
        ``,
        beginner
          ? `简单理解：${word.aiMeaning}`
          : `更具体一点：${word.aiMeaning}`,
        ``,
        `记法：${word.memoryTip}`,
      ].join("\n");

    case "case":
      return [
        `实际案例：${word.aiExample}`,
        `翻译：${word.aiExampleTranslation}`,
        ``,
        `在真实使用中，你可以这样用它：`,
        `提示词示例：${word.promptExample}`,
      ].join("\n");

    case "analogy":
      return [
        `类比理解「${word.word}」：`,
        ``,
        `${word.memoryTip}`,
        ``,
        `换句话说：${word.aiMeaning}`,
      ].join("\n");

    case "prompt-example":
      return [
        `给你几个可直接套用的提示词例句：`,
        ``,
        `1. ${word.promptExample}`,
        `2. 请解释「${word.word}」在 AI 场景中的含义，并给出 3 个例句。`,
        `3. 用「${word.word}」造句，语气要${beginner ? "简单" : "专业"}。`,
      ].join("\n");

    case "coding-example":
      return [
        `AI 编程场景：`,
        `${word.aiExample}`,
        `翻译：${word.aiExampleTranslation}`,
        ``,
        `当你在 Cursor / Codex / 终端里看到 ${word.word} 时，通常表示「${word.coreTranslation}」。`,
        `可以让 AI 帮你：用 ${word.word} 写一个带注释的示例代码。`,
      ].join("\n");

    case "confused":
      if (word.confusedWords.length) {
        return [
          `易混词对比：`,
          ``,
          `「${word.word}」${word.coreTranslation}：${word.aiMeaning}`,
          ...word.confusedWords.map((c) => `「${c}」：容易混淆，注意区分上下文。`),
          ``,
          `记法：${word.memoryTip}`,
        ].join("\n");
      }
      return mockExplain(word, level, "teacher");

    default:
      return mockExplain(word, level, "teacher");
  }
}
