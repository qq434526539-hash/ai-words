import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { WordCard } from "@/components/words/WordCard";
import { buildStudyQueue } from "@/services/study-plan";
import { FAMILIARITY_OPTIONS } from "@/services/srs";
import { useLearningStore } from "@/stores/learning-store";
import type { Familiarity } from "@/lib/types";

export function StudySessionPage() {
  const progress = useLearningStore((state) => state.progress);
  const dailyTarget = useLearningStore((state) => state.dailyTarget);
  const reviewWord = useLearningStore((state) => state.reviewWord);
  const initialQueue = useMemo(() => buildStudyQueue(progress, dailyTarget).words, []);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const word = initialQueue[index];

  if (!word) return <EmptySession />;
  const wasNew = !progress[word.id];

  function pronounce() {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function answer(familiarity: Familiarity) {
    reviewWord(word.id, familiarity, wasNew);
    setIndex((current) => current + 1);
    setRevealed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex items-center justify-between"><div><p className="text-sm font-medium">今日学习</p><p className="text-xs text-muted-foreground">{wasNew ? "新词" : "到期复习"}</p></div><span className="text-sm text-muted-foreground">{index + 1} / {initialQueue.length}</span></header>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${(index / initialQueue.length) * 100}%` }} /></div>
      {!revealed ? (
        <section className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border bg-card p-8 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">先在心里回忆它的含义</p>
          <div className="mt-8 flex items-center gap-3"><h1 className="text-5xl font-bold tracking-tight sm:text-6xl">{word.word}</h1><button onClick={pronounce} className="rounded-full p-2 text-primary hover:bg-primary/10" aria-label="播放发音"><Volume2 className="h-7 w-7" /></button></div>
          <p className="mt-3 text-muted-foreground">{word.phonetic}</p>
          <button onClick={() => setRevealed(true)} className="mt-14 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 font-semibold text-primary-foreground"><Eye className="h-5 w-5" />显示答案</button>
        </section>
      ) : (
        <><WordCard word={word} /><section className="sticky bottom-16 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur md:bottom-4"><p className="mb-3 text-center text-sm font-medium">你对这个词掌握得怎么样？</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{FAMILIARITY_OPTIONS.map((option) => <button key={option.value} onClick={() => answer(option.value)} className="rounded-xl border bg-card px-3 py-3 text-sm hover:border-primary/40 hover:bg-primary/5"><span className="block font-medium">{option.label}</span><span className="mt-1 block text-[11px] text-muted-foreground">{option.hint}</span></button>)}</div></section></>
      )}
    </div>
  );
}

function EmptySession() {
  return <section className="mx-auto max-w-xl rounded-3xl border bg-card p-10 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-primary" /><h1 className="mt-4 text-2xl font-semibold">今天的任务完成了</h1><p className="mt-2 text-sm text-muted-foreground">学习记录已经保存在这台设备中。</p><Link to="/" className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">返回首页</Link></section>;
}
