import { BookMarked, Lightbulb, Volume2 } from "lucide-react";
import type { Word } from "@/lib/types";
import { CATEGORIES } from "@/data/categories";

export function WordCard({ word }: { word: Word }) {
  const category = CATEGORIES.find((item) => item.id === word.categoryId);

  function pronounce() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  return (
    <article className="space-y-4">
      <section className="tech-panel rounded-xl px-6 py-8 text-center sm:px-10">
        <div className="flex justify-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{category?.name}</span>
          <span className="rounded-full bg-secondary px-3 py-1 text-muted-foreground">
            {word.difficulty === 1 ? "入门" : word.difficulty === 2 ? "进阶" : "挑战"}
          </span>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{word.word}</h1>
          <button onClick={pronounce} aria-label={`朗读 ${word.word}`} className="rounded-full p-2 text-primary hover:bg-primary/10">
            <Volume2 className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-2 text-muted-foreground">{word.phonetic}</p>
        <p className="mt-4 text-xl font-semibold text-primary">{word.coreTranslation}</p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Info title="普通含义"><p>{word.generalMeaning}</p></Info>
        <Info title="AI 领域含义" emphasized><p>{word.aiMeaning}</p></Info>
        <Info title="AI 场景例句">
          <p className="font-medium text-foreground">{word.aiExample}</p>
          <p className="mt-1">{word.aiExampleTranslation}</p>
        </Info>
        <Info title="普通例句">
          <p className="font-medium text-foreground">{word.normalExample}</p>
          <p className="mt-1">{word.normalExampleTranslation}</p>
        </Info>
      </div>

      <Info title="提示词案例" icon={<BookMarked className="h-4 w-4" />}>
        <p className="rounded-xl bg-secondary/70 p-3 font-mono text-sm text-foreground">{word.promptExample}</p>
      </Info>

      <div className="grid gap-4 lg:grid-cols-3">
        <TagList title="常见搭配" items={word.collocations} tone="primary" />
        <TagList title="相关词" items={word.relatedWords} tone="neutral" />
        <TagList title="易混淆词" items={word.confusedWords} tone="warning" />
      </div>

      <section className="flex gap-3 rounded-xl border border-amber-400/25 bg-amber-400/5 p-5 text-sm leading-6 text-amber-100">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div><h2 className="font-semibold">记忆技巧</h2><p className="mt-1">{word.memoryTip}</p></div>
      </section>
    </article>
  );
}

function Info({ title, children, emphasized, icon }: { title: string; children: React.ReactNode; emphasized?: boolean; icon?: React.ReactNode }) {
  return (
    <section className={emphasized ? "tech-panel rounded-xl border-primary/30 bg-primary/5 p-5" : "tech-panel rounded-xl p-5"}>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">{icon}{title}</h2>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

function TagList({ title, items, tone }: { title: string; items: string[]; tone: "primary" | "neutral" | "warning" }) {
  const toneClass = tone === "primary" ? "bg-primary/10 text-primary" : tone === "warning" ? "bg-amber-400/10 text-amber-300" : "bg-secondary text-foreground";
  return (
    <section className="tech-panel rounded-xl p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className={`rounded-full px-3 py-1 text-xs ${toneClass}`}>{item}</span>)}
      </div>
    </section>
  );
}
