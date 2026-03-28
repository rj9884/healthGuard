import {
  Activity,
  BarChart3,
  LayoutDashboard,
  MessageSquareText,
  Pill,
  ScanSearch,
} from "lucide-react";

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/symptoms", label: "Symptoms", icon: Activity },
  { href: "/patterns", label: "Patterns", icon: BarChart3 },
  { href: "/medications", label: "Medications", icon: Pill },
  { href: "/chat", label: "AI Companion", icon: MessageSquareText },
  { href: "/screener", label: "Screener", icon: ScanSearch },
] as const;
