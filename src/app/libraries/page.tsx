"use client";

import Link from "next/link";
import { ArrowRight, Library } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { getWordsByCategory } from "@/data/words";
import { useAppState } from "@/hooks/use-app-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/features/category-icon";
import { EmptyState } from "@/components/ui/empty-state";

export default function LibrariesPage() {
  const state = useAppState();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">AI 词库</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          按 AI 实际任务划分，共 {CATEGORIES.length} 个场景词库
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const words = getWordsByCategory(cat.id);
          const learned = words.filter((w) => state.progress[w.id]).length;
          const mastered = words.filter((w) => state.progress[w.id]?.mastered).length;
          const percent = words.length ? Math.round((learned / words.length) * 100) : 0;
          const difficultyLabel = cat.difficulty === 1 ? "入门" : cat.difficulty === 2 ? "进阶" : "挑战";

          return (
            <Link key={cat.id} href={`/libraries/${cat.id}`}>
              <Card className="h-full transition-colors hover:bg-accent/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <CategoryIcon name={cat.icon} colorClass={cat.color} className="h-5 w-5" />
                    </span>
                    <Badge variant="outline">{difficultyLabel}</Badge>
                  </div>

                  <h2 className="mt-3 text-base font-semibold">{cat.name}</h2>
                  <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                    {cat.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{words.length} 词</span>
                    <span>·</span>
                    <span>已学 {learned}</span>
                    {mastered > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-success">已掌握 {mastered}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-2">
                    <Progress value={percent} className="h-1.5" />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={percent === 100 ? "text-success" : "text-primary"}>
                      {percent === 100 ? "已完成" : `掌握 ${percent}%`}
                    </span>
                    <span className="flex items-center text-primary">
                      开始学习 <ArrowRight className="ml-0.5 h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <EmptyState
        icon={<Library className="h-8 w-8" />}
        title="词库会持续扩充"
        description="后续版本将加入更多 AI 场景：多模态、语音、图像生成等"
      />
    </div>
  );
}
