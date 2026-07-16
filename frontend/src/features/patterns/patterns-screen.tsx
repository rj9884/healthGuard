"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAnalysisSummary, getPatterns, getLongitudinalAnalysis } from "@/lib/api/healthguard";
import { useFamily } from "@/lib/family";
import { cn } from "@/lib/utils/cn";

function impactStyle(impact: string): string {
  const lower = impact.toLowerCase();
  if (lower.includes("aggravating")) return "bg-red-50 text-red-700 border-red-200";
  if (lower.includes("protective")) return "bg-green-50 text-green-700 border-green-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export function PatternsScreen() {
  const { activeMember } = useFamily();

  const { data: summary = [] } = useQuery({
    queryKey: ["analysis-summary", activeMember?.id],
    queryFn: getAnalysisSummary,
  });
  const selectedDefault = summary[0]?.symptom ?? "headache";
  const [selectedSymptom, setSelectedSymptom] = useState(selectedDefault);

  useEffect(() => {
    if (summary[0]?.symptom && !summary.some((item) => item.symptom === selectedSymptom)) {
      setSelectedSymptom(summary[0].symptom);
    }
  }, [selectedSymptom, summary]);

  const { data: patternData } = useQuery({
    queryKey: ["patterns", selectedSymptom],
    queryFn: () => getPatterns(selectedSymptom),
    enabled: Boolean(selectedSymptom),
  });

  const { data: longData } = useQuery({
    queryKey: ["longitudinal", activeMember?.id],
    queryFn: () => getLongitudinalAnalysis(activeMember?.id),
  });

  const chartData = useMemo(
    () =>
      (patternData?.triggers ?? []).map((item) => ({
        trigger: item.triggers,
        confidence: item.confidence,
      })),
    [patternData],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Patterns & Correlations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Statistical correlation and mutual information across your symptom history, used to separate real triggers from noise.
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

      {/* Correlation matrix */}
      {longData && longData.correlation_matrix && longData.correlation_matrix.length > 0 && (
        <SectionCard
          title="Correlation matrix"
          description={`Computed across ${longData.total_logs_analyzed} health check-ins.`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Trigger / vital</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Impact</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Correlation (r)</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">p-value</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Mutual info</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Significance</th>
                </tr>
              </thead>
              <tbody>
                {longData.correlation_matrix.map((item, idx) => (
                  <tr key={idx} className={cn("border-b border-border", idx % 2 === 1 && "bg-muted/40")}>
                    <td className="px-4 py-2.5 font-medium text-foreground">{item.label}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", impactStyle(item.impact))}>
                        {item.impact}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">
                      {item.correlation_r > 0 ? `+${item.correlation_r}` : item.correlation_r}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {item.p_value < 0.001 ? "< 0.001" : item.p_value}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{item.mutual_info}</td>
                    <td className="px-4 py-2.5">
                      {item.is_significant ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                          <ShieldCheck className="h-3.5 w-3.5" /> Significant
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not significant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <SectionCard
            key={item.symptom}
            title={item.symptom}
            description={`${item.count} logs captured`}
            action={<Badge>{item.avg_severity}/10 avg</Badge>}
          >
            <button
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setSelectedSymptom(item.symptom)}
              type="button"
            >
              Inspect this symptom
            </button>
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <SectionCard
          title="Trigger confidence"
          description="Confidence score per trigger for the selected symptom."
          action={<Badge variant="outline">{selectedSymptom}</Badge>}
        >
          <div className="mb-5 flex flex-wrap gap-2">
            {summary.map((item) => (
              <button
                key={item.symptom}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                  selectedSymptom === item.symptom
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
                onClick={() => setSelectedSymptom(item.symptom)}
                type="button"
              >
                {item.symptom}
              </button>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="trigger" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 1]} />
                <Tooltip />
                <Bar dataKey="confidence" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Pattern details"
          description={patternData?.message ?? "Detailed trigger metrics for the selected symptom."}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trigger</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Avg severity</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(patternData?.triggers ?? []).map((item, idx) => (
                <TableRow key={item.triggers} className={cn(idx % 2 === 1 && "bg-muted/40")}>
                  <TableCell>{item.triggers}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{item.avg_severity}</TableCell>
                  <TableCell>{item.confidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>
    </div>
  );
}
