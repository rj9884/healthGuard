from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = "User"
    full_name: Optional[str] = None
    age_range: Optional[str] = "adult"  # 'pediatric', 'adult', 'senior'
    sex: Optional[str] = "unspecified"
    language: Optional[str] = "en"


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    full_name: Optional[str] = None
    age_range: Optional[str] = None
    sex: Optional[str] = None
    language: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
