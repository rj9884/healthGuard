from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from datetime import datetime, timezone
from app.models.database import Base


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), default="default_user")
    member_id = Column(String, ForeignKey("family_members.id"), nullable=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    symptom = Column(String, nullable=False)
    severity = Column(Integer)              # 1–10
    duration_hr = Column(Float)
    triggers = Column(JSON)                 # ["dairy", "stress"]
    relief = Column(JSON)                   # ["rest", "water"]
    notes = Column(String)

    # Vitals & Biometrics for Longitudinal ML Pattern Analysis
    sleep_hours = Column(Float, default=7.0)
    stress_level = Column(Integer, default=5)          # 1–10
    hydration_liters = Column(Float, default=2.0)
    body_temperature_f = Column(Float, default=98.6)
    heart_rate_bpm = Column(Integer, default=72)

    # Stored ML Inference Results (Abstracted for Real Users)
    triage_level = Column(String, nullable=True)       # e.g., "Self-Care", "Routine Checkup", "Urgent Doctor", "Emergency"
    predicted_disease_risk = Column(String, nullable=True)  # top predicted disease category
    shap_explanation_json = Column(JSON, nullable=True)     # SHAP feature contributions
    is_anomaly = Column(Integer, default=0)            # 1 if flagged by Isolation Forest
    anomaly_reason = Column(String, nullable=True)     # Root cause explanation
