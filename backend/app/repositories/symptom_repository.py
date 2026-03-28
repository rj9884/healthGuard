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
) -> SymptomLog:
    entry = SymptomLog(
        user_id=user_id,
        symptom=symptom.lower().strip(),
        severity=severity,
        duration_hr=duration_hr,
        triggers=triggers,
        relief=relief,
        notes=notes,
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
