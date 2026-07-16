from sqlalchemy.orm import Session

from app.repositories.family_member_repository import (
    create_family_member,
    delete_family_member,
    get_family_member_for_account,
    list_family_members,
    update_family_member,
)
from app.schemas.family_member import FamilyMemberCreate, FamilyMemberUpdate


def ensure_self_profile(db: Session, *, account_id: str, name: str, age_range: str = "adult", sex: str | None = None):
    """Every account gets a 'self' profile automatically the first time it's needed,
    so existing single-user accounts keep working without any manual setup step."""
    members = list_family_members(db, account_id=account_id)
    if members:
        return members[0]
    return create_family_member(
        db,
        account_id=account_id,
        name=name,
        relation="self",
        age_range=age_range,
        sex=sex,
        avatar_color="teal",
    )


def get_members(db: Session, *, account_id: str):
    return list_family_members(db, account_id=account_id)


def add_member(db: Session, *, account_id: str, payload: FamilyMemberCreate):
    return create_family_member(
        db,
        account_id=account_id,
        name=payload.name,
        relation=payload.relation,
        age_range=payload.age_range,
        sex=payload.sex,
        date_of_birth=payload.date_of_birth,
        avatar_color=payload.avatar_color or "teal",
        notes=payload.notes,
    )


def edit_member(db: Session, *, account_id: str, member_id: str, payload: FamilyMemberUpdate):
    member = get_family_member_for_account(db, member_id=member_id, account_id=account_id)
    if member is None:
        return None
    return update_family_member(db, member, **payload.model_dump(exclude_unset=True))


def remove_member(db: Session, *, account_id: str, member_id: str) -> bool:
    member = get_family_member_for_account(db, member_id=member_id, account_id=account_id)
    if member is None:
        return False
    delete_family_member(db, member)
    return True
