/** 难度等级：1 入门 / 2 进阶 / 3 挑战 */
export type Difficulty = 1 | 2 | 3;

/** 英语水平：几乎看不懂 / 简单英文 / 部分技术资料 / 正常阅读文档 */
export type EnglishLevel = "beginner" | "basic" | "intermediate" | "advanced";

/** 学习目标 */
export type LearningGoal =
  | "ui" // 看懂 AI 工具界面
  | "prompt" // 学习提示词
  | "coding" // 使用 AI 编程
  | "docs" // 看懂 API 和技术文档
  | "agent" // 学习 Agent
  | "systematic"; // 系统掌握 AI 英语

/** 掌握程度：0 完全不认识 / 1 有点印象 / 2 基本掌握 / 3 非常熟悉 */
export type Familiarity = 0 | 1 | 2 | 3;

/** 题型（self 表示学习卡片上的自我评估） */
export type QuestionType = "en2zh" | "zh2en" | "fill-blank" | "judge-ai" | "self";

/** 单词分类 */
export interface WordCategory {
  id: string;
  name: string;
  description: string;
  /** Lucide 图标名（字符串），由 CategoryIcon 组件映射 */
  icon: string;
  difficulty: Difficulty;
  sortOrder: number;
  color: string; // 主题色（Tailwind class 片段）
}

/** 单词（种子数据完整结构） */
export interface Word {
  id: string;
  word: string;
  phonetic: string;
  /** 可选：外置发音文件 URL（未提供时用浏览器 TTS） */
  pronunciationUrl?: string;
  coreTranslation: string; // 中文核心释义
  generalMeaning: string; // 普通英语含义
  aiMeaning: string; // AI 领域含义
  memoryTip: string; // 记忆提示
  normalExample: string; // 普通例句
  normalExampleTranslation: string;
  aiExample: string; // AI 场景例句
  aiExampleTranslation: string;
  promptExample: string; // 提示词例句
  collocations: string[]; // 常见搭配
  relatedWords: string[]; // 相关词
  confusedWords: string[]; // 易混淆词
  categoryId: string;
  difficulty: Difficulty;
  tags: string[];
}

/** 用户对单个单词的学习进度 */
export interface WordProgress {
  wordId: string;
  familiarity: Familiarity;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  /** 当前复习间隔（毫秒） */
  intervalMs: number;
  mastered: boolean;
  /** 是否被用户手动加入重点复习 */
  pinned: boolean;
}

/** 学习/答题流水记录 */
export interface StudyRecord {
  id: string;
  wordId: string;
  questionType: QuestionType;
  userAnswer: string;
  isCorrect: boolean;
  familiarity: Familiarity;
  studiedAt: string;
}

/** 错词本条目 */
export interface WrongWordEntry {
  wordId: string;
  wrongCount: number;
  lastWrongAt: string;
  /** 主要出错的题型 */
  mainQuestionType: QuestionType;
  /** 是否已标记掌握（移出错词本） */
  resolved: boolean;
}

/** 收藏 */
export interface Favorite {
  wordId: string;
  folderName: string;
  createdAt: string;
}

/** 用户资料（本地模式） */
export interface UserProfile {
  nickname: string;
  email: string | null;
  englishLevel: EnglishLevel | null;
  learningGoal: LearningGoal | null;
  dailyTarget: number;
  onboarded: boolean;
  selectedCategoryIds: string[];
}

/** 每日统计 */
export interface DailyStat {
  date: string;
  newCount: number;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  durationSec: number;
}

/** 应用整体状态（本地模式持久化到 localStorage） */
export interface AppState {
  profile: UserProfile;
  progress: Record<string, WordProgress>;
  records: StudyRecord[];
  wrongWords: Record<string, WrongWordEntry>;
  favorites: Favorite[];
  /** 自定义收藏夹名称列表 */
  folders: string[];
  /** 有学习行为的日期（用于连续天数计算） */
  studyDates: string[];
  /** 每日统计，key 为日期 */
  dailyStats: Record<string, DailyStat>;
}

/** 练习题（统一结构） */
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  wordId: string;
  prompt: string; // 题干
  options?: string[]; // 选择题选项
  answerIndex?: number; // 选择题正确答案索引
  blankAnswer?: string; // 填空题答案
  statement?: string; // 判断题陈述
  judgmentCorrect?: boolean; // 判断题答案
  explanation: string; // 解析（错误原因）
  aiMeaning: string; // 单词在 AI 场景的真实含义
  example: string; // 一个新例句
  exampleTranslation: string;
}

/** AI 讲解模式 */
export type ExplainMode =
  | "teacher" // 像老师一样解释
  | "plain" // 用大白话解释
  | "case" // 用实际案例解释
  | "analogy" // 用类比解释
  | "prompt-example" // 生成提示词例句
  | "coding-example" // 生成 AI 编程例句
  | "confused"; // 对比易混淆词

export const EXPLAIN_MODES: { value: ExplainMode; label: string; description: string }[] = [
  { value: "teacher", label: "老师讲解", description: "像老师一样详细解释" },
  { value: "plain", label: "大白话", description: "用最简单的话讲明白" },
  { value: "case", label: "实际案例", description: "用真实场景举例" },
  { value: "analogy", label: "类比解释", description: "用熟悉的东西打比方" },
  { value: "prompt-example", label: "提示词例句", description: "生成可用的提示词例句" },
  { value: "coding-example", label: "编程例句", description: "生成 AI 编程相关例句" },
  { value: "confused", label: "易混词对比", description: "对比容易混淆的词" },
];
