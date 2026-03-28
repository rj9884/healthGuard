DEFAULT_USER_ID = "default_user"


def get_current_user_id() -> str:
    """Single-user placeholder until auth is introduced."""
    return DEFAULT_USER_ID
