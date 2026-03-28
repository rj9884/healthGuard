from sqlalchemy.orm import Session

from app.repositories.medication_repository import (
    create_medication,
    delete_medication,
    get_medication,
    list_medications,
)
from app.schemas.medication import MedicationCreate


def create_medication_entry(db: Session, *, user_id: str, payload: MedicationCreate):
    return create_medication(
        db,
        user_id=user_id,
        name=payload.name.strip(),
        dosage=payload.dosage,
        frequency=payload.frequency,
        start_date=payload.start_date,
        notes=payload.notes,
    )


def get_medication_list(db: Session, *, user_id: str):
    return list_medications(db, user_id=user_id)


def remove_medication(db: Session, *, med_id: int) -> bool:
    medication = get_medication(db, med_id=med_id)
    if medication is None:
        return False
    delete_medication(db, medication)
    return True
