"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ChevronRight } from "lucide-react";

import { navigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white xl:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white overflow-hidden p-1.5">
          <img src="/icon0.svg" alt="HealthGuard Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Family Health
          </p>
          <h2 className="text-lg font-bold leading-none text-foreground">HealthGuard</h2>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <div className="space-y-0.5">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground-muted hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer disclaimer */}
      <div className="border-t border-border px-5 py-4">
        <p className="text-[11px] font-semibold text-warning">⚠ Educational use only</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Not a substitute for a doctor, pharmacist, or emergency care.
        </p>
      </div>
    </aside>
  );
}
