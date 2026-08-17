"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  CATEGORIES,
  DAILY_TARGET_OPTIONS,
  ENGLISH_LEVEL_OPTIONS,
  GOAL_OPTIONS,
  GOAL_RECOMMENDATIONS,
} from "@/data/categories";
import { getWordsByCategory } from "@/data/words";
import { completeOnboarding } from "@/lib/store";
import type { EnglishLevel, LearningGoal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/features/category-icon";

const STEPS = ["学习目标", "每日数量", "英语水平", "推荐词库"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [dailyTarget, setDailyTarget] = useState(10);
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const canNext =
    (step === 0 && goal !== null) ||
    (step === 1 && true) ||
    (step === 2 && englishLevel !== null) ||
    step === 3;

  const next = () => {
    if (step === 2) {
      // 进入推荐词库时预选
      setSelected(GOAL_RECOMMENDATIONS[goal!]);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const finish = () => {
    if (!goal || !englishLevel) return;
    completeOnboarding({
      learningGoal: goal,
      dailyTarget,
      englishLevel,
      selectedCategoryIds: selected.length ? selected : GOAL_RECOMMENDATIONS[goal],
    });
    toast.success("设置完成，开始你的 AI 词汇之旅！");
    router.push("/");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6">
      {/* 进度条 */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1">
            <div className={cn("h-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />
            <span className={cn("text-[10px]", i === step ? "text-primary" : "text-muted-foreground")}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">
          {step === 0 && "你想用 AI 做什么？"}
          {step === 1 && "每天学多少？"}
          {step === 2 && "你的英语水平？"}
          {step === 3 && "为你推荐的词库"}
        </h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 0 && "选择最接近的目标，我们会为你推荐词库"}
        {step === 1 && "量力而行，坚持比数量更重要"}
        {step === 2 && "根据水平调整解释的详细程度"}
        {step === 3 && "可以手动调整，之后也能在设置里修改"}
      </p>

      <div className="mt-6 flex-1">
        {step === 0 && (
          <div className="grid gap-2.5">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 text-left transition-colors",
                  goal === g.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent/50"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{g.label}</p>
                  <p className="text-xs text-muted-foreground">{g.description}</p>
                </div>
                {goal === g.value && <Check className="h-5 w-5 text-primary" />}
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {DAILY_TARGET_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setDailyTarget(n)}
                className={cn(
                  "rounded-xl border p-5 text-center transition-colors",
                  dailyTarget === n ? "border-primary bg-primary/10" : "hover:bg-accent/50"
                )}
              >
                <p className="text-2xl font-bold">{n}</p>
                <p className="mt-1 text-xs text-muted-foreground">个新词/天</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-2.5">
            {ENGLISH_LEVEL_OPTIONS.map((l) => (
              <button
                key={l.value}
                onClick={() => setEnglishLevel(l.value)}
                className={cn(
                  "rounded-xl border p-4 text-left text-sm font-medium transition-colors",
                  englishLevel === l.value ? "border-primary bg-primary/10" : "hover:bg-accent/50"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2.5">
            {CATEGORIES.filter((c) => GOAL_RECOMMENDATIONS[goal!].includes(c.id)).map((cat) => {
              const checked = selected.includes(cat.id);
              const count = getWordsByCategory(cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelected((s) =>
                      checked ? s.filter((x) => x !== cat.id) : [...s, cat.id]
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    checked ? "border-primary bg-primary/10" : "hover:bg-accent/50"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <CategoryIcon name={cat.icon} colorClass={cat.color} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{count} 词</span>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      checked ? "border-primary bg-primary text-primary-foreground" : ""
                    )}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4" />
            上一步
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button className="flex-1" onClick={next} disabled={!canNext}>
            下一步
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={finish} disabled={!selected.length}>
            完成设置
            <Sparkles className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
