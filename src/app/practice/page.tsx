"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_WORDS, getWordsByCategory } from "@/data/words";
import { buildAskedTodaySet } from "@/lib/quiz";
import { useAppState } from "@/hooks/use-app-state";
import { QuizRunner } from "@/components/features/quiz-runner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

function PracticeInner() {
  const searchParams = useSearchParams();
  const state = useAppState();

  const source = searchParams.get("source") ?? "today";
  const categoryId = searchParams.get("category");

  const pool = useMemo(() => {
    if (source === "all") return ALL_WORDS;
    if (source === "category" && categoryId) return getWordsByCategory(categoryId);
    if (source === "wrong") {
      const ids = Object.values(state.wrongWords)
        .filter((w) => !w.resolved)
        .map((w) => w.wordId);
      return ALL_WORDS.filter((w) => ids.includes(w.id));
    }
    // 默认 today：今天学过的词；没有则用全部词库兜底
    const today = new Date().toDateString();
    const todayIds = new Set(
      state.records.filter((r) => new Date(r.studiedAt).toDateString() === today).map((r) => r.wordId)
    );
    const todayWords = ALL_WORDS.filter((w) => todayIds.has(w.id));
    return todayWords.length ? todayWords : ALL_WORDS;
  }, [source, categoryId, state.records, state.wrongWords]);

  const exclude = useMemo(
    () => buildAskedTodaySet(state.records, new Date().toDateString()),
    [state.records]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">练习</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">四种题型混合，巩固今日所学</p>
        </div>
      </div>

      {pool.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="h-8 w-8" />}
          title="暂时没有可练习的单词"
          description="先去学习页学几个词，再回来练习"
          action={
            <Link href="/learn">
              <Button>去学习</Button>
            </Link>
          }
        />
      ) : (
        <QuizRunner key={`${source}-${categoryId ?? ""}`} pool={pool} exclude={exclude} />
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">加载练习中…</div>}>
      <PracticeInner />
    </Suspense>
  );
}
