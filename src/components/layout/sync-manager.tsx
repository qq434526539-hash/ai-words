"use client";

import { useEffect, useRef } from "react";
import { getState, hydrateState, localLogin, subscribe, updateProfile } from "@/lib/store";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { pullAllAndMerge, pushAll } from "@/lib/sync";

/**
 * 云同步管理器（挂在 AppShell 内，仅登录时生效）：
 * - 登录成功 / 页面加载时：从 Supabase 拉取数据合并进本地
 * - 本地状态变化后：防抖推送整份学习数据到服务端
 * - 未配置 Supabase 时完全无副作用
 */
export function SyncManager() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let signedIn = false;

    const pull = async (user: { id: string; email?: string | null }) => {
      signedIn = true;
      // 先标记本地已登录（触发一次状态更新，用户资料立即生效）
      localLogin(
        user.email?.split("@")[0] ?? "同学",
        user.email ?? null
      );
      await pullAllAndMerge(user);
    };

    // 本地状态变化 → 防抖推送
    const unsub = subscribe(() => {
      if (!signedIn) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void pushAll(getState());
      }, 800);
    });

    // 监听登录/登出
    const { data: authSub } = supabase!.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        void pull(session.user);
      } else if (event === "SIGNED_OUT") {
        signedIn = false;
        updateProfile({ email: null });
      } else if (event === "INITIAL_SESSION" && session?.user) {
        void pull(session.user);
      }
    });

    // 页面加载时尝试恢复会话
    void supabase!.auth.getSession().then(({ data }) => {
      if (data.session?.user && !signedIn) {
        void pull(data.session.user);
      }
    });

    return () => {
      unsub();
      authSub.subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
