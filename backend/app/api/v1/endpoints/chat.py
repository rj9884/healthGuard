from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.models.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import build_health_reply

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    reply = build_health_reply(
        db,
        user_id=user_id,
        message=payload.message,
        history=payload.history,
    )
    return ChatResponse(reply=reply)
