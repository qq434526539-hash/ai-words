"use client";

import { Brain, MessageSquare, Wand2, Code2, Bot, Plug, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: Brain,
  "message-square": MessageSquare,
  wand: Wand2,
  code: Code2,
  bot: Bot,
  plug: Plug,
  "triangle-alert": TriangleAlert,
};

export function CategoryIcon({
  name,
  colorClass,
  className,
}: {
  name: string;
  colorClass?: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Brain;
  return <Icon className={cn(className, colorClass)} />;
}
