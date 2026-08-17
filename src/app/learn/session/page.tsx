"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, PartyPopper } from "lucide-react";
import type { Familiarity, Word } from "@/lib/types";
import { setFamiliarity } from "@/lib/store";
import { buildTodayPlan, getDueWords } from "@/lib/plan";
import { getWordsByCategory } from "@/data/words";
import { useAppState } from "@/hooks/use-app-state";
import { FAMILIARITY_LABELS } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WordCard } from "@/components/features/word-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const FAMILIARITY_ORDER: { value: Familiarity; className: string; activeClass: string }[] = [
  { value: 0, className: "", activeClass: "bg-destructive text-destructive-foreground" },
  { value: 1, className: "", activeClass: "bg-amber-500 text-white" },
  { value: 2, className: "", activeClass: "bg-primary text-primary-foreground" },
  { value: 3, className: "", activeClass: "bg-success text-success-foreground" },
];

function SessionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useAppState();

  // 进入页面时一次性构建队列（刷新后重新构建，进度已通过 localStorage 保存）
  const queue = useMemo<Word[]>(() => {
    const categoryId = searchParams.get("category");
    if (categoryId) {
      const due = getDueWords(state).filter((w) => w.categoryId === categoryId);
      const learned = new Set(Object.keys(state.progress));
      const news = getWordsByCategory(categoryId)
        .filter((w) => !learned.has(w.id))
        .slice(0, Math.max(0, state.profile.dailyTarget - due.length));
      return [...due, ...news];
    }
    const plan = buildTodayPlan(state);
    return [...plan.due, ...plan.newWords];
  }, []);

  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = queue[index];

  const choose = (f: Familiarity) => {
    if (!current) return;
    setFamiliarity(current.id, f);
    setDone((d) => d + 1);
    if (index + 1 >= queue.length) setFinished(true);
    else setIndex((i) => i + 1);
  };

  if (queue.length === 0 && !finished) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8 text-success" />}
          title="今天的学习任务已完成！"
          description="没有待复习和新学的单词了，去练习巩固一下吧。"
          action={
            <Link href="/practice">
              <Button>去做练习</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <PartyPopper className="h-12 w-12 text-primary" />
        <h1 className="text-xl font-bold">太棒了！</h1>
        <p className="text-sm text-muted-foreground">
          今日学习完成，共学习了 {done} 个单词
        </p>
        <div className="mt-2 flex gap-2">
          <Link href="/practice">
            <Button className="gap-2">
              开始练习
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 顶部：进度 + 退出 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
          aria-label="退出学习"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Progress value={(index / queue.length) * 100} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground">
          {index + 1} / {queue.length}
        </span>
      </div>

      {/* 单词卡片 */}
      <div key={current.id} className="animate-fade-in">
        <WordCard word={current} />
      </div>

      {/* 掌握程度选择 */}
      <div className="sticky bottom-20 space-y-2 md:bottom-6">
        <p className="text-center text-xs text-muted-foreground">你认识这个词吗？选择后会安排下次复习</p>
        <div className="grid grid-cols-2 gap-2">
          {FAMILIARITY_ORDER.map((f) => (
            <Button
              key={f.value}
              size="lg"
              variant="outline"
              onClick={() => choose(f.value)}
              className={cn("w-full", f.activeClass)}
            >
              {FAMILIARITY_LABELS[f.value]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LearnSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">加载学习中…</div>}>
      <SessionInner />
    </Suspense>
  );
}
