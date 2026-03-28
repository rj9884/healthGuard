from pydantic import BaseModel
from typing import Optional
from datetime import date


class MedicationCreate(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    notes: Optional[str] = None


class MedicationResponse(BaseModel):
    id: int
    user_id: str
    name: str
    dosage: Optional[str]
    frequency: Optional[str]
    start_date: Optional[date]
    notes: Optional[str]

    class Config:
        from_attributes = True
