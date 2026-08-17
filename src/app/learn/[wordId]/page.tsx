"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, BookMarked, Pin } from "lucide-react";
import { toast } from "sonner";
import type { Familiarity } from "@/lib/types";
import { getWord } from "@/data/words";
import { useAppState } from "@/hooks/use-app-state";
import { pinForReview, setFamiliarity } from "@/lib/store";
import { FAMILIARITY_LABELS } from "@/lib/srs";
import { WordCard } from "@/components/features/word-card";
import { AiExplainPanel } from "@/components/features/ai-explain-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FAMILIARITY_STYLES: Record<Familiarity, string> = {
  0: "border-destructive text-destructive hover:bg-destructive/10",
  1: "border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10",
  2: "border-primary text-primary hover:bg-primary/10",
  3: "border-success text-success hover:bg-success/10",
};

export default function WordDetailPage({ params }: { params: { wordId: string } }) {
  const { wordId } = params;
  const word = getWord(wordId);
  const state = useAppState();
  const router = useRouter();

  if (!word) notFound();

  const currentFamiliarity = state.progress[wordId]?.familiarity ?? 0;

  const handlePin = () => {
    pinForReview(wordId);
    toast.success("已加入重点复习（10 分钟后复习）");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> 返回
        </button>
        <Link
          href={`/practice?source=category&category=${word.categoryId}`}
          className="flex items-center gap-1 text-sm text-primary"
        >
          <BookMarked className="h-4 w-4" /> 练本词库
        </Link>
      </div>

      <WordCard word={word} />

      {/* 调整熟悉度 */}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">调整掌握程度</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {([0, 1, 2, 3] as Familiarity[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFamiliarity(wordId, f);
                toast.success(`已标记为「${FAMILIARITY_LABELS[f]}」`);
              }}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm transition-colors",
                FAMILIARITY_STYLES[f],
                currentFamiliarity === f && "bg-secondary/60"
              )}
            >
              {FAMILIARITY_LABELS[f]}
            </button>
          ))}
        </div>
      </section>

      <Button variant="outline" className="w-full gap-2" onClick={handlePin}>
        <Pin className="h-4 w-4" />
        加入重点复习
      </Button>

      <AiExplainPanel word={word} />
    </div>
  );
}
