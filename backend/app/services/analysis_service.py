from sqlalchemy.orm import Session

from app.core.demo_data import seed_demo_data
from app.core.pattern_engine import analyze_patterns, get_symptom_summary
from app.core.report_generator import generate_health_report


def get_summary(db: Session, *, user_id: str) -> list[dict]:
    return get_symptom_summary(db, user_id)


def get_patterns(db: Session, *, user_id: str, symptom: str) -> dict:
    return analyze_patterns(db, user_id, symptom.lower().strip())


def build_report(db: Session, *, user_id: str) -> bytes:
    return generate_health_report(db, user_id)


def load_demo_data(db: Session, *, reset: bool = False) -> dict:
    return seed_demo_data(db, reset=reset)
