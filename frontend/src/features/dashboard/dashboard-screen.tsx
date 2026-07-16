"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, FileDown, Sparkles, ShieldAlert, X } from "lucide-react";
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

import { SectionCard } from "@/components/shared/section-card";
import { SeverityBadge, TriageBadge } from "@/components/shared/severity-badge";
import { StatCard } from "@/components/shared/stat-card";
import { MemberAvatar } from "@/components/shared/member-avatar";
import { Button } from "@/components/ui/button";
import { getDashboard, getReport, getLongitudinalAnalysis } from "@/lib/api/healthguard";
import { USE_MOCK_DATA } from "@/lib/api/client";
import { useFamily } from "@/lib/family";
import { RELATION_LABELS } from "@/lib/api/types";

export function DashboardScreen() {
  const { activeMember } = useFamily();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ["dashboard", activeMember?.id],
    queryFn: () => getDashboard(activeMember?.id),
  });

  const { data: longData } = useQuery({
    queryKey: ["longitudinal", activeMember?.id],
    queryFn: () => getLongitudinalAnalysis(activeMember?.id),
  });

  if (!data) {
    return null;
  }

  const hasEmergencySymptom = data.recentSymptoms.some(
    (s) => s.triage_level === "Emergency" || s.is_anomaly === 1,
  );

  return (
    <div className="space-y-6">
      {/* Emergency alert banner */}
      {hasEmergencySymptom && !bannerDismissed && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              A recent check-in was flagged as Emergency or anomalous
            </p>
            <p className="mt-0.5 text-xs text-red-700">
              Review the check-in history below and consider contacting a doctor.
            </p>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="rounded-md p-1 text-red-500 hover:bg-red-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Active member banner */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
        {activeMember ? (
          <>
            <MemberAvatar name={activeMember.name} color={activeMember.avatar_color} size="md" />
            <div>
              <p className="text-sm font-semibold text-foreground">Viewing: {activeMember.name}</p>
              <p className="text-xs text-muted-foreground">
                {RELATION_LABELS[activeMember.relation] ?? activeMember.relation} · {activeMember.age_range}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Viewing all family members</p>
        )}
      </div>

      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Symptom trends, trigger frequency, and care-prep actions in one place.
        </p>
      </div>

      {/* Anomaly alert */}
      {longData?.recent_anomaly_detected && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Biometric outlier detected</p>
            <p className="mt-0.5 text-xs text-amber-700">
              {longData.anomaly_alert_message || "An unusual combination of sleep, stress, and severity was detected in a recent check-in."}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Symptom logs"
          value={String(data.metrics.symptomLogs)}
          detail="Captured across recent entries"
          icon="logs"
          accent="blue"
        />
        <StatCard
          title="Tracked symptoms"
          value={String(data.metrics.trackedSymptoms)}
          detail="Symptoms with analysis-ready history"
          icon="symptoms"
          accent="green"
        />
        <StatCard
          title="Active medications"
          value={String(data.metrics.activeMedications)}
          detail="Current medication tracker count"
          icon="medications"
          accent="amber"
        />
        <StatCard
          title="Average severity"
          value={`${data.metrics.averageSeverity}/10`}
          detail="Across summarized symptom history"
          icon="severity"
          accent="red"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr,1fr]">
        <SectionCard
          title="Severity trend"
          description="A rolling view of recent symptom intensity."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.dailyAverageSeverity}>
                <defs>
                  <linearGradient id="severity" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="averageSeverity"
                  stroke="hsl(var(--primary))"
                  fill="url(#severity)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Quick actions"
          description="Guide users toward the next useful task."
        >
          <div className="space-y-3">
            {[
              "Log a symptom with triggers and relief",
              "Review medication notes before an appointment",
              "Export a report for a doctor conversation",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3.5 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {USE_MOCK_DATA ? (
              <div className="rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-sm text-muted-foreground">
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.topTriggers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="trigger" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent symptom feed"
          description="Last 5 check-ins for the active profile."
        >
          <div className="space-y-2.5">
            {data.recentSymptoms.length === 0 && (
              <p className="text-sm text-muted-foreground">No check-ins yet.</p>
            )}
            {data.recentSymptoms.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-white px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground capitalize truncate">
                      {entry.symptom}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
                    </p>
                    {entry.triage_level && (
                      <div className="mt-1.5">
                        <TriageBadge level={entry.triage_level} />
                      </div>
                    )}
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
