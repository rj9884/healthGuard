from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.models.database import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import build_dashboard_payload

router = APIRouter()


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return build_dashboard_payload(db, user_id=user_id)
