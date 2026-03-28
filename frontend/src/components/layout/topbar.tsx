"use client";

import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Good to have you back</p>
        <p className="font-display text-2xl font-semibold text-slate-950">
          Overview of your recent health signals
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden min-w-80 md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search symptoms, medications, reports..." />
        </div>
        <button className="rounded-full border border-border bg-card p-3 text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
