from fpdf import FPDF
from sqlalchemy.orm import Session
from app.models.symptom import SymptomLog
from app.models.medication import Medication
from app.core.pattern_engine import get_symptom_summary
import io
from datetime import datetime, timezone


def generate_health_report(db: Session, user_id: str) -> bytes:
    """Generate a PDF health summary for a user."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 15, "Health Summary Report", new_x="LMARGIN", new_y="NEXT", align="C")

    pdf.set_font("Helvetica", "", 10)
    pdf.cell(
        0, 8,
        f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        new_x="LMARGIN", new_y="NEXT", align="C",
    )
    pdf.cell(0, 8, f"User: {user_id}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)

    # --- Symptom Summary ---
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Symptom Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(59, 130, 246)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    summary = get_symptom_summary(db, user_id)
    if summary:
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(80, 8, "Symptom", border=1)
        pdf.cell(30, 8, "Count", border=1, align="C")
        pdf.cell(40, 8, "Avg Severity", border=1, align="C")
        pdf.ln()
        pdf.set_font("Helvetica", "", 10)
        for row in summary:
            pdf.cell(80, 8, str(row["symptom"]), border=1)
            pdf.cell(30, 8, str(row["count"]), border=1, align="C")
            pdf.cell(40, 8, str(row["avg_severity"]), border=1, align="C")
            pdf.ln()
    else:
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, "No symptoms logged yet.", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(5)

    # --- Recent Symptoms ---
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Recent Symptom Logs (Last 20)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(59, 130, 246)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    recent = (
        db.query(SymptomLog)
        .filter(SymptomLog.user_id == user_id)
        .order_by(SymptomLog.timestamp.desc())
        .limit(20)
        .all()
    )

    if recent:
        pdf.set_font("Helvetica", "", 9)
        for log in recent:
            ts = log.timestamp.strftime("%Y-%m-%d %H:%M") if log.timestamp else "N/A"
            triggers_str = ", ".join(log.triggers) if log.triggers else "None"
            line = f"{ts} | {log.symptom} | Severity: {log.severity}/10 | Triggers: {triggers_str}"
            pdf.cell(0, 7, line, new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, "No recent symptom logs.", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(5)

    # --- Medications ---
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 10, "Current Medications", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(59, 130, 246)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(3)

    meds = db.query(Medication).filter(Medication.user_id == user_id).all()
    if meds:
        pdf.set_font("Helvetica", "", 10)
        for med in meds:
            line = f"• {med.name} — {med.dosage or 'N/A'} — {med.frequency or 'N/A'}"
            pdf.cell(0, 7, line, new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 8, "No medications recorded.", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(10)

    # --- Disclaimer ---
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(
        0, 6,
        "Disclaimer: This report is generated for informational purposes only and "
        "does not constitute medical advice. Please consult a qualified healthcare "
        "provider for diagnosis and treatment.",
    )

    # Return bytes
    return bytes(pdf.output())
