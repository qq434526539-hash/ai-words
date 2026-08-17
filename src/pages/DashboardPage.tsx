import { ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Database, RotateCcw, ScanLine } from "lucide-react";
import { Link } from "react-router-dom";
import { ALL_WORDS, WORD_MAP } from "@/data/words";
import { learningSummary } from "@/services/study-plan";
import { useLearningStore } from "@/stores/learning-store";

export function DashboardPage() {
  const state = useLearningStore();
  const summary = learningSummary(state.progress, state.dailyStats, state.studyDates, state.dailyTarget);
  const recentWords = state.records.slice(-4).reverse().map((record) => WORD_MAP[record.wordId]).filter(Boolean);
  const recommendations = recentWords.length ? recentWords : ALL_WORDS.slice(0, 4);
  const percent = Math.round((summary.learned / summary.total) * 100);
  const today = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }).format(new Date());

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><p className="hud-label">Learning Command Center · {today}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">学习控制台</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">聚焦今天该掌握的 AI 英语。复习任务优先，新词在完成后自动进入记忆周期。</p></div>
        <div className="flex items-center gap-2"><span className="glass-chip"><i className="signal-pulse mr-2 h-1.5 w-1.5 rounded-full bg-primary" />Memory Engine Active</span><span className="glass-chip">SRS v1.0</span></div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={BookOpen} code="NEW" label="今日新词" value={summary.newCount} accent="cyan" />
        <Metric icon={RotateCcw} code="DUE" label="等待复习" value={summary.dueCount} accent="violet" />
        <Metric icon={CheckCircle2} code="CORE" label="已掌握" value={summary.mastered} accent="green" />
        <Metric icon={CalendarDays} code="DAYS" label="学习天数" value={summary.studyDays} accent="amber" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_.75fr]">
        <div className="tech-panel rounded-xl p-6 sm:p-8">
          <div className="flex items-center justify-between"><span className="hud-label">Primary Mission</span><span className="font-mono text-[10px] text-muted-foreground">QUEUE / {String(summary.words.length).padStart(2, "0")}</span></div>
          <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_150px] sm:items-end">
            <div><p className="text-sm text-primary">TODAY&apos;S PROTOCOL</p><h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">{summary.words.length ? `复习 ${summary.dueCount} 个词，再解锁 ${summary.newCount} 个新词` : "今日学习协议已完成"}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">根据你的掌握程度动态安排 10 分钟、1 天、3 天或 7 天后的复习。</p></div>
            <div className="relative mx-auto grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) ${percent * 3.6}deg, hsl(var(--secondary)) 0deg)` }}><div className="grid h-[108px] w-[108px] place-items-center rounded-full bg-card"><div className="text-center"><p className="data-value text-3xl">{percent}<span className="text-sm text-primary">%</span></p><p className="hud-label mt-1">Core Sync</p></div></div></div>
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t border-primary/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="font-mono text-[10px] text-muted-foreground">KNOWLEDGE INDEX // {summary.learned} OF {summary.total} UNITS</p><Link to="/learn" className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_22px_rgba(34,211,238,.14)] hover:bg-primary/90">{summary.words.length ? "启动学习任务" : "查看任务结果"}<ArrowUpRight className="h-4 w-4" /></Link></div>
        </div>

        <div className="tech-panel rounded-xl p-5">
          <div className="flex items-center justify-between"><span className="hud-label">System Readout</span><ScanLine className="h-4 w-4 text-primary/60" /></div>
          <div className="mt-6 space-y-5"><Readout label="词库容量" value={summary.total} suffix="UNITS" /><Readout label="已读取" value={summary.learned} suffix="WORDS" /><Readout label="今日目标" value={state.dailyTarget} suffix="NEW" /></div>
          <div className="mt-7 border-t border-primary/10 pt-5"><div className="mb-2 flex justify-between font-mono text-[10px]"><span className="text-muted-foreground">DATABASE INTEGRITY</span><span className="text-emerald-400">100%</span></div><div className="h-1 bg-secondary"><div className="h-full w-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.5)]" /></div><p className="mt-4 flex items-center gap-2 text-[10px] text-muted-foreground"><Database className="h-3.5 w-3.5 text-primary" />INDEXEDDB · DEVICE LOCAL</p></div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><p className="hud-label">Knowledge Stream</p><h2 className="mt-2 font-semibold">{recentWords.length ? "最近学习词汇" : "推荐学习词汇"}</h2></div><Link to="/library" className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-primary">打开知识库 <ChevronRight className="h-3.5 w-3.5" /></Link></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{recommendations.map((word, index) => <Link key={word.id} to={`/words/${word.id}`} className="tech-panel group rounded-lg p-4 hover:border-primary/45"><div className="flex items-center justify-between"><span className="font-mono text-[9px] text-primary/55">NODE_{String(index + 1).padStart(2, "0")}</span><ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" /></div><p className="mt-5 text-lg font-semibold">{word.word}</p><p className="mt-1 truncate text-xs text-muted-foreground">{word.coreTranslation}</p></Link>)}</div>
      </section>
    </div>
  );
}

const accentClasses = { cyan: "text-primary bg-primary/10", violet: "text-violet-400 bg-violet-400/10", green: "text-emerald-400 bg-emerald-400/10", amber: "text-amber-400 bg-amber-400/10" };
function Metric({ icon: Icon, code, label, value, accent }: { icon: typeof BookOpen; code: string; label: string; value: number; accent: keyof typeof accentClasses }) {
  return <div className="tech-panel rounded-lg p-4 sm:p-5"><div className="flex items-center justify-between"><span className={`grid h-8 w-8 place-items-center rounded-md ${accentClasses[accent]}`}><Icon className="h-4 w-4" /></span><span className="font-mono text-[9px] text-muted-foreground">{code}</span></div><p className="data-value mt-5 text-3xl">{String(value).padStart(2, "0")}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>;
}
function Readout({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  return <div className="flex items-end justify-between border-b border-primary/10 pb-3"><p className="text-xs text-muted-foreground">{label}</p><div className="text-right"><span className="data-value text-xl">{String(value).padStart(3, "0")}</span><span className="ml-2 font-mono text-[8px] text-primary/55">{suffix}</span></div></div>;
}
