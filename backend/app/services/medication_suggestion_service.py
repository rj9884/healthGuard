"""
Turns an ML triage/disease prediction into an actionable, WHO-grounded
recommendation: what a family member could reasonably self-manage with,
and whether the household should stop self-managing and see a doctor.

Two layers, deliberately kept separate:
  1. WHO_GUIDELINES (backend/data/who_medication_guidelines.json) — static,
     curated from the WHO Model List of Essential Medicines. This alone
     decides *what* is suggested and *whether* a doctor visit is advised.
  2. openFDA enrichment (app.core.openfda_client) — optional, live, only
     adds real label context (dosage wording / warnings) to what layer 1
     already chose. If it fails or is slow, layer 1's answer still stands.
"""
import json
import os

from app.core.openfda_client import fetch_label_enrichment

GUIDELINES_PATH = os.path.join(os.path.dirname(__file__), "../../data/who_medication_guidelines.json")

with open(GUIDELINES_PATH, "r", encoding="utf-8") as f:
    _GUIDELINES = json.load(f)["guidelines"]

DISCLAIMER = (
    "Educational reference based on the WHO Model List of Essential Medicines. "
    "This is not a prescription or a diagnosis — confirm dosages with a pharmacist "
    "or doctor, especially for children, older adults, pregnancy, or existing conditions."
)

# Triage levels that should always push toward professional care, regardless
# of which disease category was predicted.
_URGENT_TRIAGE_LEVELS = {"Emergency", "Urgent Doctor"}


def _urgency_message(triage_level: str, member_name: str | None, severity: int | None) -> tuple[bool, str]:
    who = member_name or "This family member"
    if triage_level == "Emergency":
        return True, f"{who}'s symptoms match an emergency pattern. Seek emergency care now — call local emergency services or go to the nearest ER."
    if triage_level == "Urgent Doctor":
        return True, f"{who}'s symptoms suggest this needs a doctor's attention soon — ideally within 24 hours, sooner if things worsen."
    if triage_level == "Routine Checkup":
        return False, f"Nothing urgent, but it's worth booking a routine checkup for {who} if this pattern continues."
    if severity is not None and severity >= 8:
        return True, f"Severity is high for {who} even though the pattern looks self-manageable — trust your judgment and see a doctor if it doesn't improve quickly."
    return False, f"{who}'s pattern looks self-manageable for now. Keep monitoring and re-check if symptoms change or worsen."


def get_care_recommendation(
    *,
    disease_category: str,
    triage_level: str,
    severity: int | None = None,
    member_name: str | None = None,
    age_range: str | None = None,
    enrich_with_live_data: bool = True,
) -> dict:
    guideline = _GUIDELINES.get(disease_category, {})
    who_meds = guideline.get("who_eml_medications", [])
    self_care_notes = guideline.get("self_care_notes", "")

    doctor_visit_recommended, urgency_message = _urgency_message(triage_level, member_name, severity)

    suggestions: list[dict] = []
    for med in who_meds:
        entry = dict(med)
        if age_range == "pediatric":
            entry["caution"] = "Pediatric dosing differs from the adult dose shown — confirm with a pharmacist or pediatrician before giving to a child."
        elif age_range == "senior":
            entry["caution"] = "Older adults may need reduced dosing or have more interactions — confirm with a pharmacist or doctor."

        if enrich_with_live_data:
            enrichment = fetch_label_enrichment(entry["generic_name"])
            if enrichment:
                entry["live_label_data"] = enrichment

        suggestions.append(entry)

    return {
        "disclaimer": DISCLAIMER,
        "doctor_visit_recommended": doctor_visit_recommended,
        "urgency_message": urgency_message,
        "self_care_notes": self_care_notes,
        "suggested_medications": suggestions,
    }
