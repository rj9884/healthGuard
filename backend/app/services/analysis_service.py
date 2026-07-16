from sqlalchemy.orm import Session

from app.core.pattern_engine import analyze_patterns, get_symptom_summary
from app.core.report_generator import generate_health_report


def get_summary(db: Session, *, user_id: str, member_id: str | None = None) -> list[dict]:
    return get_symptom_summary(db, user_id, member_id=member_id)


def get_patterns(db: Session, *, user_id: str, symptom: str, member_id: str | None = None) -> dict:
    return analyze_patterns(db, user_id, symptom.lower().strip(), member_id=member_id)


def build_report(db: Session, *, user_id: str) -> bytes:
    return generate_health_report(db, user_id)
