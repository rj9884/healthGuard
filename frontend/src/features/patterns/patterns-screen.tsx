"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
import { getAnalysisSummary, getPatterns } from "@/lib/api/healthguard";

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
        eyebrow="Patterns"
        title="Turn raw logs into trigger-level pattern visibility"
        description="This analysis surface helps users inspect what shows up most often and how strongly it correlates with symptom intensity."
      />

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
