from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.models.database import get_db
from app.schemas.symptom import SymptomCreate, SymptomCreateResponse, SymptomResponse
from app.services.symptom_service import create_symptom_entry, get_recent_symptoms

router = APIRouter()


@router.post("", response_model=SymptomCreateResponse)
def create_symptom(
    payload: SymptomCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Logs a check-in, runs it through the ML triage pipeline, and returns a
    WHO-grounded care recommendation (self-care meds vs. see-a-doctor) alongside it."""
    return create_symptom_entry(db, user_id=user_id, payload=payload)


@router.get("", response_model=list[SymptomResponse])
def list_symptoms(
    limit: int = 50,
    member_id: str | None = None,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return get_recent_symptoms(db, user_id=user_id, member_id=member_id, limit=limit)
