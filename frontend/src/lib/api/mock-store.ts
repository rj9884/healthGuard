import type {
  AnalysisSummaryItem,
  DashboardPayload,
  MedicationEntry,
  PatternResponse,
  SymptomEntry,
} from "@/lib/api/types";
import { mockMedications, mockSymptoms } from "@/lib/api/mock-data";

let symptomStore: SymptomEntry[] = structuredClone(mockSymptoms);
let medicationStore: MedicationEntry[] = structuredClone(mockMedications);

function normalizeDuration(entry: SymptomEntry) {
  return entry.durationHr ?? entry.duration_hr ?? null;
}

function normalizeMedicationDate(entry: MedicationEntry) {
  return entry.startDate ?? entry.start_date ?? null;
}

export function getMockSymptoms(): SymptomEntry[] {
  return symptomStore;
}

export function addMockSymptom(
  payload: Omit<SymptomEntry, "id" | "timestamp"> & { duration_hr?: number | null },
): SymptomEntry {
  const nextEntry: SymptomEntry = {
    id: symptomStore.length + 1,
    timestamp: new Date().toISOString(),
    symptom: payload.symptom,
    severity: payload.severity,
    durationHr: payload.duration_hr ?? payload.durationHr ?? null,
    triggers: payload.triggers ?? [],
    relief: payload.relief ?? [],
    notes: payload.notes ?? null,
  };
  symptomStore = [nextEntry, ...symptomStore];
  return nextEntry;
}

export function getMockMedications(): MedicationEntry[] {
  return medicationStore;
}

export function addMockMedication(
  payload: Omit<MedicationEntry, "id"> & { start_date?: string | null },
): MedicationEntry {
  const nextEntry: MedicationEntry = {
    id: medicationStore.length + 1,
    name: payload.name,
    dosage: payload.dosage ?? null,
    frequency: payload.frequency ?? null,
    startDate: payload.start_date ?? payload.startDate ?? null,
    notes: payload.notes ?? null,
  };
  medicationStore = [nextEntry, ...medicationStore];
  return nextEntry;
}

export function removeMockMedication(id: number): void {
  medicationStore = medicationStore.filter((item) => item.id !== id);
}

export function getMockSummary(): AnalysisSummaryItem[] {
  const grouped = new Map<string, { count: number; totalSeverity: number }>();

  for (const entry of symptomStore) {
    const current = grouped.get(entry.symptom) ?? { count: 0, totalSeverity: 0 };
    current.count += 1;
    current.totalSeverity += entry.severity;
    grouped.set(entry.symptom, current);
  }

  return [...grouped.entries()]
    .map(([symptom, value]) => ({
      symptom,
      count: value.count,
      avg_severity: Number((value.totalSeverity / value.count).toFixed(1)),
    }))
    .sort((left, right) => right.count - left.count);
}

export function getMockPatterns(symptom: string): PatternResponse {
  const rows = symptomStore.filter((entry) => entry.symptom === symptom);
  if (!rows.length) {
    return { message: "No logs available yet for this symptom.", triggers: [] };
  }

  const triggerMap = new Map<string, { count: number; totalSeverity: number }>();
  for (const row of rows) {
    for (const trigger of row.triggers ?? []) {
      const current = triggerMap.get(trigger) ?? { count: 0, totalSeverity: 0 };
      current.count += 1;
      current.totalSeverity += row.severity;
      triggerMap.set(trigger, current);
    }
  }

  const maxCount = Math.max(1, ...[...triggerMap.values()].map((value) => value.count));
  const triggers = [...triggerMap.entries()]
    .map(([trigger, value]) => ({
      triggers: trigger,
      count: value.count,
      avg_severity: Number((value.totalSeverity / value.count).toFixed(1)),
      confidence: Number(
        ((value.count / maxCount) * 0.6 + (value.totalSeverity / value.count / 10) * 0.4).toFixed(2),
      ),
    }))
    .sort((left, right) => right.confidence - left.confidence);

  return {
    symptom,
    total_logs: rows.length,
    triggers,
    message:
      rows.length < 5
        ? "Mock mode is showing illustrative correlations with fewer than five entries."
        : undefined,
  };
}

export function getMockDashboard(): DashboardPayload {
  const summary = getMockSummary();
  const triggerCounts = new Map<string, number>();

  for (const entry of symptomStore) {
    for (const trigger of entry.triggers ?? []) {
      triggerCounts.set(trigger, (triggerCounts.get(trigger) ?? 0) + 1);
    }
  }

  return {
    metrics: {
      symptomLogs: symptomStore.length,
      trackedSymptoms: summary.length,
      activeMedications: medicationStore.length,
      averageSeverity: summary.length
        ? Number(
            (
              summary.reduce((accumulator, item) => accumulator + item.avg_severity, 0) /
              summary.length
            ).toFixed(1),
          )
        : 0,
    },
    recentSymptoms: symptomStore.slice(0, 6).map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp ?? null,
      symptom: entry.symptom,
      severity: entry.severity,
      durationHr: normalizeDuration(entry),
      triggers: entry.triggers ?? [],
      relief: entry.relief ?? [],
      notes: entry.notes ?? null,
    })),
    medications: medicationStore.map((entry) => ({
      id: entry.id,
      name: entry.name,
      dosage: entry.dosage ?? null,
      frequency: entry.frequency ?? null,
      startDate: normalizeMedicationDate(entry),
      notes: entry.notes ?? null,
    })),
    charts: {
      severityTrend: symptomStore
        .slice()
        .reverse()
        .map((entry) => ({
          timestamp: (entry.timestamp ?? "").slice(0, 10),
          severity: entry.severity,
          symptom: entry.symptom,
        })),
      dailyAverageSeverity: symptomStore
        .slice()
        .reverse()
        .map((entry) => ({
          date: (entry.timestamp ?? "").slice(0, 10),
          averageSeverity: entry.severity,
        })),
      symptomFrequency: summary.map((item) => ({
        symptom: item.symptom,
        count: item.count,
        averageSeverity: item.avg_severity,
      })),
      topTriggers: [...triggerCounts.entries()]
        .map(([trigger, count]) => ({ trigger, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 6),
    },
  };
}

export function getMockChatReply(message: string) {
  const lastSymptom = symptomStore[0];
  return {
    reply: `Mock mode: based on your recent ${lastSymptom?.symptom ?? "symptom"} entries, I would track severity, timing, and likely triggers before discussing the trend with a clinician. Your message was: "${message}"`,
  };
}

export function getMockImageResult() {
  return {
    observations: [
      { label: "Benign-appearing rash", score: 0.68 },
      { label: "Inflammatory skin condition", score: 0.22 },
      { label: "Pigmented lesion requiring review", score: 0.1 },
    ],
    recommendation:
      "Mock mode: document the lesion, monitor changes over time, and seek professional evaluation if it is evolving, painful, bleeding, or persistent.",
  };
}
