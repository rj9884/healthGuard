"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Heart, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const inputCls = "mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelCls = "block text-sm font-medium text-foreground";

export default function RegisterPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [ageRange, setAgeRange] = useState("adult");
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) { toast.error("Fill out all fields."); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await register(email, password, name, ageRange);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white overflow-hidden p-1.5">
          <img src="/icon0.svg" alt="HealthGuard Logo" className="h-full w-full object-contain" />
        </div>
        <span className="text-lg font-bold text-foreground">HealthGuard</span>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up your household health dashboard in seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className={labelCls} htmlFor="name">Your name</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="email">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="age_range">Your age range</label>
            <select id="age_range" value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className={inputCls}>
              <option value="pediatric">Child / Teen (under 18)</option>
              <option value="adult">Adult (18–64)</option>
              <option value="senior">Senior (65+)</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="password">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className={inputCls} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
