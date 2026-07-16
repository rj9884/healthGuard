import uuid
from sqlalchemy import Column, String, DateTime, Date, ForeignKey
from datetime import datetime, timezone
from app.models.database import Base


def _new_member_id() -> str:
    return f"mem_{uuid.uuid4().hex[:12]}"


class FamilyMember(Base):
    """
    A profile belonging to a household account (Netflix-style profile switching).
    One `User` (the account that logs in) can have many `FamilyMember` profiles:
    e.g. "Dad (self)", "Mom", "Riya (daughter)", "Grandma".
    All symptom logs, medications, and ML predictions are scoped to a member,
    not directly to the login account, so each family member gets their own
    health history and predictions even though the household shares one login.
    """

    __tablename__ = "family_members"

    id = Column(String, primary_key=True, default=_new_member_id)
    account_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    relation = Column(String, default="self")     # self, spouse, child, parent, sibling, other
    age_range = Column(String, default="adult")   # pediatric, adult, senior
    sex = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    avatar_color = Column(String, default="teal")  # used by the frontend profile switcher
    notes = Column(String, nullable=True)          # e.g. known allergies / chronic conditions

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
