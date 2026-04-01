import type {
  AnalysisSummaryItem,
  DashboardPayload,
  MedicationEntry,
  PatternResponse,
  SymptomEntry,
} from "@/lib/api/types";
import {
  addMockMedication,
  addMockSymptom,
  getMockChatReply,
  getMockDashboard,
  getMockImageResult,
  getMockMedications,
  getMockPatterns,
  getMockSummary,
  getMockSymptoms,
  removeMockMedication,
} from "@/lib/api/mock-store";
import { deleteJson, fetchJson, postFormData, postJson, USE_MOCK_DATA } from "@/lib/api/client";

export function getDashboard() {
  return fetchJson<DashboardPayload>("/dashboard", getMockDashboard());
}

export function getSymptoms() {
  return fetchJson<SymptomEntry[]>("/symptoms?limit=12", getMockSymptoms());
}

export function createSymptom(payload: {
  symptom: string;
  severity: number;
  duration_hr?: number | null;
  triggers?: string[];
  relief?: string[];
  notes?: string | null;
}) {
  if (USE_MOCK_DATA) {
    return Promise.resolve(
      addMockSymptom({
        symptom: payload.symptom,
        severity: payload.severity,
        duration_hr: payload.duration_hr ?? null,
        triggers: payload.triggers ?? [],
        relief: payload.relief ?? [],
        notes: payload.notes ?? null,
      }),
    );
  }
  return postJson<SymptomEntry, typeof payload>("/symptoms", payload);
}

export function getMedications() {
  return fetchJson<MedicationEntry[]>("/medications", getMockMedications());
}

export function createMedication(payload: {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  notes?: string | null;
}) {
  if (USE_MOCK_DATA) {
    return Promise.resolve(
      addMockMedication({
        name: payload.name,
        dosage: payload.dosage ?? null,
        frequency: payload.frequency ?? null,
        start_date: payload.start_date ?? null,
        notes: payload.notes ?? null,
      }),
    );
  }
  return postJson<MedicationEntry, typeof payload>("/medications", payload);
}

export function removeMedication(id: number) {
  if (USE_MOCK_DATA) {
    removeMockMedication(id);
    return Promise.resolve();
  }
  return deleteJson(`/medications/${id}`);
}

export function getAnalysisSummary() {
  return fetchJson<AnalysisSummaryItem[]>("/analysis/summary", getMockSummary());
}

export function getPatterns(symptom: string) {
  return fetchJson<PatternResponse>(
    `/analysis/patterns/${encodeURIComponent(symptom)}`,
    getMockPatterns(symptom),
  );
}

export function getReport() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  return `${baseUrl}/analysis/report`;
}

export function seedDemoData() {
  if (USE_MOCK_DATA) {
    return Promise.resolve({ message: "Mock mode is already enabled." });
  }
  return postJson<{ message: string }, Record<string, never>>("/analysis/demo-data", {});
}

export async function classifyImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  if (USE_MOCK_DATA) {
    try {
      return await postFormData<{
        observations: Array<{ label: string; score: number }>;
        recommendation: string;
      }>("/image/classify", formData);
    } catch {
      return getMockImageResult();
    }
  }

  return postFormData<{
    observations: Array<{ label: string; score: number }>;
    recommendation: string;
  }>("/image/classify", formData);
}

export async function askHealthAi(payload: { message: string; history?: Array<{ role: string; content: string }> }) {
  if (USE_MOCK_DATA) {
    try {
      return await postJson<{ reply: string }, typeof payload>("/chat", payload);
    } catch {
      return Promise.resolve(getMockChatReply(payload.message));
    }
  }

  return postJson<{ reply: string }, typeof payload>("/chat", payload);
}
