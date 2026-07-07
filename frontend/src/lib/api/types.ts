export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  age_range?: string | null;
  sex?: string | null;
  language?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

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
  // Biometrics & Vitals
  sleep_hours?: number;
  stress_level?: number;
  hydration_liters?: number;
  body_temperature_f?: number;
  heart_rate_bpm?: number;
  // ML Triage & Anomaly Results
  triage_level?: string | null;
  predicted_disease_risk?: string | null;
  shap_explanation_json?: {
    top_contributing_features?: Array<{
      feature: string;
      label: string;
      importance_score: number;
      value: number;
    }>;
    human_readable_summary?: string;
    model_type?: string;
  };
  is_anomaly?: number;
  anomaly_reason?: string | null;
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

export interface CorrelationItem {
  trigger: string;
  label: string;
  correlation_r: number;
  p_value: number;
  is_significant: boolean;
  mutual_info: number;
  impact: string;
}

export interface LongitudinalAnalysis {
  total_logs_analyzed: number;
  recent_anomaly_detected: boolean;
  anomaly_alert_message?: string | null;
  correlation_matrix: CorrelationItem[];
  triage_distribution?: Record<string, number>;
  statistical_engine?: string;
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
  recentSymptoms: SymptomEntry[];
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
