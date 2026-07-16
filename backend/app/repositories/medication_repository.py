from sqlalchemy.orm import Session

from app.models.medication import Medication


def create_medication(
    db: Session,
    *,
    user_id: str,
    member_id: str | None = None,
    name: str,
    dosage: str | None,
    frequency: str | None,
    start_date,
    notes: str | None,
    source: str = "manual",
) -> Medication:
    medication = Medication(
        user_id=user_id,
        member_id=member_id,
        name=name,
        dosage=dosage,
        frequency=frequency,
        start_date=start_date,
        notes=notes,
        source=source,
    )
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication


def list_medications(db: Session, *, user_id: str, member_id: str | None = None) -> list[Medication]:
    query = db.query(Medication).filter(Medication.user_id == user_id)
    if member_id:
        query = query.filter(Medication.member_id == member_id)
    return query.all()


def get_medication(db: Session, *, med_id: int) -> Medication | None:
    return db.query(Medication).filter(Medication.id == med_id).first()


def delete_medication(db: Session, medication: Medication) -> None:
    db.delete(medication)
    db.commit()
