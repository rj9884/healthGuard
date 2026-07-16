"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Heart, ArrowRight, Activity, Shield, Users } from "lucide-react";
import { toast } from "sonner";

const FEATURES = [
  { icon: Activity, title: "Daily check-ins", desc: "Track symptoms & vitals for every family member." },
  { icon: Shield, title: "ML-powered triage", desc: "LightGBM + SHAP explains what the pattern means." },
  { icon: Users, title: "Family profiles", desc: "One account, separate health records per member." },
];

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Enter email and password."); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] lg:shrink-0 lg:flex-col lg:justify-between lg:border-r lg:border-border lg:bg-white lg:px-12 lg:py-16">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white overflow-hidden p-1.5">
              <img src="/icon0.svg" alt="HealthGuard Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">HealthGuard</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Your family's daily health companion.</p>

          <div className="mt-12 space-y-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Educational reference only. Not a diagnostic or emergency service.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white overflow-hidden p-1.5">
            <img src="/icon0.svg" alt="HealthGuard Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-lg font-bold text-foreground">HealthGuard</span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Access your household health dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
