"use client";

import { Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** 发音按钮：优先播放 pronunciationUrl，否则使用浏览器 TTS */
export function PronounceButton({ text, url }: { text: string; url?: string }) {
  const speak = () => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(() => speakWithTts());
      return;
    }
    speakWithTts();
  };

  const speakWithTts = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("当前浏览器不支持发音");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button size="icon" variant="ghost" onClick={speak} aria-label={`播放 ${text} 发音`} className="text-primary">
      <Volume2 className="h-5 w-5" />
    </Button>
  );
}
