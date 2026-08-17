import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 客户端（第三阶段接入）
 * 未配置 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 时返回 null，
 * 应用自动使用本地 localStorage 模式，保证可独立运行。
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
