"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { ExplainMode, Word } from "@/lib/types";
import { EXPLAIN_MODES } from "@/lib/types";
import { requestExplain, type ExplainResult } from "@/lib/ai";
import { useAppState } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** AI 讲解面板：让 AI 换一种方式解释单词 */
export function AiExplainPanel({ word }: { word: Word }) {
  const state = useAppState();
  const [mode, setMode] = useState<ExplainMode>("teacher");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await requestExplain(word.id, state.profile.englishLevel ?? "basic", mode);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">让 AI 换个方式解释</h3>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {EXPLAIN_MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              mode === m.value
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Button size="sm" className="mt-3 gap-1.5" onClick={run} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        让 AI 解释
      </Button>

      {loading && (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {result && !loading && (
        <div className="mt-3 rounded-lg border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <Badge variant={result.source === "ai" ? "default" : "secondary"}>
              {result.source === "ai" ? "AI 生成" : "本地示例"}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {result.source === "mock" && "未配置 AI 接口，展示预设讲解"}
            </span>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{result.text}</pre>
        </div>
      )}
    </section>
  );
}
