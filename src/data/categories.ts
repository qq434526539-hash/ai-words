import type { WordCategory, LearningGoal, EnglishLevel } from "@/lib/types";

/** 7 大 AI 场景词库（与 supabase/schema.sql 中 word_categories 对应） */
export const CATEGORIES: WordCategory[] = [
  {
    id: "ai-basics",
    name: "AI 基础词汇",
    description: "模型、数据、训练、推理等 AI 对话和文章中最常出现的基础词",
    icon: "brain",
    difficulty: 1,
    sortOrder: 1,
    color: "text-sky-600 dark:text-sky-400",
  },
  {
    id: "llm-chatgpt",
    name: "大模型与 ChatGPT",
    description: "prompt、context window、hallucination 等使用大模型必备词汇",
    icon: "message-square",
    difficulty: 1,
    sortOrder: 2,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "prompt-engineering",
    name: "提示词工程",
    description: "写提示词时的高频词：指令、角色、约束、示例、格式",
    icon: "wand",
    difficulty: 2,
    sortOrder: 3,
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "ai-coding",
    name: "AI 编程",
    description: "用 Cursor / Codex 编程时遇到的仓库、分支、部署、调试词汇",
    icon: "code",
    difficulty: 2,
    sortOrder: 4,
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "agent",
    name: "Agent 与自动化",
    description: "智能体、工具调用、记忆、工作流、权限等 Agent 领域词汇",
    icon: "bot",
    difficulty: 2,
    sortOrder: 5,
    color: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "api-docs",
    name: "API 与技术文档",
    description: "看接口文档必需的词：endpoint、authentication、rate limit",
    icon: "plug",
    difficulty: 2,
    sortOrder: 6,
    color: "text-indigo-600 dark:text-indigo-400",
  },
  {
    id: "error-messages",
    name: "常见报错词汇",
    description: "看懂报错信息：failed、invalid、timeout、denied 等",
    icon: "triangle-alert",
    difficulty: 1,
    sortOrder: 7,
    color: "text-red-600 dark:text-red-400",
  },
];

/** 学习目标 → 推荐词库 */
export const GOAL_RECOMMENDATIONS: Record<LearningGoal, string[]> = {
  ui: ["ai-basics", "llm-chatgpt", "error-messages"],
  prompt: ["prompt-engineering", "llm-chatgpt"],
  coding: ["ai-coding", "error-messages", "api-docs"],
  docs: ["api-docs", "ai-basics"],
  agent: ["agent", "api-docs"],
  systematic: ["ai-basics", "llm-chatgpt", "prompt-engineering", "ai-coding", "agent", "api-docs", "error-messages"],
};

export const GOAL_OPTIONS: { value: LearningGoal; label: string; description: string }[] = [
  { value: "ui", label: "看懂 AI 工具界面", description: "ChatGPT / Claude / Cursor 的界面词汇" },
  { value: "prompt", label: "学习提示词", description: "提示词工程的常用表达" },
  { value: "coding", label: "使用 AI 编程", description: "配合 AI 写代码的词汇" },
  { value: "docs", label: "看懂 API 和技术文档", description: "接口文档与开发文档词汇" },
  { value: "agent", label: "学习 Agent", description: "智能体与自动化词汇" },
  { value: "systematic", label: "系统掌握 AI 英语", description: "全部词库系统学习" },
];

export const ENGLISH_LEVEL_OPTIONS: { value: EnglishLevel; label: string }[] = [
  { value: "beginner", label: "几乎看不懂英文" },
  { value: "basic", label: "能看懂简单英文" },
  { value: "intermediate", label: "能阅读部分技术资料" },
  { value: "advanced", label: "可以正常阅读英文文档" },
];

export const DAILY_TARGET_OPTIONS = [5, 10, 20];
