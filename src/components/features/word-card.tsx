"use client";

import { Heart, Lightbulb, BookMarked } from "lucide-react";
import type { Word } from "@/lib/types";
import { useAppState } from "@/hooks/use-app-state";
import { toggleFavorite } from "@/lib/store";
import { FAMILIARITY_LABELS } from "@/lib/srs";
import { formatDueTime } from "@/lib/utils";
import { CATEGORIES } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { PronounceButton } from "@/components/features/pronounce-button";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABEL: Record<number, { label: string; className: string }> = {
  1: { label: "入门", className: "bg-success/15 text-success" },
  2: { label: "进阶", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  3: { label: "挑战", className: "bg-destructive/15 text-destructive" },
};

/** 完整单词卡片（学习会话 / 单词详情共用） */
export function WordCard({ word }: { word: Word }) {
  const state = useAppState();
  const category = CATEGORIES.find((c) => c.id === word.categoryId);
  const progress = state.progress[word.id];
  const isFavorite = state.favorites.some(
    (f) => f.wordId === word.id && f.folderName === "默认收藏夹"
  );

  return (
    <div className="space-y-4">
      {/* 头部：分类 + 难度 + 收藏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {category && <Badge variant="secondary">{category.name}</Badge>}
          <Badge className={DIFFICULTY_LABEL[word.difficulty].className}>
            {DIFFICULTY_LABEL[word.difficulty].label}
          </Badge>
        </div>
        <button
          onClick={() => toggleFavorite(word.id, "默认收藏夹")}
          aria-label={isFavorite ? "取消收藏" : "收藏"}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
            isFavorite ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>
      </div>

      {/* 单词（视觉中心） */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <h2 className="text-3xl font-extrabold tracking-tight">{word.word}</h2>
          <PronounceButton text={word.word} url={word.pronunciationUrl} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{word.phonetic}</p>
        <p className="mt-2 text-lg font-semibold text-primary">{word.coreTranslation}</p>
      </div>

      {progress && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>熟悉度：{FAMILIARITY_LABELS[progress.familiarity]}</span>
          {progress.nextReviewAt && (
            <>
              <span>·</span>
              <span>下次复习：{formatDueTime(progress.nextReviewAt)}</span>
            </>
          )}
        </div>
      )}

      {/* 含义 */}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">🔤 普通含义</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{word.generalMeaning}</p>
      </section>

      <section className="rounded-xl border border-primary/25 bg-primary/5 p-4">
        <h3 className="text-sm font-semibold">🤖 AI 领域含义</h3>
        <p className="mt-1.5 text-sm leading-relaxed">{word.aiMeaning}</p>
      </section>

      {/* 例句 */}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">💬 AI 场景例句</h3>
        <p className="mt-1.5 text-sm font-medium leading-relaxed">{word.aiExample}</p>
        <p className="mt-1 text-sm text-muted-foreground">{word.aiExampleTranslation}</p>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">📖 普通例句</h3>
        <p className="mt-1.5 text-sm leading-relaxed">{word.normalExample}</p>
        <p className="mt-1 text-sm text-muted-foreground">{word.normalExampleTranslation}</p>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <BookMarked className="h-4 w-4 text-primary" />
          提示词例句
        </h3>
        <p className="mt-1.5 rounded-lg bg-secondary/60 p-2.5 text-sm font-mono leading-relaxed">
          {word.promptExample}
        </p>
      </section>

      {/* 搭配 */}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">🔗 常见搭配</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {word.collocations.map((c) => (
            <span key={c} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* 相关词 / 易混词 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">相关词</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {word.relatedWords.map((w) => (
              <span key={w} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                {w}
              </span>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-4">
          <h3 className="text-sm font-semibold">易混淆词</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {word.confusedWords.map((w) => (
              <span key={w} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-600 dark:text-amber-400">
                {w}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* 记忆提示 */}
      <section className="flex gap-2.5 rounded-xl bg-secondary/50 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="text-sm leading-relaxed">{word.memoryTip}</p>
      </section>
    </div>
  );
}
