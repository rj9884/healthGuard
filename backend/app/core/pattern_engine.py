import pandas as pd
from sqlalchemy.orm import Session
from app.models.symptom import SymptomLog


def analyze_patterns(db: Session, user_id: str, symptom: str) -> dict:
    """
    Load symptom history and compute trigger confidence scores.
    Confidence = weighted combination of trigger frequency and associated severity.
    """
    rows = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id, SymptomLog.symptom == symptom)
        .all()
    )

    if len(rows) < 5:
        return {"message": "Log at least 5 entries to enable pattern analysis."}

    df = pd.DataFrame(
        [
            {
                "timestamp": r.timestamp,
                "severity": r.severity,
                "triggers": r.triggers or [],
            }
            for r in rows
        ]
    )

    # Explode the triggers list column into individual rows
    trigger_df = df.explode("triggers").dropna(subset=["triggers"])

    if trigger_df.empty:
        return {
            "symptom": symptom,
            "total_logs": len(rows),
            "triggers": [],
            "message": "No triggers logged yet. Add triggers when logging symptoms.",
        }

    trigger_freq = (
        trigger_df.groupby("triggers")["severity"]
        .agg(count="count", avg_severity="mean")
        .reset_index()
    )

    # Confidence = 60% frequency weight + 40% severity weight
    trigger_freq["confidence"] = (
        trigger_freq["count"] / trigger_freq["count"].max() * 0.6
        + trigger_freq["avg_severity"] / 10 * 0.4
    ).round(2)

    top_triggers = trigger_freq.sort_values("confidence", ascending=False).head(5)

    return {
        "symptom": symptom,
        "total_logs": len(rows),
        "triggers": top_triggers.to_dict(orient="records"),
    }


def get_symptom_summary(db: Session, user_id: str) -> list[dict]:
    """Get a summary of all symptoms and their counts for a user."""
    rows = db.query(SymptomLog).filter(SymptomLog.user_id == user_id).all()
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
