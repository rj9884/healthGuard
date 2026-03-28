from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.models.database import Base


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), default="default_user")
    name = Column(String, nullable=False)
    dosage = Column(String)
    frequency = Column(String)
    start_date = Column(Date)
    notes = Column(String)
