from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SymptomCreate(BaseModel):
    symptom: str
    severity: int = Field(ge=1, le=10)
    duration_hr: Optional[float] = None
    triggers: Optional[list[str]] = None
    relief: Optional[list[str]] = None
    notes: Optional[str] = None


class SymptomResponse(BaseModel):
    id: int
    user_id: str
    timestamp: datetime
    symptom: str
    severity: int
    duration_hr: Optional[float]
    triggers: Optional[list[str]]
    relief: Optional[list[str]]
    notes: Optional[str]

    class Config:
        from_attributes = True
