from sqlalchemy.orm import Session

from app.models.medication import Medication


def create_medication(
    db: Session,
    *,
    user_id: str,
    name: str,
    dosage: str | None,
    frequency: str | None,
    start_date,
    notes: str | None,
) -> Medication:
    medication = Medication(
        user_id=user_id,
        name=name,
        dosage=dosage,
        frequency=frequency,
        start_date=start_date,
        notes=notes,
    )
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication


def list_medications(db: Session, *, user_id: str) -> list[Medication]:
    return db.query(Medication).filter(Medication.user_id == user_id).all()


def get_medication(db: Session, *, med_id: int) -> Medication | None:
    return db.query(Medication).filter(Medication.id == med_id).first()


def delete_medication(db: Session, medication: Medication) -> None:
    db.delete(medication)
    db.commit()
