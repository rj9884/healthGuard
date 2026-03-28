from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.models.database import get_db
from app.schemas.medication import MedicationCreate, MedicationResponse
from app.services.medication_service import (
    create_medication_entry,
    get_medication_list,
    remove_medication,
)

router = APIRouter()


@router.post("", response_model=MedicationResponse)
def create_medication(
    payload: MedicationCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return create_medication_entry(db, user_id=user_id, payload=payload)


@router.get("", response_model=list[MedicationResponse])
def list_medication_entries(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return get_medication_list(db, user_id=user_id)


@router.delete("/{med_id}", status_code=status.HTTP_200_OK)
def delete_medication_entry(med_id: int, db: Session = Depends(get_db)):
    deleted = remove_medication(db, med_id=med_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")
    return {"message": "Deleted successfully"}
