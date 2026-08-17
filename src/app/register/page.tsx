"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { localLogin } from "@/lib/store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!nickname.trim()) {
      toast.error("请输入昵称");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("请输入有效邮箱");
      return;
    }
    if (password.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { nickname: nickname.trim() } },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        toast.success("注册成功");
        router.push("/");
      } else {
        toast.success("注册成功，请到邮箱确认后登录");
        router.push("/login");
      }
      return;
    }
    // 本地体验模式：直接注册
    localLogin(nickname.trim(), email.trim());
    toast.success("注册成功（本地体验模式）");
    router.push("/");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4">
      <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">注册 AI Words</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-1">
              {isSupabaseConfigured ? "Supabase 云同步已启用" : "本地体验模式 · 未配置 Supabase"}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>昵称</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="怎么称呼你" />
          </div>
          <div className="space-y-1.5">
            <Label>邮箱</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>密码</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
            />
          </div>
          <Button className="w-full gap-2" onClick={submit}>
            <UserPlus className="h-4 w-4" /> 注册
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            已有账号？
            <Link href="/login" className="text-primary">登录</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
