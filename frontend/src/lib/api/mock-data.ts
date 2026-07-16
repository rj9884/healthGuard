import type {
  AnalysisSummaryItem,
  DashboardPayload,
  MedicationEntry,
  PatternResponse,
  SymptomEntry,
} from "@/lib/api/types";

export const mockSymptoms: SymptomEntry[] = [
  {
    id: 1,
    timestamp: "2026-03-28T08:30:00Z",
    symptom: "fatigue",
    severity: 7,
    durationHr: 5,
    triggers: ["poor sleep", "stress"],
    relief: ["rest", "hydration"],
    notes: "Low energy continued into the evening.",
  },
  {
    id: 2,
    timestamp: "2026-03-27T13:15:00Z",
    symptom: "headache",
    severity: 6,
    durationHr: 2,
    triggers: ["screen time", "stress"],
    relief: ["walk", "water"],
    notes: "Improved after stepping away from work.",
  },
  {
    id: 3,
    timestamp: "2026-03-26T19:30:00Z",
    symptom: "nausea",
    severity: 4,
    durationHr: 1,
    triggers: ["spicy food"],
    relief: ["tea", "rest"],
    notes: "Mild nausea after dinner.",
  },
  {
    id: 4,
    timestamp: "2026-03-25T11:00:00Z",
    symptom: "fatigue",
    severity: 5,
    durationHr: 4,
    triggers: ["stress", "late workout"],
    relief: ["rest"],
    notes: "Felt drained after a busy day.",
  },
];

export const mockMedications: MedicationEntry[] = [
  {
    id: 1,
    name: "Ibuprofen",
    dosage: "200 mg",
    frequency: "As needed",
    startDate: "2026-02-28",
    notes: "Used occasionally for headache relief.",
  },
  {
    id: 2,
    name: "Aspirin",
    dosage: "81 mg",
    frequency: "Once daily",
    startDate: "2025-12-28",
    notes: "Included to demonstrate interaction warnings.",
  },
  {
    id: 3,
    name: "Vitamin D",
    dosage: "1000 IU",
    frequency: "Once daily",
    startDate: "2026-01-28",
    notes: "Routine supplement.",
  },
];

export const mockSummary: AnalysisSummaryItem[] = [
  { symptom: "headache", count: 6, avg_severity: 6.5 },
  { symptom: "fatigue", count: 3, avg_severity: 6.0 },
  { symptom: "nausea", count: 1, avg_severity: 4.0 },
];

export const mockPatterns: Record<string, PatternResponse> = {
  headache: {
    symptom: "headache",
    total_logs: 6,
    triggers: [
      { triggers: "stress", count: 4, avg_severity: 6.5, confidence: 0.86 },
      { triggers: "poor sleep", count: 3, avg_severity: 7.3, confidence: 0.81 },
      { triggers: "screen time", count: 2, avg_severity: 6.0, confidence: 0.54 },
      { triggers: "dehydration", count: 1, avg_severity: 8.0, confidence: 0.44 },
    ],
  },
  fatigue: {
    symptom: "fatigue",
    total_logs: 3,
    triggers: [
      { triggers: "poor sleep", count: 2, avg_severity: 6.5, confidence: 0.78 },
      { triggers: "stress", count: 2, avg_severity: 6.0, confidence: 0.76 },
      { triggers: "late workout", count: 1, avg_severity: 5.0, confidence: 0.4 },
    ],
  },
  nausea: {
    message: "Only one nausea entry exists in sample data, so confidence is illustrative.",
    triggers: [{ triggers: "spicy food", count: 1, avg_severity: 4.0, confidence: 0.36 }],
  },
};

export const mockDashboard: DashboardPayload = {
  metrics: {
    symptomLogs: 18,
    trackedSymptoms: 3,
    activeMedications: 3,
    averageSeverity: 6.2,
  },
  recentSymptoms: mockSymptoms.map((symptom) => ({
    id: symptom.id,
    timestamp: symptom.timestamp,
    symptom: symptom.symptom,
    severity: symptom.severity,
    durationHr: symptom.durationHr ?? symptom.duration_hr ?? null,
    triggers: symptom.triggers ?? [],
    relief: symptom.relief ?? [],
    notes: symptom.notes ?? null,
  })),
  medications: mockMedications.map((medication) => ({
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage ?? null,
    frequency: medication.frequency ?? null,
    startDate: medication.startDate ?? medication.start_date ?? null,
    notes: medication.notes ?? null,
  })),
  charts: {
    severityTrend: [
      { timestamp: "2026-03-22", severity: 7, symptom: "headache" },
      { timestamp: "2026-03-23", severity: 6, symptom: "headache" },
      { timestamp: "2026-03-24", severity: 8, symptom: "headache" },
      { timestamp: "2026-03-25", severity: 5, symptom: "fatigue" },
      { timestamp: "2026-03-26", severity: 4, symptom: "nausea" },
      { timestamp: "2026-03-27", severity: 6, symptom: "headache" },
      { timestamp: "2026-03-28", severity: 7, symptom: "fatigue" },
    ],
    dailyAverageSeverity: [
      { date: "2026-03-22", averageSeverity: 7.0 },
      { date: "2026-03-23", averageSeverity: 6.0 },
      { date: "2026-03-24", averageSeverity: 8.0 },
      { date: "2026-03-25", averageSeverity: 5.0 },
      { date: "2026-03-26", averageSeverity: 4.0 },
      { date: "2026-03-27", averageSeverity: 6.0 },
      { date: "2026-03-28", averageSeverity: 7.0 },
    ],
    symptomFrequency: [
      { symptom: "headache", count: 6, averageSeverity: 6.5 },
      { symptom: "fatigue", count: 3, averageSeverity: 6.0 },
      { symptom: "nausea", count: 1, averageSeverity: 4.0 },
    ],
    topTriggers: [
      { trigger: "stress", count: 4 },
      { trigger: "poor sleep", count: 3 },
      { trigger: "screen time", count: 2 },
      { trigger: "dehydration", count: 1 },
      { trigger: "spicy food", count: 1 },
    ],
  },
};
