"use client";

import { LogOut, ChevronDown, Plus, Bell, UserCog, Users, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useFamily } from "@/lib/family";
import { RELATION_LABELS } from "@/lib/api/types";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { cn } from "@/lib/utils/cn";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Topbar() {
  const { user, isGuest, logout } = useAuth();
  const { members, activeMember, setActiveMember } = useFamily();
  const router = useRouter();
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Works for both real accounts and guest demo mode: clears whatever
  // session state exists (token or guest flag) and returns to the
  // marketing page.
  const handleExit = () => {
    setAccountDropdownOpen(false);
    logout();
    router.push("/");
  };

  const displayName = isGuest ? "Guest Demo User" : user?.name ?? "Account";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-6 py-3">
      {/* Family member switcher */}
      <div className="relative">
        <button
          onClick={() => { setMemberDropdownOpen((v) => !v); setAccountDropdownOpen(false); }}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
        >
          {activeMember ? (
            <>
              <MemberAvatar name={activeMember.name} color={activeMember.avatar_color} />
              <span className="hidden sm:block">
                {activeMember.name}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  ({RELATION_LABELS[activeMember.relation] ?? activeMember.relation})
                </span>
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Select profile</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {memberDropdownOpen && members.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
            <p className="border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Family Members
            </p>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => { setActiveMember(m); setMemberDropdownOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-muted",
                  activeMember?.id === m.id ? "bg-accent text-primary font-semibold" : "text-foreground",
                )}
              >
                <MemberAvatar name={m.name} color={m.avatar_color} />
                <div>
                  <p className="font-medium leading-none">{m.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {RELATION_LABELS[m.relation] ?? m.relation} · {m.age_range}
                  </p>
                </div>
              </button>
            ))}
            <Link
              href="/members"
              onClick={() => setMemberDropdownOpen(false)}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-sm font-medium text-primary hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5" /> Add or edit family members
            </Link>
          </div>
        )}
      </div>

      {/* Right side: notifications + account menu */}
      <div className="flex items-center gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground transition hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => { setAccountDropdownOpen((v) => !v); setMemberDropdownOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-white py-1.5 pl-1.5 pr-3 transition hover:bg-muted"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {initialsOf(displayName)}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {accountDropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-white shadow-lg">
              <div className="border-b border-border px-3.5 py-3">
                <p className="text-sm font-semibold text-foreground">{displayName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {isGuest ? "Guest demo mode — data isn't saved" : user?.email}
                </p>
              </div>

              <Link
                href="/members"
                onClick={() => setAccountDropdownOpen(false)}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <Users className="h-4 w-4 text-muted-foreground" /> Manage family profiles
              </Link>

              {isGuest && (
                <Link
                  href="/register"
                  onClick={() => setAccountDropdownOpen(false)}
                  className="flex w-full items-center gap-2.5 border-t border-border px-3.5 py-2.5 text-sm font-semibold text-primary transition hover:bg-accent"
                >
                  <UserCog className="h-4 w-4" /> Create an account
                </Link>
              )}

              <button
                onClick={handleExit}
                className="flex w-full items-center gap-2.5 border-t border-border px-3.5 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                {isGuest ? <Home className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                {isGuest ? "Exit demo & back to home" : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
