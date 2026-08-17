import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ALL_WORDS } from "@/data/words";

/** 运行状态检测（供设置页展示，不泄露任何密钥内容） */
export async function GET() {
  return NextResponse.json({
    supabase: isSupabaseConfigured,
    ai: Boolean(process.env.OPENAI_API_KEY),
    words: ALL_WORDS.length,
    version: "0.1.0",
  });
}
