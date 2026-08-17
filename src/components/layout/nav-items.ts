import {
  Home,
  Library,
  GraduationCap,
  BookX,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** 底部 / 侧边栏 5 大入口 */
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "首页", icon: Home },
  { href: "/libraries", label: "词库", icon: Library },
  { href: "/learn", label: "学习", icon: GraduationCap },
  { href: "/wrong", label: "错词", icon: BookX },
  { href: "/me", label: "我的", icon: User },
];
