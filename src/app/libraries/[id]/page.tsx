"use client";

import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Circle, Play } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/data/categories";
import { getWordsByCategory } from "@/data/words";
import { useAppState } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/features/category-icon";

export default function LibraryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const category = CATEGORIES.find((c) => c.id === id);
  const state = useAppState();
  const router = useRouter();

  if (!category) notFound();

  const words = getWordsByCategory(category.id);
  const learned = words.filter((w) => state.progress[w.id]).length;
  const percent = words.length ? Math.round((learned / words.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 返回
      </button>

      {/* 词库头部 */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <CategoryIcon name={category.icon} colorClass={category.color} className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{category.name}</h1>
              <Badge variant="outline">{category.difficulty === 1 ? "入门" : category.difficulty === 2 ? "进阶" : "挑战"}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Progress value={percent} className="h-2 flex-1" />
          <span className="text-sm font-medium">
            {learned}/{words.length}
          </span>
        </div>

        <Link href={`/learn/session?category=${category.id}`} className="mt-4 block">
          <Button className="w-full gap-2" size="lg">
            <Play className="h-5 w-5" />
            开始学习本词库
          </Button>
        </Link>
      </div>

      {/* 单词列表 */}
      <div className="divide-y divide-border rounded-xl border bg-card">
        {words.map((word, i) => {
          const progress = state.progress[word.id];
          const isMastered = progress?.mastered;
          return (
            <Link
              key={word.id}
              href={`/learn/${word.id}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
            >
              <span className="w-6 text-center text-xs text-muted-foreground">{i + 1}</span>
              {isMastered ? (
                <Check className="h-4 w-4 shrink-0 text-success" />
              ) : progress ? (
                <Circle className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{word.word}</p>
                <p className="truncate text-xs text-muted-foreground">{word.coreTranslation}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
