import type {
  AnalysisSummaryItem,
  DashboardPayload,
  MedicationEntry,
  PatternResponse,
  SymptomEntry,
} from "@/lib/api/types";
import {
  mockDashboard,
  mockMedications,
  mockPatterns,
  mockSummary,
  mockSymptoms,
} from "@/lib/api/mock-data";
import { deleteJson, fetchJson, postFormData, postJson } from "@/lib/api/client";

export function getDashboard() {
  return fetchJson<DashboardPayload>("/dashboard", mockDashboard);
}

export function getSymptoms() {
  return fetchJson<SymptomEntry[]>("/symptoms?limit=12", mockSymptoms);
}

export function createSymptom(payload: {
  symptom: string;
  severity: number;
  duration_hr?: number | null;
  triggers?: string[];
  relief?: string[];
  notes?: string | null;
}) {
  return postJson<SymptomEntry, typeof payload>("/symptoms", payload);
}

export function getMedications() {
  return fetchJson<MedicationEntry[]>("/medications", mockMedications);
}

export function createMedication(payload: {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  notes?: string | null;
}) {
  return postJson<MedicationEntry, typeof payload>("/medications", payload);
}

export function removeMedication(id: number) {
  return deleteJson(`/medications/${id}`);
}

export function getAnalysisSummary() {
  return fetchJson<AnalysisSummaryItem[]>("/analysis/summary", mockSummary);
}

export function getPatterns(symptom: string) {
  return fetchJson<PatternResponse>(
    `/analysis/patterns/${encodeURIComponent(symptom)}`,
    mockPatterns[symptom] ?? mockPatterns.headache,
  );
}

export function getReport() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  return `${baseUrl}/analysis/report`;
}

export function seedDemoData() {
  return postJson<{ message: string }, Record<string, never>>("/analysis/demo-data", {});
}

export function classifyImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return postFormData<{
    observations: Array<{ label: string; score: number }>;
    recommendation: string;
  }>("/image/classify", formData);
}

export function askHealthAi(payload: { message: string; history?: Array<{ role: string; content: string }> }) {
  return postJson<{ reply: string }, typeof payload>("/chat", payload);
}
