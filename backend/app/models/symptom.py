from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from datetime import datetime, timezone
from app.models.database import Base


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), default="default_user")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    symptom = Column(String, nullable=False)
    severity = Column(Integer)              # 1–10
    duration_hr = Column(Float)
    triggers = Column(JSON)                 # ["dairy", "stress"]
    relief = Column(JSON)                   # ["rest", "water"]
    notes = Column(String)
