"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, BookX, ChevronRight, Heart, LogIn, LogOut, Settings, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ENGLISH_LEVEL_OPTIONS, GOAL_OPTIONS } from "@/data/categories";
import { useAppState } from "@/hooks/use-app-state";
import { computeLearningStats } from "@/lib/plan";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { localLogin } from "@/lib/store";

const MENU = [
  { href: "/stats", label: "学习统计", description: "天数、正确率、薄弱分类", icon: BarChart3 },
  { href: "/favorites", label: "我的收藏", description: "按文件夹整理收藏的单词", icon: Heart },
  { href: "/wrong", label: "错词本", description: "练熟错词，逐个消灭", icon: BookX },
  { href: "/settings", label: "设置", description: "学习目标、水平、主题", icon: Settings },
];

export default function MePage() {
  const router = useRouter();
  const state = useAppState();
  const stats = computeLearningStats(state);
  const levelLabel = ENGLISH_LEVEL_OPTIONS.find((l) => l.value === state.profile.englishLevel)?.label;
  const goalLabel = GOAL_OPTIONS.find((g) => g.value === state.profile.learningGoal)?.label;
  const isGuest = !state.profile.email;

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      localLogin("", null);
    }
    toast.success("已退出登录");
    router.push("/");
  };

  return (
    <div className="space-y-4">
      {/* 个人卡片 */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
            {state.profile.nickname?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-bold">{state.profile.nickname || "同学"}</h1>
              {isGuest ? (
                <Badge variant="outline">本地体验</Badge>
              ) : (
                <Badge variant="success">已登录</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {goalLabel ?? "未设置目标"} · {levelLabel ?? "未设置水平"} · 每日 {state.profile.dailyTarget} 词
            </p>
            {!isGuest && state.profile.email && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{state.profile.email}</p>
            )}
          </div>
          {!isGuest && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 self-start rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> 退出
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-secondary/60 py-2">
            <p className="text-base font-bold">{stats.studyDays}</p>
            <p className="text-[11px] text-muted-foreground">学习天数</p>
          </div>
          <div className="rounded-lg bg-secondary/60 py-2">
            <p className="text-base font-bold">{stats.mastered}</p>
            <p className="text-[11px] text-muted-foreground">已掌握</p>
          </div>
          <div className="rounded-lg bg-secondary/60 py-2">
            <p className="text-base font-bold">{stats.accuracy}%</p>
            <p className="text-[11px] text-muted-foreground">正确率</p>
          </div>
        </div>
      </div>

      {isGuest && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">登录解锁全部功能</p>
              <p className="text-xs text-muted-foreground">云同步进度 · 全部 105 词</p>
            </div>
          </div>
          <Link href="/login">
            <Button size="sm" className="gap-1">
              <LogIn className="h-3.5 w-3.5" /> 登录
            </Button>
          </Link>
        </div>
      )}

      {/* 功能入口 */}
      <div className="divide-y divide-border rounded-xl border bg-card">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/40">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <m.icon className="h-4 w-4 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        AI Words v0.1.0 MVP · 本地数据模式
      </p>
    </div>
  );
}
