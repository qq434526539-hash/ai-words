import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl">🤖</p>
      <h1 className="text-xl font-bold">404 页面不存在</h1>
      <p className="text-sm text-muted-foreground">这个页面像幻觉一样不存在，去首页继续学习吧。</p>
      <Link href="/">
        <Button>返回首页</Button>
      </Link>
    </div>
  );
}
