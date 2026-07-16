"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, ShieldAlert, Stethoscope } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

import { SectionCard } from "@/components/shared/section-card";
import { SeverityBadge, TriageBadge } from "@/components/shared/severity-badge";
import { CarePanel } from "@/components/shared/care-panel";
import { createSymptom, getSymptoms } from "@/lib/api/healthguard";
import { useFamily } from "@/lib/family";
import type { SymptomEntry, CareRecommendation } from "@/lib/api/types";
import { toast } from "sonner";

const symptomSchema = z.object({
  symptom:             z.string().min(2, "Symptom name is required"),
  severity:            z.coerce.number().min(1).max(10),
  duration_hr:         z.coerce.number().min(0).optional(),
  triggers:            z.string().optional(),
  relief:              z.string().optional(),
  notes:               z.string().optional(),
  sleep_hours:         z.coerce.number().min(1).max(14).default(7),
  stress_level:        z.coerce.number().min(1).max(10).default(5),
  hydration_liters:    z.coerce.number().min(0.5).max(5.0).default(2.0),
  body_temperature_f:  z.coerce.number().min(96.0).max(104.0).default(98.6),
  heart_rate_bpm:      z.coerce.number().min(50).max(160).default(72),
});
type SymptomFormValues = z.infer<typeof symptomSchema>;

function SliderField({
  label,
  sublabel,
  name,
  min,
  max,
  step,
  value,
  register,
}: {
  label: string;
  sublabel?: string;
  name: string;
  min: number;
  max: number;
  step: number;
  value: number;
  register: ReturnType<typeof useForm<SymptomFormValues>>["register"];
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{label} <span className="text-primary font-bold">{value}</span></span>
        {sublabel && <span className="text-muted-foreground">{sublabel}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} {...register(name as any)} />
    </div>
  );
}

export function SymptomsScreen() {
  const qc = useQueryClient();
  const { activeMember } = useFamily();
  const [latestRec, setLatestRec] = useState<{ rec: CareRecommendation; memberName?: string | null } | null>(null);

  const { data: symptoms = [] } = useQuery({
    queryKey: ["symptoms", activeMember?.id],
    queryFn:  () => getSymptoms(activeMember?.id),
  });

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptom: "", severity: 5, duration_hr: 2, triggers: "", relief: "", notes: "",
      sleep_hours: 7, stress_level: 5, hydration_liters: 2.0, body_temperature_f: 98.6, heart_rate_bpm: 72,
    },
  });

  const watched = form.watch();

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await createSymptom({
        member_id:          activeMember?.id ?? null,
        symptom:            values.symptom,
        severity:           values.severity,
        duration_hr:        values.duration_hr ?? 2,
        triggers:           values.triggers?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
        relief:             values.relief?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
        notes:              values.notes || null,
        sleep_hours:        values.sleep_hours,
        stress_level:       values.stress_level,
        hydration_liters:   values.hydration_liters,
        body_temperature_f: values.body_temperature_f,
        heart_rate_bpm:     values.heart_rate_bpm,
      }) as SymptomEntry & { care_recommendation?: CareRecommendation };

      if (result.care_recommendation) {
        setLatestRec({ rec: result.care_recommendation, memberName: activeMember?.name });
      }

      toast.success("Check-in logged and analysed.");
      qc.invalidateQueries({ queryKey: ["symptoms"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      form.reset({
        symptom: "", severity: 5, duration_hr: 2, triggers: "", relief: "", notes: "",
        sleep_hours: 7, stress_level: 5, hydration_liters: 2.0, body_temperature_f: 98.6, heart_rate_bpm: 72,
      });
    } catch {
      toast.error("Could not save check-in. Is the backend running?");
    }
  });

  const inputCls = "mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Daily Check-In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeMember
            ? `Logging for ${activeMember.name} — switch profiles in the top bar to change.`
            : "Log symptoms and vitals for ML triage analysis."}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* ── Form ─────────────────────────────── */}
        <div className="space-y-4">
          <SectionCard title="Symptom & vitals log">
            <form className="space-y-5" onSubmit={onSubmit}>
              {/* Symptom */}
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="symptom">
                  Primary symptom or complaint <span className="text-red-500">*</span>
                </label>
                <input
                  id="symptom"
                  {...form.register("symptom")}
                  placeholder="e.g. headache, chest tightness, fatigue"
                  className={inputCls}
                />
                {form.formState.errors.symptom && (
                  <p className="mt-1 text-xs text-red-600">{form.formState.errors.symptom.message}</p>
                )}
              </div>

              {/* Sliders */}
              <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/30">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vitals & biometrics</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SliderField label="Severity" sublabel="10 = unbearable" name="severity" min={1} max={10} step={1} value={watched.severity} register={form.register} />
                  <SliderField label="Sleep" sublabel="hours last night" name="sleep_hours" min={1} max={14} step={0.5} value={watched.sleep_hours} register={form.register} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <SliderField label="Stress" name="stress_level" min={1} max={10} step={1} value={watched.stress_level} register={form.register} />
                  <SliderField label="Hydration (L)" name="hydration_liters" min={0.5} max={5} step={0.25} value={watched.hydration_liters} register={form.register} />
                  <SliderField label="Heart rate (bpm)" name="heart_rate_bpm" min={50} max={160} step={1} value={watched.heart_rate_bpm} register={form.register} />
                </div>
              </div>

              {/* Duration, triggers, relief */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="duration_hr">Duration (hours)</label>
                  <input id="duration_hr" type="number" min={0} step={0.5} {...form.register("duration_hr")} className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="body_temperature_f">Temperature (°F)</label>
                  <input id="body_temperature_f" type="number" step={0.1} {...form.register("body_temperature_f")} className={inputCls} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="triggers">Possible triggers</label>
                  <input id="triggers" placeholder="stress, dairy, missed meal…" {...form.register("triggers")} className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="relief">What helped</label>
                  <input id="relief" placeholder="rest, water, ibuprofen…" {...form.register("relief")} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="notes">Additional notes</label>
                <textarea id="notes" rows={2} placeholder="Any context useful for pattern analysis…" {...form.register("notes")} className={inputCls + " resize-none"} />
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
              >
                <Stethoscope className="h-4 w-4" /> Log check-in & run analysis
              </button>
            </form>
          </SectionCard>

          {/* Care recommendation panel — appears after a check-in */}
          {latestRec && (
            <SectionCard title="Care guidance">
              <CarePanel rec={latestRec.rec} memberName={latestRec.memberName} />
            </SectionCard>
          )}
        </div>

        {/* ── History ──────────────────────────── */}
        <SectionCard
          title="Check-in history"
          description={activeMember ? `Showing records for ${activeMember.name}` : "All members"}
        >
          {symptoms.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No check-ins yet</p>
              <p className="text-xs text-muted-foreground/70">Submit the form to generate your first triage result.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
              {symptoms.map((entry) => (
                <SymptomCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function SymptomCard({ entry }: { entry: SymptomEntry }) {
  const [expanded, setExpanded] = useState(false);
  const hasShap = !!entry.shap_explanation_json?.human_readable_summary;

  return (
    <div className="rounded-lg border border-border bg-white p-4 transition hover:border-primary/30 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground capitalize">{entry.symptom}</span>
            {entry.is_anomaly === 1 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                <ShieldAlert className="h-2.5 w-2.5" /> Anomaly
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "—"}
            {(entry.triggers ?? []).length > 0 && ` · ${entry.triggers!.join(", ")}`}
          </p>
        </div>
        <SeverityBadge severity={entry.severity} />
      </div>

      {(entry.triage_level || entry.predicted_disease_risk) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {entry.triage_level && <TriageBadge level={entry.triage_level} />}
          {entry.predicted_disease_risk && (
            <span className="text-xs text-muted-foreground">Risk pattern: <span className="font-medium text-foreground">{entry.predicted_disease_risk}</span></span>
          )}
        </div>
      )}

      {hasShap && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[11px] font-semibold text-primary hover:underline"
        >
          {expanded ? "Hide" : "Show"} AI explanation
        </button>
      )}
      {expanded && hasShap && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground border-t border-border pt-2">
          {entry.shap_explanation_json!.human_readable_summary}
        </p>
      )}
    </div>
  );
}
