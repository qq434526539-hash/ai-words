"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, Play, Repeat, Rocket } from "lucide-react";
import { useAppState } from "@/hooks/use-app-state";
import { buildTodayPlan } from "@/lib/plan";
import { formatDueTime } from "@/lib/utils";
import { getWord } from "@/data/words";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default function LearnPage() {
  const state = useAppState();
  const plan = buildTodayPlan(state);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">学习中心</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          先复习到期单词，再学习新词
        </p>
      </div>

      {/* 今日计划卡片 */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-background p-4 text-center">
              <Repeat className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1.5 text-2xl font-bold">{plan.dueCount}</p>
              <p className="text-xs text-muted-foreground">今日待复习</p>
            </div>
            <div className="rounded-xl bg-background p-4 text-center">
              <Rocket className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1.5 text-2xl font-bold">{plan.newWordsCount}</p>
              <p className="text-xs text-muted-foreground">今日新词</p>
            </div>
          </div>

          {plan.isGuest && (
            <p className="mt-3 rounded-lg bg-amber-500/10 p-2.5 text-center text-xs text-amber-600 dark:text-amber-400">
              当前为本地体验模式，可学习前 10 个示例词。注册登录后解锁全部 {105} 词并云同步进度。
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <Link href="/learn/session" className="flex-1">
              <Button size="lg" className="w-full gap-2" disabled={plan.dueCount + plan.newWordsCount === 0}>
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

      {/* 复习队列 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Repeat className="h-4 w-4 text-primary" />
            待复习（{plan.due.length}）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.due.length === 0 ? (
            <EmptyState
              title="没有到期的复习任务"
              description="学完新词后记得回来复习"
            />
          ) : (
            <div className="divide-y divide-border">
              {plan.due.slice(0, 8).map((w) => {
                const word = getWord(w.id);
                return (
                  <div key={w.id} className="flex items-center gap-3 py-2.5">
                    <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{word?.word}</p>
                      <p className="truncate text-xs text-muted-foreground">{word?.coreTranslation}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {state.progress[w.id]?.nextReviewAt
                        ? formatDueTime(state.progress[w.id].nextReviewAt!)
                        : "今天到期"}
                    </Badge>
                  </div>
                );
              })}
              {plan.due.length > 8 && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  还有 {plan.due.length - 8} 个，开始学习后按顺序复习
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 今日新词预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Rocket className="h-4 w-4 text-primary" />
            今日新词（{plan.newWords.length}）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.newWords.length === 0 ? (
            <EmptyState
              title="新词已学完"
              description="明天会生成新的学习任务"
            />
          ) : (
            <div className="divide-y divide-border">
              {plan.newWords.slice(0, 8).map((w) => {
                const word = getWord(w.id);
                return (
                  <div key={w.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{word?.word}</p>
                      <p className="truncate text-xs text-muted-foreground">{word?.coreTranslation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
