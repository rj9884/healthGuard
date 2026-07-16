"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { PillBottle, Sparkles, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { CarePanel } from "@/components/shared/care-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createMedication,
  getMedications,
  getMedicationSuggestions,
  removeMedication,
} from "@/lib/api/healthguard";
import { useFamily } from "@/lib/family";
import type { CareRecommendation } from "@/lib/api/types";
import { toast } from "sonner";

const medicationSchema = z.object({
  name: z.string().min(2),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.string().optional(),
  notes: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

const DISEASE_CATEGORIES = [
  "Respiratory Infection (Flu/COVID)",
  "Cardiovascular Alert (Angina/Arrhythmia)",
  "Severe Migraine / Neurological",
  "Gastrointestinal Disorder (IBS/Reflux)",
  "Metabolic / Diabetes Risk Alert",
  "Dermatological Infection / Allergic Reaction",
  "Musculoskeletal Strain & Arthritis",
  "Anxiety & Panic Attack",
  "Viral Gastroenteritis (Stomach Flu)",
  "Upper Respiratory Infection (Common Cold)",
  "Chronic Fatigue & Occupational Burnout",
  "Acute Dehydration / Electrolyte Alert",
  "Sinusitis / Facial Congestion",
  "Acute Insomnia & Sleep Deprivation",
  "General Wellness / Normal Health State",
];

const TRIAGE_LEVELS = ["Self-Care", "Routine Checkup", "Urgent Doctor", "Emergency"];

const selectCls =
  "mt-1.5 block w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";

export function MedicationsScreen() {
  const queryClient = useQueryClient();
  const { activeMember } = useFamily();

  const { data = [] } = useQuery({
    queryKey: ["medications", activeMember?.id],
    queryFn: () => getMedications(activeMember?.id),
  });

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { name: "", dosage: "", frequency: "", start_date: "", notes: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMedication({
        member_id: activeMember?.id ?? null,
        name: values.name,
        dosage: values.dosage || null,
        frequency: values.frequency || null,
        start_date: values.start_date || null,
        notes: values.notes || null,
      });
      toast.success("Medication saved");
      await queryClient.invalidateQueries({ queryKey: ["medications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      form.reset();
    } catch {
      toast.error("Could not save medication");
    }
  });

  const handleDelete = async (id: number) => {
    try {
      await removeMedication(id);
      toast.success("Medication removed");
      await queryClient.invalidateQueries({ queryKey: ["medications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch {
      toast.error("Could not remove medication");
    }
  };

  // ── WHO guidance panel state ─────────────────────────────
  const [diseaseCategory, setDiseaseCategory] = useState(DISEASE_CATEGORIES[0]);
  const [triageLevel, setTriageLevel] = useState(TRIAGE_LEVELS[0]);
  const [rec, setRec] = useState<CareRecommendation | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const fetchGuidance = async () => {
    setLoadingRec(true);
    try {
      const result = await getMedicationSuggestions({
        disease_category: diseaseCategory,
        triage_level: triageLevel,
        member_id: activeMember?.id ?? null,
      });
      setRec(result);
    } catch {
      toast.error("Could not fetch WHO guidance. Is the backend running?");
    } finally {
      setLoadingRec(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Medications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {activeMember
            ? `Tracking medications for ${activeMember.name}.`
            : "Keep dosage, timing, and notes documented alongside symptoms."}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── Left column: log form + current meds ────────── */}
        <div className="space-y-6">
          <SectionCard
            title="Add medication"
            description="Log a medication your family member is currently taking."
          >
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="name">Medication name</Label>
                <Input id="name" placeholder="Ibuprofen" {...form.register("name")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input id="dosage" placeholder="200 mg" {...form.register("dosage")} />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input id="frequency" placeholder="Twice daily" {...form.register("frequency")} />
                </div>
              </div>
              <div>
                <Label htmlFor="start_date">Start date</Label>
                <Input id="start_date" type="date" {...form.register("start_date")} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Take with food, timing details, missed doses..." {...form.register("notes")} />
              </div>
              <Button className="w-full" type="submit">
                Save medication
              </Button>
            </form>
          </SectionCard>

          <SectionCard
            title="Current medications"
            description={activeMember ? `Active medications for ${activeMember.name}` : "Active medication cards"}
          >
            {!data.length ? (
              <EmptyState
                icon={PillBottle}
                title="No medications recorded"
                description="Medication cards will appear here with dosage, timing, and contextual warnings."
              />
            ) : (
              <div className="space-y-3">
                {data.map((medication) => {
                  const isWhoSuggested = medication.source === "who_suggested";
                  return (
                    <div
                      key={medication.id}
                      className="rounded-lg border border-border bg-white px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground">{medication.name}</p>
                            {isWhoSuggested && (
                              <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                                WHO suggested
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage ?? "No dosage"} · {medication.frequency ?? "No frequency"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Started {medication.startDate ?? medication.start_date ?? "not recorded"}
                          </p>
                          {medication.notes && (
                            <p className="text-xs text-muted-foreground">{medication.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(medication.id)}
                          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete medication"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Right column: WHO guidance panel ─────────────── */}
        <div className="space-y-6">
          <SectionCard
            title="Get WHO guidance"
            description="Reference WHO Essential Medicines guidance for a symptom pattern."
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="disease_category">Disease category</Label>
                <select
                  id="disease_category"
                  className={selectCls}
                  value={diseaseCategory}
                  onChange={(e) => setDiseaseCategory(e.target.value)}
                >
                  {DISEASE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="triage_level">Triage level</Label>
                <select
                  id="triage_level"
                  className={selectCls}
                  value={triageLevel}
                  onChange={(e) => setTriageLevel(e.target.value)}
                >
                  {TRIAGE_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <Button className="w-full" onClick={fetchGuidance} disabled={loadingRec}>
                <Sparkles className="h-4 w-4" />
                {loadingRec ? "Fetching guidance…" : "Get guidance"}
              </Button>
            </div>
          </SectionCard>

          {rec && (
            <SectionCard title="Care guidance">
              <CarePanel rec={rec} memberName={activeMember?.name} />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
