from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.medication import Medication
from app.models.symptom import SymptomLog


DEMO_USER_ID = "default_user"


def seed_demo_data(db: Session, reset: bool = False) -> dict:
    existing_symptoms = (
        db.query(SymptomLog).filter(SymptomLog.user_id == DEMO_USER_ID).count()
    )
    existing_meds = (
        db.query(Medication).filter(Medication.user_id == DEMO_USER_ID).count()
    )

    if existing_symptoms or existing_meds:
        if not reset:
            return {
                "seeded": False,
                "message": "Existing data found. Use reset to replace it with demo data.",
                "symptom_count": existing_symptoms,
                "medication_count": existing_meds,
            }

        db.query(SymptomLog).filter(SymptomLog.user_id == DEMO_USER_ID).delete()
        db.query(Medication).filter(Medication.user_id == DEMO_USER_ID).delete()
        db.commit()

    now = datetime.now(timezone.utc)
    symptom_rows = [
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=14, hours=2),
            symptom="headache",
            severity=7,
            duration_hr=3.0,
            triggers=["poor sleep", "stress"],
            relief=["water", "rest"],
            notes="Started mid-morning after a short night of sleep.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=12, hours=5),
            symptom="headache",
            severity=6,
            duration_hr=2.0,
            triggers=["stress", "screen time"],
            relief=["walk", "ibuprofen"],
            notes="Work-heavy day with long screen exposure.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=10, hours=1),
            symptom="headache",
            severity=8,
            duration_hr=4.0,
            triggers=["poor sleep", "dehydration"],
            relief=["dark room", "water"],
            notes="More intense than usual and improved after hydration.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=8, hours=4),
            symptom="headache",
            severity=5,
            duration_hr=1.5,
            triggers=["stress", "skipped meal"],
            relief=["snack", "rest"],
            notes="Came on before lunch after skipping breakfast.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=6, hours=3),
            symptom="headache",
            severity=7,
            duration_hr=2.5,
            triggers=["poor sleep", "stress"],
            relief=["water", "rest"],
            notes="Similar pattern to earlier episodes this week.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=5, hours=2),
            symptom="fatigue",
            severity=6,
            duration_hr=6.0,
            triggers=["poor sleep"],
            relief=["nap", "coffee"],
            notes="Energy stayed low most of the afternoon.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=4, hours=6),
            symptom="fatigue",
            severity=5,
            duration_hr=4.0,
            triggers=["stress", "late workout"],
            relief=["rest"],
            notes="Felt drained after a busy day and late exercise.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=3, hours=1),
            symptom="nausea",
            severity=4,
            duration_hr=1.0,
            triggers=["spicy food"],
            relief=["tea", "rest"],
            notes="Mild nausea after dinner, settled quickly.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(days=2, hours=2),
            symptom="headache",
            severity=6,
            duration_hr=2.0,
            triggers=["screen time", "stress"],
            relief=["walk", "water"],
            notes="Improved after stepping away from work.",
        ),
        SymptomLog(
            user_id=DEMO_USER_ID,
            timestamp=now - timedelta(hours=8),
            symptom="fatigue",
            severity=7,
            duration_hr=5.0,
            triggers=["poor sleep", "stress"],
            relief=["rest", "hydration"],
            notes="Low energy continued into the evening.",
        ),
    ]

    medication_rows = [
        Medication(
            user_id=DEMO_USER_ID,
            name="Ibuprofen",
            dosage="200 mg",
            frequency="As needed",
            start_date=date.today() - timedelta(days=30),
            notes="Used occasionally for headache relief.",
        ),
        Medication(
            user_id=DEMO_USER_ID,
            name="Aspirin",
            dosage="81 mg",
            frequency="Once daily",
            start_date=date.today() - timedelta(days=90),
            notes="Included to demonstrate interaction warnings.",
        ),
        Medication(
            user_id=DEMO_USER_ID,
            name="Vitamin D",
            dosage="1000 IU",
            frequency="Once daily",
            start_date=date.today() - timedelta(days=60),
            notes="Routine supplement.",
        ),
    ]

    db.add_all(symptom_rows + medication_rows)
    db.commit()

    return {
        "seeded": True,
        "message": "Demo data loaded successfully.",
        "symptom_count": len(symptom_rows),
        "medication_count": len(medication_rows),
    }
