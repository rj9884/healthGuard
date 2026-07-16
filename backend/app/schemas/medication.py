from pydantic import BaseModel
from typing import Optional
from datetime import date


class MedicationCreate(BaseModel):
    member_id: Optional[str] = None
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    notes: Optional[str] = None
    source: Optional[str] = "manual"


class MedicationResponse(BaseModel):
    id: int
    user_id: str
    member_id: Optional[str] = None
    name: str
    dosage: Optional[str]
    frequency: Optional[str]
    start_date: Optional[date]
    notes: Optional[str]
    source: Optional[str] = "manual"

    class Config:
        from_attributes = True


class MedicationSuggestionRequest(BaseModel):
    disease_category: str
    triage_level: str
    severity: Optional[int] = None
    member_id: Optional[str] = None
