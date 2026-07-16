from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_id
from app.models.database import get_db
from app.schemas.family_member import FamilyMemberCreate, FamilyMemberResponse, FamilyMemberUpdate
from app.services.family_member_service import (
    add_member,
    edit_member,
    ensure_self_profile,
    get_members,
    remove_member,
)
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[FamilyMemberResponse])
def list_members(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List every profile in this household. Auto-creates a 'self' profile
    on first call so existing accounts keep working without extra setup."""
    ensure_self_profile(db, account_id=user.id, name=user.name or "Me", age_range=user.age_range or "adult", sex=user.sex)
    return get_members(db, account_id=user.id)


@router.post("", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    payload: FamilyMemberCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    return add_member(db, account_id=user_id, payload=payload)


@router.patch("/{member_id}", response_model=FamilyMemberResponse)
def update_member(
    member_id: str,
    payload: FamilyMemberUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    updated = edit_member(db, account_id=user_id, member_id=member_id, payload=payload)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
    return updated


@router.delete("/{member_id}", status_code=status.HTTP_200_OK)
def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    deleted = remove_member(db, account_id=user_id, member_id=member_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family member not found")
    return {"message": "Deleted successfully"}
