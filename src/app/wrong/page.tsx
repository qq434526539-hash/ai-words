"use client";

import Link from "next/link";
import { useState } from "react";
import { BookX, CheckCircle2, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "@/data/categories";
import { getWord } from "@/data/words";
import { useAppState } from "@/hooks/use-app-state";
import { removeWrongWord, resolveWrongWord } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";

const TYPE_LABEL: Record<string, string> = {
  en2zh: "看英选中",
  zh2en: "看中选英",
  "fill-blank": "场景填空",
  "judge-ai": "判断含义",
  self: "自我评估",
};

export default function WrongPage() {
  const state = useAppState();
  const [category, setCategory] = useState("all");

  const wrongList = Object.values(state.wrongWords)
    .filter((w) => !w.resolved)
    .sort((a, b) => b.wrongCount - a.wrongCount);

  const filtered = category === "all" ? wrongList : wrongList.filter((w) => getWord(w.wordId)?.categoryId === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">错词本</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            答错 {wrongList.length} 个 · 自动记录，练熟后可移出
          </p>
        </div>
        <Select
          className="w-32"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: "all", label: "全部分类" },
            ...CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookX className="h-8 w-8" />}
          title="错词本是空的"
          description="练习答错的单词会自动收集到这里"
          action={
            <Link href="/practice">
              <Button>去做练习</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => {
            const word = getWord(entry.wordId);
            if (!word) return null;
            return (
              <div key={entry.wordId} className="rounded-xl border bg-card p-3.5">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/learn/${word.id}`} className="text-sm font-semibold hover:text-primary">
                      {word.word}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{word.coreTranslation}</p>
                  </div>
                  <Badge variant="destructive">错 {entry.wrongCount} 次</Badge>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>最近：{new Date(entry.lastWrongAt).toLocaleDateString("zh-CN")}</span>
                  <span>常错题型：{TYPE_LABEL[entry.mainQuestionType] ?? "-"}</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link href="/practice?source=wrong" className="flex-1">
                    <Button size="sm" variant="outline" className="w-full gap-1">
                      <Play className="h-3.5 w-3.5" /> 再练
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-success"
                    onClick={() => {
                      resolveWrongWord(entry.wordId);
                      toast.success("已标记为掌握，移出错词本");
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> 已掌握
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-muted-foreground"
                    onClick={() => removeWrongWord(entry.wordId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 移出
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
