"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, PillBottle } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";
import { createMedication, getMedications } from "@/lib/api/healthguard";
import { toast } from "sonner";

const medicationSchema = z.object({
  name: z.string().min(2),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  start_date: z.string().optional(),
  notes: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

export function MedicationsScreen() {
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["medications"],
    queryFn: getMedications,
  });

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      start_date: "",
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createMedication({
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Medications"
        title="Medication tracking that feels clinical, clear, and review-ready"
        description="Keep dosage, timing, and notes cleanly documented so medication context stays useful alongside symptoms and reports."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <SectionCard
          title="Add medication"
          description="A form structured for long-term product use, not one-off notes."
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
          description="Active medication cards with hierarchy, notes, and warning states."
        >
          {!data.length ? (
            <EmptyState
              icon={PillBottle}
              title="No medications recorded"
              description="Medication cards will appear here with dosage, timing, and contextual warnings."
            />
          ) : (
            <div className="space-y-4">
              {data.map((medication) => {
                const flagged = ["Ibuprofen", "Aspirin"].includes(medication.name);
                return (
                  <div
                    key={medication.id}
                    className="rounded-2xl border border-border bg-white px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="font-display text-lg font-semibold">{medication.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {medication.dosage ?? "No dosage"} · {medication.frequency ?? "No frequency"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Started {medication.startDate ?? medication.start_date ?? "not recorded"}
                        </p>
                        <p className="text-sm text-muted-foreground">{medication.notes ?? "No notes"}</p>
                      </div>
                      <Badge variant={flagged ? "warning" : "success"}>
                        {flagged ? "Interaction review" : "Stable"}
                      </Badge>
                    </div>
                    {flagged ? (
                      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-warning/10 px-4 py-3 text-warning">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p className="text-sm">
                          Review this medication combination with a clinician or pharmacist before making changes.
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
