"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Activity, Cpu, ShieldAlert, Sparkles } from "lucide-react";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { createSymptom, getSymptoms } from "@/lib/api/healthguard";
import { toast } from "sonner";

const symptomSchema = z.object({
  symptom: z.string().min(2, "Symptom name is required"),
  severity: z.coerce.number().min(1).max(10),
  duration_hr: z.coerce.number().min(0).optional(),
  triggers: z.string().optional(),
  relief: z.string().optional(),
  notes: z.string().optional(),
  sleep_hours: z.coerce.number().min(1).max(14).default(7),
  stress_level: z.coerce.number().min(1).max(10).default(5),
  hydration_liters: z.coerce.number().min(0.5).max(5.0).default(2.0),
  body_temperature_f: z.coerce.number().min(96.0).max(104.0).default(98.6),
  heart_rate_bpm: z.coerce.number().min(50).max(160).default(72),
});

type SymptomFormValues = z.infer<typeof symptomSchema>;

export function SymptomsScreen() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["symptoms"],
    queryFn: getSymptoms,
  });

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptom: "",
      severity: 5,
      duration_hr: 2,
      triggers: "",
      relief: "",
      notes: "",
      sleep_hours: 7,
      stress_level: 5,
      hydration_liters: 2.0,
      body_temperature_f: 98.6,
      heart_rate_bpm: 72,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createSymptom({
        symptom: values.symptom,
        severity: values.severity,
        duration_hr: values.duration_hr ?? 2,
        triggers: values.triggers
          ? values.triggers.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        relief: values.relief
          ? values.relief.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        notes: values.notes || null,
        sleep_hours: values.sleep_hours,
        stress_level: values.stress_level,
        hydration_liters: values.hydration_liters,
        body_temperature_f: values.body_temperature_f,
        heart_rate_bpm: values.heart_rate_bpm,
      });
      toast.success("Check-In logged! Running LightGBM triage & SHAP explainers in background...");
      await queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["longitudinal"] });
      await queryClient.invalidateQueries({ queryKey: ["analysis-summary"] });
      form.reset({
        symptom: "",
        severity: 5,
        duration_hr: 2,
        triggers: "",
        relief: "",
        notes: "",
        sleep_hours: 7,
        stress_level: 5,
        hydration_liters: 2.0,
        body_temperature_f: 98.6,
        heart_rate_bpm: 72,
      });
    } catch {
      toast.error("Could not save symptom check-in");
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Clinical Check-In"
        title="Log daily symptoms & biometric vitals for LightGBM Triage"
        description="Our machine learning engines analyze your severity, sleep, stress, and hydration to compute real-time Shapley attribution values and anomaly scores."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <SectionCard
          title="Daily Biometric & Symptom Log"
          description="Interactive biometric sliders and clinical symptom fields."
        >
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="symptom" className="font-bold text-slate-800">Primary Symptom or Complaint</Label>
              <Input id="symptom" placeholder="e.g., Severe Headache, Chest Tightness, Fatigue" className="mt-1" {...form.register("symptom")} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-600" /> Real-Time Biometric Vitals Sliders
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Severity ({form.watch("severity")}/10)</span>
                    <span className="text-muted-foreground">10 = unbearable</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    {...form.register("severity")}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Sleep ({form.watch("sleep_hours")} hours)</span>
                    <span className="text-muted-foreground">Target: 7-8 hrs</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={14}
                    step={0.5}
                    {...form.register("sleep_hours")}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Stress ({form.watch("stress_level")}/10)</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    {...form.register("stress_level")}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Hydration ({form.watch("hydration_liters")} L)</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={5.0}
                    step={0.25}
                    {...form.register("hydration_liters")}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Heart Rate ({form.watch("heart_rate_bpm")} bpm)</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={160}
                    step={1}
                    {...form.register("heart_rate_bpm")}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="triggers" className="font-semibold text-slate-700">Possible Triggers</Label>
                <Input id="triggers" placeholder="e.g., Dehydration, missed sleep, work stress" className="mt-1" {...form.register("triggers")} />
              </div>
              <div>
                <Label htmlFor="relief" className="font-semibold text-slate-700">What Provided Relief</Label>
                <Input id="relief" placeholder="e.g., Hydration, rest, medication" className="mt-1" {...form.register("relief")} />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="font-semibold text-slate-700">Clinical Context / Additional Notes</Label>
              <Textarea id="notes" placeholder="Any additional background for pattern correlation analysis..." className="mt-1" {...form.register("notes")} />
            </div>

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-base py-6 rounded-xl shadow-md" type="submit">
              Run ML Triage & Save Check-In
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Clinical Triage Feed"
          description="Real-time LightGBM classifications & SHAP attribution explainers."
        >
          {!data?.length ? (
            <EmptyState
              icon={ClipboardList}
              title="No check-ins recorded yet"
              description="Log your first check-in above to generate explainable clinical risk predictions."
            />
          ) : (
            <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
              {data.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-display text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                        {entry.symptom}
                        {entry.is_anomaly === 1 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-200" title="Outlier flagged by Isolation Forest">
                            <ShieldAlert className="h-3 w-3" /> Anomaly
                          </span>
                        )}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Triggers: {(entry.triggers ?? []).join(", ") || "None specified"}
                      </p>
                    </div>
                    <SeverityBadge severity={entry.severity} />
                  </div>

                  {/* ML Triage Results Badge */}
                  {entry.triage_level && (
                    <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <Cpu className="h-3.5 w-3.5" /> {entry.triage_level}
                        </span>
                        {entry.predicted_disease_risk && (
                          <span className="text-slate-600 font-semibold">Risk: {entry.predicted_disease_risk}</span>
                        )}
                      </div>
                      {entry.shap_explanation_json?.human_readable_summary && (
                        <p className="text-slate-600 font-medium leading-relaxed">
                          {entry.shap_explanation_json.human_readable_summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
