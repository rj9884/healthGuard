from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from app.models.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String)
    age_range = Column(String)          # 'pediatric', 'adult', 'senior'
    sex = Column(String)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
