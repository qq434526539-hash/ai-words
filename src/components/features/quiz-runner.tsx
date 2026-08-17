"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Heart, RefreshCw, XCircle } from "lucide-react";
import type { QuestionType, Word } from "@/lib/types";
import { buildQuizQuestions } from "@/lib/quiz";
import { pinForReview, recordAnswer, toggleFavorite } from "@/lib/store";
import { useAppState } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<QuestionType, string> = {
  en2zh: "看英文选中文",
  zh2en: "看中文选英文",
  "fill-blank": "AI 场景填空",
  "judge-ai": "判断 AI 含义",
  self: "自我评估",
};

export function QuizRunner({
  pool,
  exclude,
  count = 10,
}: {
  pool: Word[];
  exclude: Set<string>;
  count?: number;
}) {
  const state = useAppState();
  const askedRef = useRef<Set<string>>(new Set());
  const [questions, setQuestions] = useState(() => {
    const merged = new Set([...exclude, ...askedRef.current]);
    const qs = buildQuizQuestions(pool, count, merged);
    qs.forEach((q) => askedRef.current.add(`${q.wordId}:${q.type}`));
    return qs;
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const isFilled = state.favorites.some(
    (f) => f.wordId === current?.wordId && f.folderName === "默认收藏夹"
  );

  const restart = () => {
    const merged = new Set([...exclude, ...askedRef.current]);
    const qs = buildQuizQuestions(pool, count, merged);
    qs.forEach((q) => askedRef.current.add(`${q.wordId}:${q.type}`));
    setQuestions(qs);
    setIndex(0);
    setSelected(null);
    setFillAnswer("");
    setAnswered(false);
    setStats({ correct: 0, wrong: 0 });
    setFinished(false);
  };

  const submitChoice = (option: string, answerIndex: number) => {
    if (answered) return;
    const correct = option === current.options![answerIndex];
    finish(correct, option);
  };

  const submitFill = () => {
    if (answered) return;
    const correct = fillAnswer.trim().toLowerCase() === current.blankAnswer!.toLowerCase();
    finish(correct, fillAnswer.trim());
  };

  const finish = (correct: boolean, userAnswer: string) => {
    setSelected(userAnswer);
    setIsCorrect(correct);
    setAnswered(true);
    setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    recordAnswer(current.wordId, current.type, userAnswer, correct);
  };

  const next = () => {
    if (index + 1 >= questions.length) setFinished(true);
    else {
      setIndex((i) => i + 1);
      setSelected(null);
      setFillAnswer("");
      setAnswered(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-4xl">🎉</p>
        <p className="font-medium">题目都练过啦</p>
        <p className="text-sm text-muted-foreground">今天这类题目已经出过，明天再来巩固</p>
      </div>
    );
  }

  if (finished) {
    const total = stats.correct + stats.wrong;
    const accuracy = total ? Math.round((stats.correct / total) * 100) : 0;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-5xl">{accuracy >= 80 ? "🏆" : accuracy >= 50 ? "💪" : "📚"}</p>
        <h1 className="text-xl font-bold">练习完成</h1>
        <p className="text-sm text-muted-foreground">
          共 {total} 题，答对 {stats.correct} 题，正确率 {accuracy}%
        </p>
        {stats.wrong > 0 && (
          <p className="text-xs text-muted-foreground">答错的单词已自动进入错词本</p>
        )}
        <div className="mt-2 flex gap-2">
          <Button onClick={restart} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            再练一组
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{TYPE_LABEL[current.type]}</Badge>
        <Progress value={(index / questions.length) * 100} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="rounded-xl border bg-card p-5">
        {current.type === "en2zh" && (
          <>
            <p className="text-center text-xs text-muted-foreground">选择正确的中文释义</p>
            <p className="mt-3 text-center text-3xl font-extrabold tracking-tight">{current.prompt}</p>
          </>
        )}
        {current.type === "zh2en" && (
          <>
            <p className="text-center text-xs text-muted-foreground">选择对应的英文单词</p>
            <p className="mt-3 text-center text-xl font-semibold">{current.prompt}</p>
          </>
        )}
        {current.type === "fill-blank" && (
          <>
            <p className="text-center text-xs text-muted-foreground">在 AI 场景中补全单词</p>
            <p className="mt-3 text-center text-base leading-relaxed">{current.prompt}</p>
          </>
        )}
        {current.type === "judge-ai" && (
          <>
            <p className="text-center text-xs text-muted-foreground">{current.prompt}</p>
            <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-center text-base font-medium">
              {current.statement}
            </p>
          </>
        )}
      </div>

      {/* 答题区 */}
      {current.type === "fill-blank" ? (
        <div className="flex gap-2">
          <Input
            value={fillAnswer}
            onChange={(e) => setFillAnswer(e.target.value)}
            placeholder="输入单词…"
            disabled={answered}
            onKeyDown={(e) => e.key === "Enter" && submitFill()}
          />
          <Button onClick={submitFill} disabled={answered || !fillAnswer.trim()}>
            提交
          </Button>
        </div>
      ) : (
        <div className="grid gap-2">
          {current.options!.map((opt, i) => {
            const isAnswer = i === current.answerIndex;
            let style = "";
            if (answered) {
              if (isAnswer) style = "border-success bg-success/10 text-success";
              else if (selected === opt) style = "border-destructive bg-destructive/10 text-destructive";
              else style = "opacity-50";
            }
            return (
              <button
                key={i}
                onClick={() => submitChoice(opt, current.answerIndex!)}
                disabled={answered}
                className={cn(
                  "rounded-xl border p-3.5 text-left text-sm transition-colors",
                  !answered && "hover:bg-accent/50",
                  style
                )}
              >
                <span className="mr-2 text-xs text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* 反馈区 */}
      {answered && (
        <div
          className={cn(
            "animate-fade-in rounded-xl border p-4",
            isCorrect ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/10"
          )}
        >
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <p className={cn("text-sm font-semibold", isCorrect ? "text-success" : "text-destructive")}>
              {isCorrect ? "回答正确！" : "回答错误"}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(current.wordId, "默认收藏夹")}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  isFilled ? "text-rose-500" : "text-muted-foreground"
                )}
                aria-label="收藏"
              >
                <Heart className={cn("h-4 w-4", isFilled && "fill-current")} />
              </button>
              <Button size="sm" onClick={next} className="gap-1">
                下一题
              </Button>
            </div>
          </div>

          {!isCorrect && current.type === "en2zh" && (
            <p className="mt-2 text-sm">
              正确答案：<span className="font-semibold">{current.options![current.answerIndex!]}</span>
            </p>
          )}
          {!isCorrect && current.type === "zh2en" && (
            <p className="mt-2 text-sm">
              正确答案：<span className="font-semibold">{current.options![current.answerIndex!]}</span>
            </p>
          )}
          {!isCorrect && current.type === "fill-blank" && (
            <p className="mt-2 text-sm">
              正确答案：<span className="font-semibold">{current.blankAnswer}</span>
            </p>
          )}
          {!isCorrect && current.type === "judge-ai" && (
            <p className="mt-2 text-sm">
              正确答案：<span className="font-semibold">{current.judgmentCorrect ? "正确" : "错误"}</span>
            </p>
          )}

          <p className="mt-2 text-sm leading-relaxed">{current.explanation}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            AI 场景真实含义：{current.aiMeaning}
          </p>
          <div className="mt-2 rounded-lg bg-background/70 p-2.5">
            <p className="text-sm font-medium">{current.example}</p>
            <p className="text-xs text-muted-foreground">{current.exampleTranslation}</p>
          </div>

          {!isCorrect && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => pinForReview(current.wordId)}
            >
              ＋ 加入重点复习
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
