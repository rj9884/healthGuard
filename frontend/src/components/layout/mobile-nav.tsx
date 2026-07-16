"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, LayoutDashboard, MessageSquareText, Pill } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const mobileItems = [
  { href: "/dashboard",   label: "Home",       icon: LayoutDashboard },
  { href: "/symptoms",    label: "Check-In",   icon: Activity },
  { href: "/patterns",    label: "Patterns",   icon: BarChart3 },
  { href: "/medications", label: "Meds",       icon: Pill },
  { href: "/chat",        label: "AI",         icon: MessageSquareText },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white xl:hidden">
      <div className="flex">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
