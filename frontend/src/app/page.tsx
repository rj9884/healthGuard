"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  ShieldAlert,
  Sparkles,
  Cpu,
  LineChart,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const { enableGuestDemo } = useAuth();
  const router = useRouter();

  const handleDemoClick = () => {
    enableGuestDemo();
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background font-sans text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Clinical AI</span>
              <h1 className="font-display text-xl font-bold tracking-tight text-foreground">HealthGuard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="whitespace-nowrap text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for families, backed by real ML</span>
          </div>

          <h1 className="mb-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Family health tracking <br className="hidden sm:inline" />
            <span className="text-primary">that explains itself.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground sm:text-xl">
            Log symptoms for everyone in your family and get instant, plain-English risk explanations backed by real machine learning — not just averages.
          </p>

          <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-8 py-4 text-base font-bold text-white transition hover:bg-primary/90 sm:w-auto"
            >
              Start Health Triage <ArrowRight className="h-5 w-5" />
            </Link>

            <button
              onClick={handleDemoClick}
              className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-white px-8 py-4 text-base font-semibold text-foreground transition hover:bg-muted sm:w-auto"
            >
              Explore Live Demo
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Explainable, not a black box</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Built for the whole family</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Your data stays on your device</span>
          </div>
        </div>
      </section>

      {/* Value Grid Section */}
      <section className="border-t border-border bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              How HealthGuard actually works
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              No generic averages or guesswork. Every risk explanation comes from a real, interpretable machine learning model — the same kind used in clinical decision-support tools, tuned to stay fast and lightweight.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-border bg-white p-8 transition hover:border-primary/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                Explanations, not just a verdict
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every symptom log runs through a real LightGBM classifier, and SHAP explainability shows you exactly which symptom drove the result — not a black-box score.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-border bg-white p-8 transition hover:border-primary/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                Catches what looks off, early
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                An Isolation Forest model watches your logged vitals — sleep, stress, hydration, temperature, heart rate — and flags check-ins that look out of the ordinary before they become a bigger problem.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-border bg-white p-8 transition hover:border-primary/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-foreground">
                Finds your real triggers over time
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                HealthGuard runs statistical tests across your health timeline — not just eyeballing trends — to separate real lifestyle triggers from coincidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Callout */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-xl bg-primary p-10 text-center sm:p-14">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to start tracking your family's health?
            </h2>
            <p className="mb-8 text-base text-white/85 sm:text-lg">
              Whether it's daily self-care or getting organized before a doctor's visit, HealthGuard gives you clear, explainable answers — not just numbers.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-primary transition hover:bg-white/90 sm:w-auto"
              >
                Create Your Account
              </Link>
              <button
                onClick={handleDemoClick}
                className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-lg border border-white/30 bg-transparent px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
              >
                Try Guest Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">HealthGuard AI-ML Engine</span>
          </div>
          <p>⚠️ For educational and research purposes only. Does not constitute medical advice or definitive diagnosis.</p>
          <div className="flex gap-4">
            <Link href="/login" className="transition hover:text-foreground">Sign In</Link>
            <Link href="/register" className="transition hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
