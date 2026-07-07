from fastapi import Depends
from app.core.auth import get_current_user
from app.models.user import User

DEFAULT_USER_ID = "default_user"


def get_current_user_id(user: User = Depends(get_current_user)) -> str:
    """Returns authenticated user ID, falling back to default_user for guests."""
    return user.id
