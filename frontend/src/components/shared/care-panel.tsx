"use client";

import { AlertTriangle, CheckCircle2, Phone, Pill } from "lucide-react";

import type { CareRecommendation } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

export function CarePanel({ rec, memberName }: { rec: CareRecommendation; memberName?: string | null }) {
  const isEmergency = rec.doctor_visit_recommended && rec.urgency_message.toLowerCase().includes("emergency");

  return (
    <div className={cn(
      "rounded-lg border p-4 space-y-3",
      isEmergency
        ? "border-red-200 bg-red-50"
        : rec.doctor_visit_recommended
          ? "border-amber-200 bg-amber-50"
          : "border-green-200 bg-green-50",
    )}>
      {/* Urgency header */}
      <div className="flex items-start gap-2">
        {isEmergency
          ? <Phone className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          : rec.doctor_visit_recommended
            ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        }
        <p className={cn(
          "text-sm font-semibold",
          isEmergency ? "text-red-800" : rec.doctor_visit_recommended ? "text-amber-800" : "text-green-800",
        )}>
          {rec.urgency_message}
        </p>
      </div>

      {/* Self-care notes */}
      {rec.self_care_notes && (
        <p className="text-xs leading-relaxed text-foreground/80">{rec.self_care_notes}</p>
      )}

      {/* WHO medications */}
      {rec.suggested_medications.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/60">
            <Pill className="h-3 w-3" /> WHO Essential Medicines reference
          </p>
          {rec.suggested_medications.map((med) => (
            <div key={med.generic_name} className="rounded-md border border-border bg-white p-3 text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground capitalize">{med.generic_name}</span>
                <div className="flex gap-1">
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">{med.category}</span>
                  {med.otc && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">OTC</span>}
                </div>
              </div>
              <p className="text-muted-foreground">{med.typical_adult_dose}</p>
              {med.caution && (
                <p className="text-amber-700 font-medium">⚠ {med.caution}</p>
              )}
              {med.live_label_data?.brand_names && med.live_label_data.brand_names.length > 0 && (
                <p className="text-muted-foreground">Brands: {med.live_label_data.brand_names.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] leading-relaxed text-muted-foreground border-t border-border/60 pt-2">
        {rec.disclaimer}
      </p>
    </div>
  );
}
