"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Cpu, 
  LineChart, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Lock
} from "lucide-react";

export default function LandingPage() {
  const { enableGuestDemo } = useAuth();
  const router = useRouter();

  const handleDemoClick = () => {
    enableGuestDemo();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Clinical AI</span>
              <h1 className="font-display text-xl font-bold tracking-tight text-white">HealthGuard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40 px-6">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-600/10 blur-[160px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300 mb-8 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Powered by LightGBM & Explainable AI (SHAP)</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-8">
            Longitudinal Biometrics & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Clinical Triage Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
            HealthGuard bridges consumer biometric vitals and medical risk classification. Track daily symptoms with instant SHAP attribution breakdowns, anomaly alerting, and statistical correlation discovery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              Start Health Triage <ArrowRight className="h-5 w-5" />
            </Link>

            <button
              onClick={handleDemoClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600 whitespace-nowrap"
            >
              Explore Live Demo
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Heavy Transformers</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Free Tier Deployable</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Privacy First SQLite</span>
          </div>
        </div>
      </section>

      {/* Value Grid Section */}
      <section className="py-24 bg-slate-900/60 border-t border-slate-800 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Real Machine Learning. Zero Monolithic Bloat.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              We eliminated generic averaging and 500MB vision transformers in favor of specialized, highly interpretable gradient boosted decision trees and statistical correlation engines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 hover:border-slate-700 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                LightGBM Triage & SHAP Explainers
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Every symptom log runs through our specialized 15-class disease triage classifier. SHAP TreeExplainers calculate precise Shapley attribution values so you know exactly which symptom drove your assessment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 hover:border-slate-700 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 mb-6">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Isolation Forest Anomaly Detection
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Unsupervised anomaly algorithms scan your biometric vital signs (sleep, stress level, hydration, temperature, heart rate) to instantly flag physiological outlier check-ins and warn you before symptoms escalate.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 hover:border-slate-700 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-6">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-3">
                Longitudinal $p$-Value Correlations
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We perform rigorous Scipy hypothesis testing across your health timeline, computing Pearson and Spearman correlation coefficients and Mutual Information scores to isolate true lifestyle triggers from protective factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Callout */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to experience intelligent health tracking?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8">
              Whether you are evaluating biometrics for daily self-care or preparing structured data for your doctor, HealthGuard puts explainable AI at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition whitespace-nowrap"
              >
                Create Your Account
              </Link>
              <button
                onClick={handleDemoClick}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition whitespace-nowrap"
              >
                Try Guest Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">HealthGuard AI-ML Engine</span>
          </div>
          <p>⚠️ For educational and research purposes only. Does not constitute medical advice or definitive diagnosis.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-slate-300 transition">Sign In</Link>
            <Link href="/register" className="hover:text-slate-300 transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
