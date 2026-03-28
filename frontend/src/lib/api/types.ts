export interface SymptomEntry {
  id: number;
  user_id?: string;
  timestamp: string | null;
  symptom: string;
  severity: number;
  duration_hr?: number | null;
  durationHr?: number | null;
  triggers?: string[];
  relief?: string[];
  notes?: string | null;
}

export interface MedicationEntry {
  id: number;
  user_id?: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  startDate?: string | null;
  notes?: string | null;
}

export interface AnalysisSummaryItem {
  symptom: string;
  count: number;
  avg_severity: number;
}

export interface PatternTrigger {
  triggers: string;
  count: number;
  avg_severity: number;
  confidence: number;
}

export interface PatternResponse {
  symptom?: string;
  total_logs?: number;
  triggers?: PatternTrigger[];
  message?: string;
}

export interface DashboardMetricSet {
  symptomLogs: number;
  trackedSymptoms: number;
  activeMedications: number;
  averageSeverity: number;
}

export interface DashboardCharts {
  severityTrend: Array<{ timestamp: string; severity: number; symptom: string }>;
  dailyAverageSeverity: Array<{ date: string; averageSeverity: number }>;
  symptomFrequency: Array<{ symptom: string; count: number; averageSeverity: number }>;
  topTriggers: Array<{ trigger: string; count: number }>;
}

export interface DashboardPayload {
  metrics: DashboardMetricSet;
  recentSymptoms: Array<{
    id: number;
    timestamp: string | null;
    symptom: string;
    severity: number;
    durationHr: number | null;
    triggers: string[];
    relief: string[];
    notes: string | null;
  }>;
  medications: Array<{
    id: number;
    name: string;
    dosage: string | null;
    frequency: string | null;
    startDate: string | null;
    notes: string | null;
  }>;
  charts: DashboardCharts;
}
