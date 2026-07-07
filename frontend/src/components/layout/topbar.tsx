"use client";

import { Bell, Search, UserCheck, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const { user, isGuest, logout } = useAuth();

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {isGuest ? "Guest Access" : `Welcome back, ${user?.name || "Patient"}`}
          </p>
          {isGuest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
              <Sparkles className="h-3 w-3" /> Demo Mode
            </span>
          )}
        </div>
        <p className="font-display text-2xl font-semibold text-slate-950">
          Overview of your recent health signals
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isGuest ? (
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 whitespace-nowrap"
          >
            Create Free Account
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 hidden md:inline-block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              title="Sign Out"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        )}
        <button className="rounded-full border border-border bg-card p-3 text-muted-foreground transition-colors hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
