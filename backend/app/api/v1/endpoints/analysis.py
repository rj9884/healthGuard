from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.models.database import get_db
from app.services.analysis_service import build_report, get_patterns, get_summary, load_demo_data
from app.core.pattern_engine import get_longitudinal_analysis

router = APIRouter()


@router.get("/summary")
def summary(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return get_summary(db, user_id=user_id)


@router.get("/longitudinal")
def longitudinal(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return get_longitudinal_analysis(db, user_id=user_id)


@router.get("/patterns/{symptom}")
def patterns(
    symptom: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return get_patterns(db, user_id=user_id, symptom=symptom)


@router.get("/report")
def report(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    pdf_bytes = build_report(db, user_id=user_id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=health_report.pdf"},
    )


@router.post("/demo-data")
def demo_data(reset: bool = False, db: Session = Depends(get_db)):
    return load_demo_data(db, reset=reset)
