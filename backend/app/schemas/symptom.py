from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class SymptomCreate(BaseModel):
    member_id: Optional[str] = None
    symptom: str
    severity: int = Field(ge=1, le=10)
    duration_hr: Optional[float] = None
    triggers: Optional[list[str]] = None
    relief: Optional[list[str]] = None
    notes: Optional[str] = None
    sleep_hours: Optional[float] = 7.0
    stress_level: Optional[int] = Field(default=5, ge=1, le=10)
    hydration_liters: Optional[float] = 2.0
    body_temperature_f: Optional[float] = 98.6
    heart_rate_bpm: Optional[int] = 72


class SymptomResponse(BaseModel):
    id: int
    user_id: str
    member_id: Optional[str] = None
    timestamp: datetime
    symptom: str
    severity: int
    duration_hr: Optional[float]
    triggers: Optional[list[str]]
    relief: Optional[list[str]]
    notes: Optional[str]
    sleep_hours: Optional[float] = None
    stress_level: Optional[int] = None
    hydration_liters: Optional[float] = None
    body_temperature_f: Optional[float] = None
    heart_rate_bpm: Optional[int] = None
    triage_level: Optional[str] = None
    predicted_disease_risk: Optional[str] = None
    shap_explanation_json: Optional[Any] = None
    is_anomaly: Optional[int] = 0
    anomaly_reason: Optional[str] = None

    class Config:
        from_attributes = True


class CareRecommendation(BaseModel):
    """Attached to a symptom log response: what to do next, sourced from the
    WHO Model List of Essential Medicines plus live drug-label enrichment."""
    disclaimer: str
    doctor_visit_recommended: bool
    urgency_message: str
    suggested_medications: list[dict]


class SymptomCreateResponse(SymptomResponse):
    care_recommendation: Optional[CareRecommendation] = None
    debug_metrics: Optional[dict] = None
