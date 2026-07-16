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

export interface FamilyMember {
  id: string;
  account_id: string;
  name: string;
  relation: string;         // self | spouse | child | parent | sibling | other
  age_range: string;        // pediatric | adult | senior
  sex?: string | null;
  date_of_birth?: string | null;
  avatar_color: string;
  notes?: string | null;
  created_at: string;
}

export interface SuggestedMedication {
  generic_name: string;
  category: string;
  otc: boolean;
  typical_adult_dose: string;
  caution?: string;
  live_label_data?: {
    purpose?: string | null;
    dosage_and_administration?: string | null;
    warnings?: string | null;
    brand_names?: string[];
  } | null;
}

export interface CareRecommendation {
  disclaimer: string;
  doctor_visit_recommended: boolean;
  urgency_message: string;
  self_care_notes?: string;
  suggested_medications: SuggestedMedication[];
}

export interface SymptomEntry {
  id: number;
  user_id?: string;
  member_id?: string | null;
  timestamp: string | null;
  symptom: string;
  severity: number;
  duration_hr?: number | null;
  durationHr?: number | null;
  triggers?: string[];
  relief?: string[];
  notes?: string | null;
  sleep_hours?: number;
  stress_level?: number;
  hydration_liters?: number;
  body_temperature_f?: number;
  heart_rate_bpm?: number;
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
  care_recommendation?: CareRecommendation | null;
}

export interface MedicationEntry {
  id: number;
  user_id?: string;
  member_id?: string | null;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  start_date?: string | null;
  startDate?: string | null;
  notes?: string | null;
  source?: string;
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

export const AVATAR_COLORS: Record<string, string> = {
  teal:   "#0d9488",
  blue:   "#2563eb",
  violet: "#7c3aed",
  rose:   "#e11d48",
  amber:  "#d97706",
  green:  "#16a34a",
  slate:  "#475569",
};

export const RELATION_LABELS: Record<string, string> = {
  self:    "Self",
  spouse:  "Spouse / Partner",
  child:   "Child",
  parent:  "Parent",
  sibling: "Sibling",
  other:   "Other",
};
