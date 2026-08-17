import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并 Tailwind 类名（shadcn/ui 标准工具） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 格式化日期为 YYYY-MM-DD（本地时区） */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 距下一个复习日的友好文案 */
export function formatDueTime(nextReviewAt: string): string {
  const diff = new Date(nextReviewAt).getTime() - Date.now();
  if (diff <= 0) return "今天到期";
  const hours = Math.round(diff / 3600000);
  if (hours < 24) return `${hours} 小时后`;
  const days = Math.round(hours / 24);
  return `${days} 天后`;
}
