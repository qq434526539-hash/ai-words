import { ArrowLeft, ArrowRight, Circle, Play } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CATEGORIES } from "@/data/categories";
import { getWordsByCategory } from "@/data/words";
import { CategoryIcon } from "@/components/words/CategoryIcon";
import { useLearningStore } from "@/stores/learning-store";

export function CategoryPage() {
  const { categoryId = "" } = useParams();
  const category = CATEGORIES.find((item) => item.id === categoryId);
  const progress = useLearningStore((state) => state.progress);
  if (!category) return <Navigate to="/library" replace />;
  const words = getWordsByCategory(category.id);
  const learned = words.filter((word) => progress[word.id]).length;
  const percent = words.length ? Math.round((learned / words.length) * 100) : 0;
  return (
    <div className="space-y-5">
      <Link to="/library" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />返回词库</Link>
      <section className="rounded-3xl border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CategoryIcon name={category.icon} /></span><div><h1 className="text-2xl font-semibold">{category.name}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p></div></div>
        <div className="mt-6 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${percent}%` }} /></div><span className="text-sm text-muted-foreground">{learned}/{words.length}</span></div>
        {words[0] && <Link to="/learn" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"><Play className="h-4 w-4" />开始今日学习</Link>}
      </section>
      <section className="overflow-hidden rounded-2xl border bg-card divide-y">
        {words.map((word, index) => <Link key={word.id} to={`/words/${word.id}`} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40"><span className="w-6 text-right text-xs text-muted-foreground">{index + 1}</span><Circle className={`h-4 w-4 ${progress[word.id]?.mastered ? "fill-primary text-primary" : progress[word.id] ? "text-primary" : "text-border"}`} /><div className="min-w-0 flex-1"><p className="truncate font-medium">{word.word}</p><p className="truncate text-sm text-muted-foreground">{word.coreTranslation}</p></div><ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" /></Link>)}
      </section>
    </div>
  );
}
