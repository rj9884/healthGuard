from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime, timezone
from app.models.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), default="default_user")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    role = Column(String)       # 'user' or 'assistant'
    content = Column(String)
