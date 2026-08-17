export interface DailyTip {
  title: string;
  content: string;
}

/** 首页「今日 AI 英语小知识」轮换内容 */
export const DAILY_TIPS: DailyTip[] = [
  {
    title: "prompt 不只是「提示词」",
    content: "prompt 作形容词还表示「迅速的」。AI 语境下记住：prompt = 你对 AI 说的话。",
  },
  {
    title: "token 是 AI 的计费单位",
    content: "英文里 token 有「代币」的意思。AI 按 token 收费，1 个英文单词大约 1.3 个 token。",
  },
  {
    title: "temperature 控制「脑洞」",
    content: "temperature 越高，AI 回答越有创意但越不稳定；越低越保守可靠。写代码建议调低。",
  },
  {
    title: "context window 决定记忆力",
    content: "context window（上下文窗口）越大，AI 一次能记住的对话越多。它用 token 衡量。",
  },
  {
    title: "hallucination = AI 说胡话",
    content: "hallucination（幻觉）指 AI 一本正经地编造信息。重要事实务必自己核实。",
  },
  {
    title: "fine-tuning 是「针对性训练」",
    content: "fine-tuning（微调）让通用模型在特定数据上再训练，变成某个领域的专家。",
  },
  {
    title: "API 报错里的 status code",
    content: "200 成功、400 参数错、401 未认证、404 不存在、429 太频繁、500 服务器错。",
  },
  {
    title: "rate limit 是「限速」",
    content: "rate limit 限制单位时间请求次数，超出会报 429。控制循环速度可避免。",
  },
  {
    title: "agent 是「会办事的 AI」",
    content: "agent（智能体）不仅能聊天，还能调用工具、执行步骤、自动完成任务。",
  },
  {
    title: "refine 让答案更好",
    content: "refine（打磨）提示词 = 根据上一次结果不断微调，好的提示词都是迭代出来的。",
  },
];
