"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList } from "lucide-react";
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
  symptom: z.string().min(2),
  severity: z.coerce.number().min(1).max(10),
  duration_hr: z.coerce.number().min(0).optional(),
  triggers: z.string().optional(),
  relief: z.string().optional(),
  notes: z.string().optional(),
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
      duration_hr: 0,
      triggers: "",
      relief: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createSymptom({
        symptom: values.symptom,
        severity: values.severity,
        duration_hr: values.duration_hr ?? null,
        triggers: values.triggers
          ? values.triggers.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        relief: values.relief
          ? values.relief.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        notes: values.notes || null,
      });
      toast.success("Symptom entry saved");
      await queryClient.invalidateQueries({ queryKey: ["symptoms"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["analysis-summary"] });
      form.reset();
    } catch {
      toast.error("Could not save symptom entry");
    }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Symptoms"
        title="Log symptoms with structure strong enough for trend analysis"
        description="Capture severity, duration, triggers, and relief in one place so both analytics and AI guidance have better context."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <SectionCard
          title="New symptom entry"
          description="Write logs the way a product would expect: clean fields, clear labels, and validation."
        >
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="symptom">Symptom</Label>
              <Input id="symptom" placeholder="Headache" {...form.register("symptom")} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="severity">Severity (1-10)</Label>
                <Input id="severity" type="number" min={1} max={10} {...form.register("severity")} />
              </div>
              <div>
                <Label htmlFor="duration_hr">Duration (hours)</Label>
                <Input id="duration_hr" type="number" step="0.5" {...form.register("duration_hr")} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="triggers">Possible triggers</Label>
                <Input id="triggers" placeholder="Stress, poor sleep" {...form.register("triggers")} />
              </div>
              <div>
                <Label htmlFor="relief">What helped</Label>
                <Input id="relief" placeholder="Water, rest" {...form.register("relief")} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Additional notes</Label>
              <Textarea id="notes" placeholder="Anything contextual that may matter later." {...form.register("notes")} />
            </div>
            <Button className="w-full" type="submit">
              Save symptom entry
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Recent entries"
          description="A clinical, readable timeline of the latest recorded symptom events."
        >
          {!data?.length ? (
            <EmptyState
              icon={ClipboardList}
              title="No symptom entries yet"
              description="Once symptoms are recorded, they will appear here with severity, triggers, and notes."
            />
          ) : (
            <div className="space-y-3">
              {data.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border bg-white px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="font-display text-lg font-semibold capitalize">{entry.symptom}</p>
                      <p className="text-sm text-muted-foreground">
                        {(entry.triggers ?? []).join(", ") || "No triggers recorded"}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.notes ?? "No notes recorded"}</p>
                    </div>
                    <SeverityBadge severity={entry.severity} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
