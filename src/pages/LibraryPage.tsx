import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/data/categories";
import { getWordsByCategory } from "@/data/words";
import { CategoryIcon } from "@/components/words/CategoryIcon";
import { useLearningStore } from "@/stores/learning-store";

export function LibraryPage() {
  const progress = useLearningStore((state) => state.progress);
  const total = CATEGORIES.reduce((count, category) => count + getWordsByCategory(category.id).length, 0);
  return (
    <div className="space-y-6">
      <header><p className="text-sm font-medium text-primary">场景词库</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">AI 词库</h1><p className="mt-2 text-sm text-muted-foreground">{CATEGORIES.length} 个真实 AI 场景，共 {total} 个基础词汇。</p></header>
      <div className="grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map((category) => {
          const words = getWordsByCategory(category.id);
          const learned = words.filter((word) => progress[word.id]).length;
          const mastered = words.filter((word) => progress[word.id]?.mastered).length;
          const percent = words.length ? Math.round((learned / words.length) * 100) : 0;
          return (
            <Link key={category.id} to={`/library/${category.id}`} className="tech-panel group rounded-xl p-5 hover:border-primary/45">
              <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><CategoryIcon name={category.icon} /></span><span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">{category.difficulty === 1 ? "入门" : "进阶"}</span></div>
              <h2 className="mt-4 font-semibold">{category.name}</h2><p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">{category.description}</p>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${percent}%` }} /></div>
              <div className="mt-3 flex items-center justify-between text-xs"><span className="text-muted-foreground">{words.length} 词 · 已学 {learned} · 掌握 {mastered}</span><span className="flex items-center gap-1 font-medium text-primary">开始学习 <ArrowRight className="h-3.5 w-3.5" /></span></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
