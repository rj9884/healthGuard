from sqlalchemy.orm import Session

from app.repositories.medication_repository import (
    create_medication,
    delete_medication,
    get_medication,
    list_medications,
)
from app.repositories.family_member_repository import get_family_member
from app.schemas.medication import MedicationCreate
from app.services.medication_suggestion_service import get_care_recommendation


def create_medication_entry(db: Session, *, user_id: str, payload: MedicationCreate):
    return create_medication(
        db,
        user_id=user_id,
        member_id=payload.member_id,
        name=payload.name.strip(),
        dosage=payload.dosage,
        frequency=payload.frequency,
        start_date=payload.start_date,
        notes=payload.notes,
        source=payload.source or "manual",
    )


def get_medication_list(db: Session, *, user_id: str, member_id: str | None = None):
    return list_medications(db, user_id=user_id, member_id=member_id)


def remove_medication(db: Session, *, med_id: int) -> bool:
    medication = get_medication(db, med_id=med_id)
    if medication is None:
        return False
    delete_medication(db, medication)
    return True


def get_suggestions(db: Session, *, disease_category: str, triage_level: str, severity: int | None, member_id: str | None):
    member = get_family_member(db, member_id=member_id) if member_id else None
    return get_care_recommendation(
        disease_category=disease_category,
        triage_level=triage_level,
        severity=severity,
        member_name=member.name if member else None,
        age_range=member.age_range if member else None,
    )
