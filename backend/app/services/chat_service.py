from sqlalchemy.orm import Session

from app.core.ai_client import chat_with_health_ai
from app.models.symptom import SymptomLog


def build_health_reply(db: Session, *, user_id: str, message: str, history: list[dict] | None):
    recent = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id)
        .order_by(SymptomLog.timestamp.desc())
        .limit(10)
        .all()
    )

    recent_symptoms = [
        {
            "symptom": log.symptom,
            "severity": log.severity,
            "triggers": log.triggers,
            "timestamp": str(log.timestamp),
        }
        for log in recent
    ]

    return chat_with_health_ai(
        message,
        history or [],
        {"recent_symptoms": recent_symptoms},
    )
