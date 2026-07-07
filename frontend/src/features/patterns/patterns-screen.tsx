"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LineChart, Sparkles, ShieldCheck, Activity } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
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

export function PatternsScreen() {
  const { data: summary = [] } = useQuery({
    queryKey: ["analysis-summary"],
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
    queryKey: ["longitudinal"],
    queryFn: getLongitudinalAnalysis,
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Patterns & Correlations"
        title="Turn longitudinal vitals into statistical hypothesis test insights"
        description="Our machine learning engine evaluates Pearson correlation coefficients (p-values) and Mutual Information across your symptom history to separate true lifestyle triggers from noise."
      />

      {/* Longitudinal Statistical Correlation Matrix Table */}
      {longData && longData.correlation_matrix && longData.correlation_matrix.length > 0 && (
        <SectionCard
          title="Longitudinal Statistical Correlation Matrix"
          description={`Computed using Scipy hypothesis testing across ${longData.total_logs_analyzed} health check-ins.`}
          action={<Badge className="bg-emerald-600 text-white">Scipy p-Value Engine</Badge>}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Biometric Trigger / Vital</TableHead>
                  <TableHead className="font-bold">Clinical Impact</TableHead>
                  <TableHead className="font-bold">Pearson Correlation (r)</TableHead>
                  <TableHead className="font-bold">Scipy p-Value</TableHead>
                  <TableHead className="font-bold">Mutual Information Score</TableHead>
                  <TableHead className="font-bold">Statistical Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {longData.correlation_matrix.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/80 transition">
                    <TableCell className="font-bold text-slate-900">{item.label}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.impact.includes("Aggravating") ? "bg-red-100 text-red-700 border border-red-200" :
                        item.impact.includes("Protective") ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {item.impact}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">{item.correlation_r > 0 ? `+${item.correlation_r}` : item.correlation_r}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{item.p_value < 0.001 ? "< 0.001" : item.p_value}</TableCell>
                    <TableCell className="font-mono">{item.mutual_info}</TableCell>
                    <TableCell>
                      {item.is_significant ? (
                        <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4" /> Significant (p &lt; 0.05)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Not significant</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SectionCard>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <SectionCard
            key={item.symptom}
            title={item.symptom}
            description={`${item.count} logs captured`}
            action={<Badge>{item.avg_severity}/10 avg severity</Badge>}
          >
            <button
              className="text-sm font-medium text-primary"
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
          description="Recharts-backed visual analysis for the selected symptom."
          action={<Badge variant="outline">{selectedSymptom}</Badge>}
        >
          <div className="mb-6 flex flex-wrap gap-2">
            {summary.map((item) => (
              <button
                key={item.symptom}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  selectedSymptom === item.symptom
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setSelectedSymptom(item.symptom)}
                type="button"
              >
                {item.symptom}
              </button>
            ))}
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dce7e5" />
                <XAxis dataKey="trigger" stroke="#6b7c78" />
                <YAxis stroke="#6b7c78" domain={[0, 1]} />
                <Tooltip />
                <Bar dataKey="confidence" fill="#0f766e" radius={[12, 12, 0, 0]} />
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
              {(patternData?.triggers ?? []).map((item) => (
                <TableRow key={item.triggers}>
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
