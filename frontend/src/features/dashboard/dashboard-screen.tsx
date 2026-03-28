"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileDown, Sparkles } from "lucide-react";
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
import { getDashboard, getReport } from "@/lib/api/healthguard";

export function DashboardScreen() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title="A product-grade command center for your health signals"
        description="Monitor symptom trends, trigger frequency, medication context, and care-prep actions from a single dashboard."
        badge="Main dashboard"
      />

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
          action={<Badge>Updated from backend</Badge>}
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
            <a href={getReport()} target="_blank" rel="noreferrer">
              <Button className="w-full">
                <FileDown className="h-4 w-4" />
                Download health report
              </Button>
            </a>
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
