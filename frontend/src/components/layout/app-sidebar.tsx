"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse } from "lucide-react";

import { navigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border/70 bg-white/80 px-6 py-8 backdrop-blur xl:block">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-primary px-3 py-3 text-primary-foreground shadow-soft">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Personal Health Companion
          </p>
          <h2 className="font-display text-2xl font-semibold">HealthGuard</h2>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-3xl border border-warning/20 bg-warning/10 p-5">
        <p className="text-sm font-semibold text-warning">Educational use only</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This product supports awareness and tracking. It is not diagnosis or
          emergency care.
        </p>
      </div>
    </aside>
  );
}
