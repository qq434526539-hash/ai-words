import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getWord, getWordsByCategory } from "@/data/words";
import { WordCard } from "@/components/words/WordCard";
import { FAMILIARITY_OPTIONS } from "@/services/srs";
import { useLearningStore } from "@/stores/learning-store";

export function WordDetailPage() {
  const { wordId = "" } = useParams();
  const word = getWord(wordId);
  const progress = useLearningStore((state) => state.progress);
  const reviewWord = useLearningStore((state) => state.reviewWord);
  if (!word) return <Navigate to="/library" replace />;
  const words = getWordsByCategory(word.categoryId);
  const index = words.findIndex((item) => item.id === word.id);
  const previous = index > 0 ? words[index - 1] : undefined;
  const next = index < words.length - 1 ? words[index + 1] : undefined;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><Link to={`/library/${word.categoryId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />返回词库</Link><span className="text-xs text-muted-foreground">{index + 1} / {words.length}</span></div>
      <WordCard word={word} />
      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-semibold">调整掌握程度</h2>
        <p className="mt-1 text-sm text-muted-foreground">选择后会立即保存，并重新安排复习时间。</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FAMILIARITY_OPTIONS.map((option) => (
            <button key={option.value} onClick={() => reviewWord(word.id, option.value, !progress[word.id])} className={`rounded-xl border px-3 py-3 text-sm hover:border-primary/40 ${progress[word.id]?.familiarity === option.value ? "border-primary bg-primary/5 text-primary" : "bg-card"}`}>
              <span className="block font-medium">{option.label}</span><span className="mt-1 block text-[11px] text-muted-foreground">{option.hint}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {previous ? <Link to={`/words/${previous.id}`} className="rounded-xl border bg-card p-4 text-sm hover:bg-accent"><span className="text-xs text-muted-foreground">上一个</span><p className="mt-1 font-medium">{previous.word}</p></Link> : <div />}
        {next && <Link to={`/words/${next.id}`} className="rounded-xl border bg-card p-4 text-right text-sm hover:bg-accent"><span className="inline-flex items-center gap-1 text-xs text-muted-foreground">下一个 <ArrowRight className="h-3 w-3" /></span><p className="mt-1 font-medium">{next.word}</p></Link>}
      </div>
    </div>
  );
}
