import { Bot, Brain, Code2, MessageSquare, Plug, Sparkles, TriangleAlert } from "lucide-react";

const icons = {
  brain: Brain,
  "message-square": MessageSquare,
  wand: Sparkles,
  code: Code2,
  bot: Bot,
  plug: Plug,
  "triangle-alert": TriangleAlert
};

export function CategoryIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Brain;
  return <Icon className="h-5 w-5" />;
}
