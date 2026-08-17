"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { buildTodayPlan, computeLearningStats } from "@/lib/plan";
import { DAILY_TIPS } from "@/lib/tips";
import { CATEGORIES } from "@/data/categories";
import { getWordsByCategory } from "@/data/words";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/features/progress-ring";
import { CategoryIcon } from "@/components/features/category-icon";
import { Progress } from "@/components/ui/progress";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 12) return "早上好";
  if (h < 18) return "下午好";
  return "晚上好";
}

export default function HomePage() {
  const state = useAppState();
  const plan = buildTodayPlan(state);
  const stats = computeLearningStats(state);

  const totalProgress = Math.round((stats.learned / stats.totalWords) * 100);
  const doneToday = plan.dueCount === 0 && plan.newWordsCount === 0;

  // 今日小知识：按日期轮换
  const tipIndex = new Date().getDate() % DAILY_TIPS.length;
  const tip = DAILY_TIPS[tipIndex];

  // 最近学习的词库（按最后复习时间排序，取前 3）
  const recentCategories = CATEGORIES.map((cat) => {
    const words = getWordsByCategory(cat.id);
    const lastTime = words.reduce<number>((max, w) => {
      const t = state.progress[w.id]?.lastReviewedAt;
      return t ? Math.max(max, new Date(t).getTime()) : max;
    }, 0);
    return { cat, lastTime };
  })
    .filter((c) => c.lastTime > 0)
    .sort((a, b) => b.lastTime - a.lastTime)
    .slice(0, 3);

  return (
    <div className="space-y-5">
      {/* 顶部问候 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
          </p>
          <h1 className="text-xl font-bold">
            {greeting()}，{state.profile.nickname || "同学"}
          </h1>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          连续 {stats.streak} 天
        </Badge>
      </div>

      {/* 未完成引导 */}
      {!state.profile.onboarded && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm font-medium">先花 30 秒完成学习设置</p>
                <p className="text-xs text-muted-foreground">选择目标，我们会推荐适合你的词库</p>
              </div>
            </div>
            <Link href="/onboarding">
              <Button size="sm">去设置</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 今日任务 */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">今日任务</p>
            <Badge variant="outline" className="gap-1">
              <Target className="h-3 w-3" />
              每日 {state.profile.dailyTarget} 词
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-5">
            <ProgressRing value={doneToday ? 100 : 0} size={84}>
              <span className="text-xl font-bold">{doneToday ? 100 : 0}</span>
              <span className="text-[10px] text-muted-foreground">今日完成%</span>
            </ProgressRing>

            <div className="grid flex-1 grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/60 p-3">
                <p className="text-xs text-muted-foreground">今日新词</p>
                <p className="mt-0.5 text-xl font-bold">{plan.newWordsCount}</p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-3">
                <p className="text-xs text-muted-foreground">待复习</p>
                <p className="mt-0.5 text-xl font-bold">{plan.dueCount}</p>
              </div>
            </div>
          </div>

          {doneToday ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              今天的任务完成啦，去练几道题巩固一下吧！
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              先复习到期的 {plan.dueCount} 个词，再学 {plan.newWordsCount} 个新词
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <Link href="/learn/session" className="flex-1">
              <Button size="lg" className="w-full gap-2" disabled={doneToday}>
                <Play className="h-5 w-5" />
                开始今日学习
              </Button>
            </Link>
            <Link href="/practice">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-5 w-5" />
                练习
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 学习概况 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="累计学习" value={`${stats.studyDays} 天`} />
        <StatCard label="已掌握" value={`${stats.mastered} 词`} />
        <StatCard label="总进度" value={`${totalProgress}%`} />
      </div>
      <div className="px-1">
        <Progress value={totalProgress} className="h-1.5" />
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          已学 {stats.learned} / {stats.totalWords} 词
        </p>
      </div>

      {/* 最近学习的词库 */}
      {recentCategories.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">最近学习的词库</h2>
            <Link href="/libraries" className="flex items-center text-xs text-primary">
              全部词库 <ArrowRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentCategories.map(({ cat }) => (
              <Link key={cat.id} href={`/libraries/${cat.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="flex items-center gap-3 p-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CategoryIcon name={cat.icon} colorClass={cat.color} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{cat.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 今日 AI 英语小知识 */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">今日 AI 英语小知识</p>
          </div>
          <p className="mt-2 text-sm font-medium">{tip.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{tip.content}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3 text-center">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
