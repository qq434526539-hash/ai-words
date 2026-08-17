"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Heart, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV } from "@/components/layout/nav-items";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SyncManager } from "@/components/layout/sync-manager";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="text-base font-bold tracking-tight">
        AI<span className="text-primary">Words</span>
      </span>
    </Link>
  );
}

const SECONDARY_NAV = [
  { href: "/stats", label: "学习统计", icon: BarChart3 },
  { href: "/favorites", label: "我的收藏", icon: Heart },
  { href: "/settings", label: "设置", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/onboarding") || pathname.startsWith("/login") || pathname.startsWith("/register");

  if (hideNav) {
    return <div className="min-h-dvh">{children}</div>;
  }

  return (
    <div className="min-h-dvh">
      <SyncManager />
      {/* 桌面端侧边栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card md:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} pathname={pathname} />
          ))}
          <div className="my-3 h-px bg-border" />
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} pathname={pathname} />
          ))}
        </nav>
        <div className="flex items-center justify-between border-t px-5 py-4">
          <span className="text-xs text-muted-foreground">v0.1.0 MVP</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur md:hidden">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 md:pl-60 md:pt-8 lg:pl-64">
        {children}
      </main>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 z-30 grid w-full grid-cols-5 border-t bg-card/95 backdrop-blur md:hidden">
        {MAIN_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 text-[11px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
}) {
  const active = isActive(pathname, href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
