"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  CATEGORIES,
  DAILY_TARGET_OPTIONS,
  ENGLISH_LEVEL_OPTIONS,
  GOAL_OPTIONS,
} from "@/data/categories";
import { useAppState } from "@/hooks/use-app-state";
import { clearAllData, updateProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { EnglishLevel, LearningGoal } from "@/lib/types";

export default function SettingsPage() {
  const state = useAppState();
  const { resolvedTheme, setTheme } = useTheme();
  const [nickname, setNickname] = useState(state.profile.nickname);
  const [status, setStatus] = useState<{ supabase: boolean; ai: boolean; words: number } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const saveNickname = () => {
    updateProfile({ nickname: nickname.trim() || "同学" });
    toast.success("昵称已保存");
  };

  const handleClear = () => {
    if (window.confirm("确定清空所有本地学习数据吗？此操作不可恢复。")) {
      clearAllData();
      toast.success("本地数据已清空");
      window.location.href = "/";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">设置</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">学习偏好与账户</p>
      </div>

      {/* 个人资料 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">个人资料</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>昵称</Label>
            <div className="flex gap-2">
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="你的昵称" />
              <Button onClick={saveNickname} variant="outline">保存</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 学习偏好 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">学习偏好</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>英语水平</Label>
            <Select
              value={state.profile.englishLevel ?? "basic"}
              onChange={(e) =>
                updateProfile({ englishLevel: e.target.value as EnglishLevel })
              }
              options={ENGLISH_LEVEL_OPTIONS.map((l) => ({ value: l.value, label: l.label }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>学习目标</Label>
            <Select
              value={state.profile.learningGoal ?? "systematic"}
              onChange={(e) =>
                updateProfile({ learningGoal: e.target.value as LearningGoal })
              }
              options={GOAL_OPTIONS.map((g) => ({ value: g.value, label: g.label }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>每日新词数量</Label>
            <Select
              value={String(state.profile.dailyTarget)}
              onChange={(e) => updateProfile({ dailyTarget: Number(e.target.value) })}
              options={DAILY_TARGET_OPTIONS.map((n) => ({ value: String(n), label: `${n} 个/天` }))}
            />
          </div>

          <div className="space-y-2">
            <Label>学习词库</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const checked = state.profile.selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      updateProfile({
                        selectedCategoryIds: checked
                          ? state.profile.selectedCategoryIds.filter((x) => x !== cat.id)
                          : [...state.profile.selectedCategoryIds, cat.id],
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      checked ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 外观 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">外观</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm">深色模式</p>
            <p className="text-xs text-muted-foreground">跟随系统或手动切换</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {resolvedTheme === "dark" ? "深色" : "浅色"}
          </Button>
        </CardContent>
      </Card>

      {/* 系统状态 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">系统状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">内置单词</span>
            <span>{status?.words ?? 105} 个</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supabase 云同步</span>
            <span>{status?.supabase ? "已配置" : "未配置（本地模式）"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI 讲解接口</span>
            <span>{status?.ai ? "已配置" : "未配置（本地示例）"}</span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 危险操作 */}
      <Card className="border-destructive/30">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-destructive">清空本地数据</p>
            <p className="text-xs text-muted-foreground">删除本设备上的所有学习记录</p>
          </div>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleClear}>
            <Trash2 className="h-4 w-4" /> 清空
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
