"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { localLogin } from "@/lib/store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!email.trim()) {
      toast.error("请输入邮箱");
      return;
    }
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("登录成功");
      router.push("/");
      return;
    }
    // 本地体验模式：直接登录
    localLogin(email.split("@")[0], email.trim());
    toast.success("登录成功（本地体验模式）");
    router.push("/");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4">
      <Link href="/" className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> 返回
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">登录 AI Words</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-1">
              {isSupabaseConfigured ? "Supabase 云同步已启用" : "本地体验模式 · 未配置 Supabase"}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder="本地模式暂不校验"
            />
          </div>
          <Button className="w-full gap-2" onClick={submit}>
            <LogIn className="h-4 w-4" /> 登录
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            没有账号？
            <Link href="/register" className="text-primary">注册</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
