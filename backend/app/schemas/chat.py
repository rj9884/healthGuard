from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[dict]] = None


class ChatResponse(BaseModel):
    reply: str
