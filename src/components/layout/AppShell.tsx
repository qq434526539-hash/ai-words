import { BookOpen, Cpu, Home, Library, Search, Settings, ShieldCheck, Wifi } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLearningStore } from "@/stores/learning-store";

const navigation = [
  { to: "/", label: "控制台", code: "01", icon: Home, end: true },
  { to: "/library", label: "知识库", code: "02", icon: Library },
  { to: "/learn", label: "学习任务", code: "03", icon: BookOpen },
  { to: "/dictionary", label: "联网查词", code: "04", icon: Search },
  { to: "/settings", label: "系统设置", code: "05", icon: Settings }
];

export function AppShell() {
  const mastered = useLearningStore((state) => Object.values(state.progress).filter((item) => item.mastered).length);
  return (
    <div className="min-h-dvh">
      <div aria-hidden className="scanline-overlay pointer-events-none fixed inset-0 z-50 opacity-40" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] border-r border-primary/15 bg-[hsl(224_45%_5%/0.88)] backdrop-blur-2xl md:flex md:flex-col">
        <div className="flex h-24 items-center gap-3 border-b border-primary/15 px-6">
          <span className="relative grid h-11 w-11 place-items-center border border-primary/40 bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(34,211,238,.08)]">
            <Cpu className="h-5 w-5" />
            <i className="absolute -right-1 -top-1 h-2 w-2 bg-primary shadow-[0_0_12px_rgba(34,211,238,.8)]" />
          </span>
          <div><p className="font-mono text-sm font-semibold tracking-[0.18em]">AI//WORDS</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Personal Learning OS</p></div>
        </div>

        <div className="px-6 pt-6"><p className="hud-label">Navigation Matrix</p></div>
        <nav className="mt-3 space-y-1.5 px-3">
          {navigation.map(({ to, label, code, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(
              "group relative flex items-center gap-3 border border-transparent px-3 py-3 text-sm",
              isActive ? "border-primary/25 bg-primary/10 text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]" : "text-muted-foreground hover:border-primary/10 hover:bg-white/[0.025] hover:text-foreground"
            )}>
              <span className="font-mono text-[9px] text-primary/45">{code}</span><Icon className="h-4 w-4" /><span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="tech-panel rounded-lg p-4">
            <div className="flex items-center justify-between"><span className="hud-label">Local Core</span><span className="flex items-center gap-1 font-mono text-[9px] text-emerald-400"><i className="signal-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />ONLINE</span></div>
            <div className="mt-4 flex items-end justify-between"><div><p className="data-value text-2xl">{mastered}</p><p className="mt-1 text-[10px] text-muted-foreground">WORDS MASTERED</p></div><ShieldCheck className="h-6 w-6 text-primary/50" /></div>
            <p className="mt-4 border-t border-primary/10 pt-3 text-[10px] leading-4 text-muted-foreground">数据仅保存在本机<br />No account · No cloud</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-primary/15 bg-background/85 backdrop-blur-xl md:ml-[272px]">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden"><span className="grid h-9 w-9 place-items-center border border-primary/35 bg-primary/10 text-primary"><Cpu className="h-4 w-4" /></span><span className="font-mono text-sm tracking-wider">AI//WORDS</span></div>
          <div className="hidden items-center gap-2 md:flex"><span className="hud-label">Workspace</span><span className="text-border">/</span><span className="text-xs text-muted-foreground">个人 AI 英语工作台</span></div>
          <div className="flex items-center gap-3"><span className="hidden items-center gap-2 border border-primary/15 bg-primary/5 px-3 py-1.5 font-mono text-[10px] text-muted-foreground sm:flex"><Search className="h-3 w-3" />QUICK LOOKUP</span><span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400"><Wifi className="h-3 w-3" />SYNC: LOCAL</span></div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-6 md:pl-[304px] md:pr-8 md:pt-8"><Outlet /></main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-primary/20 bg-[hsl(224_45%_5%/0.94)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cn("relative flex min-w-0 flex-col items-center gap-1 py-2.5 text-[10px]", isActive ? "text-primary" : "text-muted-foreground")}>
            {({ isActive }) => <>{isActive && <i className="absolute inset-x-3 top-0 h-px bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}<Icon className="h-4 w-4" /><span className="truncate">{label}</span></>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
