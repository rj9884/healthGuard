from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class FamilyMemberCreate(BaseModel):
    name: str
    relation: str = "self"           # self, spouse, child, parent, sibling, other
    age_range: str = "adult"         # pediatric, adult, senior
    sex: Optional[str] = None
    date_of_birth: Optional[date] = None
    avatar_color: Optional[str] = "teal"
    notes: Optional[str] = None


class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relation: Optional[str] = None
    age_range: Optional[str] = None
    sex: Optional[str] = None
    date_of_birth: Optional[date] = None
    avatar_color: Optional[str] = None
    notes: Optional[str] = None


class FamilyMemberResponse(BaseModel):
    id: str
    account_id: str
    name: str
    relation: str
    age_range: str
    sex: Optional[str] = None
    date_of_birth: Optional[date] = None
    avatar_color: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
