from sqlalchemy.orm import Session

from app.models.symptom import SymptomLog


def create_symptom(
    db: Session,
    *,
    user_id: str,
    symptom: str,
    severity: int,
    duration_hr: float | None,
    triggers: list[str] | None,
    relief: list[str] | None,
    notes: str | None,
    sleep_hours: float | None = 7.0,
    stress_level: int | None = 5,
    hydration_liters: float | None = 2.0,
    body_temperature_f: float | None = 98.6,
    heart_rate_bpm: int | None = 72,
    triage_level: str | None = None,
    predicted_disease_risk: str | None = None,
    shap_explanation_json: dict | list | None = None,
    is_anomaly: int | None = 0,
    anomaly_reason: str | None = None,
) -> SymptomLog:
    entry = SymptomLog(
        user_id=user_id,
        symptom=symptom.lower().strip(),
        severity=severity,
        duration_hr=duration_hr,
        triggers=triggers,
        relief=relief,
        notes=notes,
        sleep_hours=sleep_hours,
        stress_level=stress_level,
        hydration_liters=hydration_liters,
        body_temperature_f=body_temperature_f,
        heart_rate_bpm=heart_rate_bpm,
        triage_level=triage_level,
        predicted_disease_risk=predicted_disease_risk,
        shap_explanation_json=shap_explanation_json,
        is_anomaly=is_anomaly,
        anomaly_reason=anomaly_reason,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def list_recent_symptoms(db: Session, *, user_id: str, limit: int = 50) -> list[SymptomLog]:
    return (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id)
        .order_by(SymptomLog.timestamp.desc())
        .limit(limit)
        .all()
    )


def list_all_symptoms(db: Session, *, user_id: str) -> list[SymptomLog]:
    return (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id)
        .order_by(SymptomLog.timestamp.desc())
        .all()
    )
