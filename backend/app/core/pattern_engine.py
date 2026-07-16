import pandas as pd
from sqlalchemy.orm import Session
from app.models.symptom import SymptomLog
from app.ml.anomaly_detector import detect_anomalies_and_correlations


def get_longitudinal_analysis(db: Session, user_id: str, member_id: str | None = None) -> dict:
    """
    Runs unsupervised Isolation Forest anomaly detection and Scipy statistical hypothesis testing
    across the user's entire longitudinal vitals and symptom history.
    """
    query = db.query(SymptomLog).filter(SymptomLog.user_id == user_id)
    if member_id:
        query = query.filter(SymptomLog.member_id == member_id)
    rows = query.order_by(SymptomLog.timestamp.asc()).all()
    ml_results = detect_anomalies_and_correlations(rows)
    
    # Calculate triage urgency distribution across user history
    triage_dist = {}
    for r in rows:
        t_level = getattr(r, "triage_level", "Self-Care") or "Self-Care"
        triage_dist[t_level] = triage_dist.get(t_level, 0) + 1
        
    ml_results["triage_distribution"] = triage_dist
    return ml_results


def analyze_patterns(db: Session, user_id: str, symptom: str, member_id: str | None = None) -> dict:
    """
    Load symptom history and compute statistical correlation matrix and trigger impact.
    """
    query = db.query(SymptomLog).filter(SymptomLog.user_id == user_id)
    if member_id:
        query = query.filter(SymptomLog.member_id == member_id)
    rows = query.all()

    if len(rows) < 3:
        return {
            "symptom": symptom,
            "total_logs": len(rows),
            "triggers": [],
            "message": "Log at least 3 health check-ins to enable ML longitudinal statistical pattern analysis."
        }

    # Run full ML anomaly and correlation engine on user history
    ml_insights = detect_anomalies_and_correlations(rows)
    
    # Filter specific symptom rows for backward compatibility with frontend lists
    symptom_rows = [r for r in rows if r.symptom == symptom]
    
    triggers_list = []
    if symptom_rows:
        df = pd.DataFrame([
            {"timestamp": r.timestamp, "severity": r.severity, "triggers": r.triggers or []}
            for r in symptom_rows
        ])
        trigger_df = df.explode("triggers").dropna(subset=["triggers"])
        if not trigger_df.empty:
            trigger_freq = trigger_df.groupby("triggers")["severity"].agg(count="count", avg_severity="mean").reset_index()
            trigger_freq["confidence"] = (trigger_freq["count"] / trigger_freq["count"].max() * 0.6 + trigger_freq["avg_severity"] / 10 * 0.4).round(2)
            triggers_list = trigger_freq.sort_values("confidence", ascending=False).head(5).to_dict(orient="records")

    return {
        "symptom": symptom,
        "total_logs": len(symptom_rows),
        "triggers": triggers_list,
        "ml_longitudinal_insights": ml_insights
    }


def get_symptom_summary(db: Session, user_id: str, member_id: str | None = None) -> list[dict]:
    """Get a summary of all symptoms and their counts for a user."""
    query = db.query(SymptomLog).filter(SymptomLog.user_id == user_id)
    if member_id:
        query = query.filter(SymptomLog.member_id == member_id)
    rows = query.all()
    if not rows:
        return []

    df = pd.DataFrame(
        [{"symptom": r.symptom, "severity": r.severity, "timestamp": r.timestamp}
         for r in rows]
    )

    summary = (
        df.groupby("symptom")
        .agg(count=("severity", "count"), avg_severity=("severity", "mean"))
        .reset_index()
        .sort_values("count", ascending=False)
    )
    summary["avg_severity"] = summary["avg_severity"].round(1)
    return summary.to_dict(orient="records")
