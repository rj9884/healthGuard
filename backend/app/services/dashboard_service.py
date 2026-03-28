from collections import Counter, defaultdict

from sqlalchemy.orm import Session

from app.repositories.medication_repository import list_medications
from app.repositories.symptom_repository import list_recent_symptoms
from app.services.analysis_service import get_summary


def build_dashboard_payload(db: Session, *, user_id: str) -> dict:
    symptoms = list_recent_symptoms(db, user_id=user_id, limit=30)
    medications = list_medications(db, user_id=user_id)
    summary = get_summary(db, user_id=user_id)

    trigger_counter: Counter[str] = Counter()
    severity_trend = []
    symptom_frequency = []
    grouped_daily_severity: dict[str, list[int]] = defaultdict(list)

    for entry in reversed(symptoms):
        ts = entry.timestamp.isoformat() if entry.timestamp else None
        severity_trend.append(
            {
                "timestamp": ts,
                "severity": entry.severity,
                "symptom": entry.symptom,
            }
        )
        if entry.timestamp:
            grouped_daily_severity[entry.timestamp.date().isoformat()].append(entry.severity)
        for trigger in entry.triggers or []:
            trigger_counter[trigger] += 1

    for item in summary:
        symptom_frequency.append(
            {
                "symptom": item["symptom"],
                "count": item["count"],
                "averageSeverity": item["avg_severity"],
            }
        )

    daily_average_severity = [
        {
            "date": day,
            "averageSeverity": round(sum(values) / len(values), 1),
        }
        for day, values in sorted(grouped_daily_severity.items())
    ]

    return {
        "metrics": {
            "symptomLogs": len(symptoms),
            "trackedSymptoms": len(summary),
            "activeMedications": len(medications),
            "averageSeverity": (
                round(sum(item["avg_severity"] for item in summary) / len(summary), 1)
                if summary
                else 0
            ),
        },
        "recentSymptoms": [
            {
                "id": entry.id,
                "timestamp": entry.timestamp.isoformat() if entry.timestamp else None,
                "symptom": entry.symptom,
                "severity": entry.severity,
                "durationHr": entry.duration_hr,
                "triggers": entry.triggers or [],
                "relief": entry.relief or [],
                "notes": entry.notes,
            }
            for entry in symptoms[:6]
        ],
        "medications": [
            {
                "id": medication.id,
                "name": medication.name,
                "dosage": medication.dosage,
                "frequency": medication.frequency,
                "startDate": str(medication.start_date) if medication.start_date else None,
                "notes": medication.notes,
            }
            for medication in medications
        ],
        "charts": {
            "severityTrend": severity_trend,
            "dailyAverageSeverity": daily_average_severity,
            "symptomFrequency": symptom_frequency,
            "topTriggers": [
                {"trigger": trigger, "count": count}
                for trigger, count in trigger_counter.most_common(6)
            ],
        },
    }
