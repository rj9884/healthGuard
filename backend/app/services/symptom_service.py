from sqlalchemy.orm import Session

from app.repositories.symptom_repository import create_symptom, list_recent_symptoms
from app.schemas.symptom import SymptomCreate


def create_symptom_entry(db: Session, *, user_id: str, payload: SymptomCreate):
    return create_symptom(
        db,
        user_id=user_id,
        symptom=payload.symptom,
        severity=payload.severity,
        duration_hr=payload.duration_hr,
        triggers=payload.triggers,
        relief=payload.relief,
        notes=payload.notes,
    )


def get_recent_symptoms(db: Session, *, user_id: str, limit: int = 50):
    return list_recent_symptoms(db, user_id=user_id, limit=limit)
