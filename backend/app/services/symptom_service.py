from sqlalchemy.orm import Session
from app.repositories.symptom_repository import create_symptom, list_recent_symptoms, list_all_symptoms
from app.schemas.symptom import SymptomCreate
from app.ml.triage_model import triage_classifier
from app.ml.anomaly_detector import detect_anomalies_and_correlations


def create_symptom_entry(db: Session, *, user_id: str, payload: SymptomCreate):
    # Prepare dictionaries for ML inference
    symptoms_dict = {
        payload.symptom.lower().strip(): 1,
        "severity": payload.severity,
        "duration_hr": payload.duration_hr or 2.0
    }
    if payload.triggers:
        for trig in payload.triggers:
            symptoms_dict[trig.lower().strip()] = 1

    vitals_dict = {
        "sleep_hours": payload.sleep_hours or 7.0,
        "stress_level": payload.stress_level or 5,
        "hydration_liters": payload.hydration_liters or 2.0,
        "body_temperature_f": payload.body_temperature_f or 98.6,
        "heart_rate_bpm": payload.heart_rate_bpm or 72,
        "severity": payload.severity,
        "duration_hr": payload.duration_hr or 2.0
    }

    # 1. Run LightGBM Triage Classifier & SHAP Explainer
    ml_triage_result = triage_classifier.predict(symptoms_dict, vitals_dict)

    # 2. Fetch past logs for Anomaly Detection
    past_logs = list_all_symptoms(db, user_id=user_id)
    
    # Create a temporary mock object representing this new log for anomaly scoring
    class MockLog:
        id = -100
        timestamp = None
        symptom = payload.symptom
        severity = payload.severity
        duration_hr = payload.duration_hr or 2.0
        sleep_hours = payload.sleep_hours or 7.0
        stress_level = payload.stress_level or 5
        hydration_liters = payload.hydration_liters or 2.0
        body_temperature_f = payload.body_temperature_f or 98.6
        heart_rate_bpm = payload.heart_rate_bpm or 72

    mock_new_log = MockLog()
    anomaly_result = detect_anomalies_and_correlations(past_logs + [mock_new_log], recent_log=mock_new_log)

    is_anom = 1 if anomaly_result.get("recent_anomaly_detected") else 0
    anom_reason = anomaly_result.get("anomaly_alert_message")

    return create_symptom(
        db,
        user_id=user_id,
        symptom=payload.symptom,
        severity=payload.severity,
        duration_hr=payload.duration_hr,
        triggers=payload.triggers,
        relief=payload.relief,
        notes=payload.notes,
        sleep_hours=payload.sleep_hours or 7.0,
        stress_level=payload.stress_level or 5,
        hydration_liters=payload.hydration_liters or 2.0,
        body_temperature_f=payload.body_temperature_f or 98.6,
        heart_rate_bpm=payload.heart_rate_bpm or 72,
        triage_level=ml_triage_result.get("triage_level"),
        predicted_disease_risk=ml_triage_result.get("predicted_disease_category"),
        shap_explanation_json=ml_triage_result.get("shap_explanation"),
        is_anomaly=is_anom,
        anomaly_reason=anom_reason,
    )


def get_recent_symptoms(db: Session, *, user_id: str, limit: int = 50):
    return list_recent_symptoms(db, user_id=user_id, limit=limit)
