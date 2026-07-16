import time
from sqlalchemy.orm import Session
from app.repositories.symptom_repository import create_symptom, list_recent_symptoms, list_all_symptoms
from app.repositories.family_member_repository import get_family_member
from app.schemas.symptom import SymptomCreate
from app.ml.triage_model import triage_classifier
from app.ml.anomaly_detector import detect_anomalies_and_correlations
from app.services.medication_suggestion_service import get_care_recommendation
from app.core.openfda_client import request_metrics, record_metric


def create_symptom_entry(db: Session, *, user_id: str, payload: SymptomCreate):
    # Initialize request metrics dict in contextvar
    metrics = {
        "ml_inference_ms": 0.0,
        "db_reads_ms": 0.0,
        "anomaly_detection_ms": 0.0,
        "db_writes_ms": 0.0,
        "openfda_total_ms": 0.0,
        "openfda_network_ms": 0.0,
        "openfda_cache_hits": 0,
        "openfda_cache_misses": 0
    }
    request_metrics.set(metrics)

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
    t0 = time.perf_counter()
    ml_triage_result = triage_classifier.predict(symptoms_dict, vitals_dict)
    record_metric("ml_inference_ms", (time.perf_counter() - t0) * 1000)

    # 2. Fetch past logs for Anomaly Detection (scoped to this family member if provided)
    t0 = time.perf_counter()
    past_logs = list_all_symptoms(db, user_id=user_id, member_id=payload.member_id)
    db_reads_time = (time.perf_counter() - t0) * 1000
    
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
    
    t0 = time.perf_counter()
    anomaly_result = detect_anomalies_and_correlations(past_logs + [mock_new_log], recent_log=mock_new_log)
    record_metric("anomaly_detection_ms", (time.perf_counter() - t0) * 1000)

    is_anom = 1 if anomaly_result.get("recent_anomaly_detected") else 0
    anom_reason = anomaly_result.get("anomaly_alert_message")

    t0 = time.perf_counter()
    saved_entry = create_symptom(
        db,
        user_id=user_id,
        member_id=payload.member_id,
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
    record_metric("db_writes_ms", (time.perf_counter() - t0) * 1000)

    # 3. Turn the ML prediction into a WHO-grounded care recommendation for this member
    t0 = time.perf_counter()
    member = get_family_member(db, member_id=payload.member_id) if payload.member_id else None
    db_reads_time += (time.perf_counter() - t0) * 1000
    record_metric("db_reads_ms", db_reads_time)
    
    t0 = time.perf_counter()
    care_recommendation = get_care_recommendation(
        disease_category=ml_triage_result.get("predicted_disease_category"),
        triage_level=ml_triage_result.get("triage_level"),
        severity=payload.severity,
        member_name=member.name if member else None,
        age_range=member.age_range if member else None,
    )
    record_metric("openfda_total_ms", (time.perf_counter() - t0) * 1000)

    # Attach as a plain attribute so the API layer can surface it without
    # changing the stored ORM row.
    saved_entry.care_recommendation = care_recommendation
    saved_entry.debug_metrics = request_metrics.get()
    return saved_entry


def get_recent_symptoms(db: Session, *, user_id: str, member_id: str | None = None, limit: int = 50):
    return list_recent_symptoms(db, user_id=user_id, member_id=member_id, limit=limit)
