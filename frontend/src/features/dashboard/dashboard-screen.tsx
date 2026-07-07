"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileDown, Sparkles, ShieldAlert, Cpu, HeartPulse, CheckCircle2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboard, getReport, getLongitudinalAnalysis } from "@/lib/api/healthguard";
import { USE_MOCK_DATA } from "@/lib/api/client";

export function DashboardScreen() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const { data: longData } = useQuery({
    queryKey: ["longitudinal"],
    queryFn: getLongitudinalAnalysis,
  });

  if (!data) {
    return null;
  }

  const latestWithShap = data.recentSymptoms.find((s) => s.triage_level || s.shap_explanation_json);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="A product-grade command center for your health signals"
        description="Monitor symptom trends, trigger frequency, medication context, and care-prep actions from a single dashboard."
        badge="Main dashboard"
      />

      {/* Isolation Forest Anomaly Alert Banner */}
      {longData?.recent_anomaly_detected && (
        <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-6 shadow-soft animate-pulse">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-500/20 p-3 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Isolation Forest Biometric Outlier Alert
                </span>
              </div>
              <h3 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                Physiological Anomaly Detected in Recent Check-In
              </h3>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {longData.anomaly_alert_message || "Our unsupervised model detected an unusual convergence of sleep deprivation, high stress, and elevated severity."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Latest SHAP Clinical Triage Breakdown */}
      {latestWithShap && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-white to-slate-50 p-6 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-emerald-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-600 p-3 text-white shadow-md">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Explainable AI (SHAP TreeExplainer)
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 capitalize">
                  Latest Triage Assessment: {latestWithShap.symptom}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                Triage Level: {latestWithShap.triage_level || "Routine Checkup"}
              </span>
              {latestWithShap.predicted_disease_risk && (
                <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                  Risk Category: {latestWithShap.predicted_disease_risk}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-700 mb-4 font-medium">
            {latestWithShap.shap_explanation_json?.human_readable_summary || 
              `Your assessment for ${latestWithShap.predicted_disease_risk || latestWithShap.symptom} was calculated using gradient boosted trees.`}
          </p>

          {latestWithShap.shap_explanation_json?.top_contributing_features && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Top Contributing Shapley Attribution Factors
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {latestWithShap.shap_explanation_json.top_contributing_features.slice(0, 3).map((feat: any, idx: number) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{feat.label}</span>
                      <span className="text-xs font-extrabold text-emerald-600">+{feat.importance_score}% impact</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Symptom logs"
          value={String(data.metrics.symptomLogs)}
          detail="Captured across recent entries"
          icon="logs"
        />
        <StatCard
          title="Tracked symptoms"
          value={String(data.metrics.trackedSymptoms)}
          detail="Symptoms with analysis-ready history"
          icon="symptoms"
        />
        <StatCard
          title="Active medications"
          value={String(data.metrics.activeMedications)}
          detail="Current medication tracker count"
          icon="medications"
        />
        <StatCard
          title="Average severity"
          value={`${data.metrics.averageSeverity}/10`}
          detail="Across summarized symptom history"
          icon="severity"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <SectionCard
          title="Severity trend"
          description="A rolling view of recent symptom intensity."
          action={<Badge>{USE_MOCK_DATA ? "Mock data" : "Live backend"}</Badge>}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.dailyAverageSeverity}>
                <defs>
                  <linearGradient id="severity" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce7e5" />
                <XAxis dataKey="date" stroke="#6b7c78" />
                <YAxis stroke="#6b7c78" domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="averageSeverity"
                  stroke="#0f766e"
                  fill="url(#severity)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Guide users toward the next useful task."
        >
          <div className="space-y-4">
            {[
              "Log a symptom with triggers and relief",
              "Review medication notes before an appointment",
              "Export a report for a doctor conversation",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {USE_MOCK_DATA ? (
              <div className="rounded-2xl border border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
                Mock mode is active. The patterns page includes a report preview for UI review.
              </div>
            ) : (
              <a href={getReport()} target="_blank" rel="noreferrer">
                <Button className="w-full">
                  <FileDown className="h-4 w-4" />
                  Download health report
                </Button>
              </a>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <SectionCard
          title="Most common triggers"
          description="Trigger frequency from recent analysis-ready logs."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.topTriggers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce7e5" />
                <XAxis dataKey="trigger" stroke="#6b7c78" />
                <YAxis stroke="#6b7c78" />
                <Tooltip />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} fill="#0f766e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent symptom feed"
          description="A timeline for the latest high-signal entries."
        >
          <div className="space-y-3">
            {data.recentSymptoms.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-border bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold capitalize">
                      {entry.symptom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.triggers.join(", ") || "No triggers recorded"}
                    </p>
                  </div>
                  <SeverityBadge severity={entry.severity} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
