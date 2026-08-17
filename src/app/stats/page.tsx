"use client";

import { AlertTriangle, BarChart3, BookOpen, CheckCircle2, Flame, Repeat, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppState } from "@/hooks/use-app-state";
import {
  computeLearningStats,
  getCategoryProgress,
  getRecent7Days,
  getTopWrongWords,
  getWeakestCategories,
} from "@/lib/plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/features/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StatsPage() {
  const state = useAppState();
  const stats = computeLearningStats(state);
  const week = getRecent7Days(state);
  const categoryProgress = getCategoryProgress(state);
  const weakest = getWeakestCategories(state);
  const topWrong = getTopWrongWords(state);

  const hasData = stats.learned > 0;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">学习统计</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">看看你的坚持和薄弱环节</p>
      </div>

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="累计天数" value={stats.studyDays} icon={BarChart3} />
        <Stat label="连续天数" value={stats.streak} icon={Flame} />
        <Stat label="已学单词" value={stats.learned} icon={BookOpen} />
        <Stat label="已掌握" value={stats.mastered} icon={CheckCircle2} />
        <Stat label="待复习" value={stats.due} icon={Repeat} />
        <Stat label="总正确率" value={`${stats.accuracy}%`} icon={Target} />
      </div>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 className="h-8 w-8" />}
          title="还没有学习数据"
          description="完成首次学习后，这里会展示你的统计"
          action={
            <Link href="/learn">
              <Button>去学习</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* 最近 7 天 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">最近 7 天学习量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={week} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      formatter={(value: number) => [`${value} 词`, "学习量"]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 词库进度 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">各词库掌握进度</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryProgress.map((cp) => (
                <div key={cp.category.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CategoryIcon name={cp.category.icon} colorClass={cp.category.color} className="h-3.5 w-3.5" />
                      {cp.category.name}
                    </span>
                    <span className="text-muted-foreground">
                      {cp.learned}/{cp.total} 词
                    </span>
                  </div>
                  <Progress value={cp.percent} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 薄弱分类 + 最易错 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> 最薄弱分类
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weakest.length === 0 ? (
                  <p className="text-sm text-muted-foreground">数据不足，多学几类词再看看</p>
                ) : (
                  <div className="space-y-2">
                    {weakest.map((w) => (
                      <div key={w.category.id} className="flex items-center justify-between text-sm">
                        <span>{w.category.name}</span>
                        <Badge variant="destructive">{w.accuracy}%</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Target className="h-4 w-4 text-destructive" /> 最容易出错
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topWrong.length === 0 ? (
                  <p className="text-sm text-muted-foreground">没有错词，太棒了！</p>
                ) : (
                  <div className="space-y-2">
                    {topWrong.map(({ entry, word }) => (
                      <div key={entry.wordId} className="flex items-center justify-between text-sm">
                        <Link href={`/learn/${entry.wordId}`} className="hover:text-primary">
                          {word?.word}
                        </Link>
                        <Badge variant="outline">错 {entry.wrongCount} 次</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-3.5 text-center">
        <Icon className="mx-auto h-4 w-4 text-primary" />
        <p className="mt-1.5 text-lg font-bold">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
