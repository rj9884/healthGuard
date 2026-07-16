from sqlalchemy.orm import Session

from app.models.family_member import FamilyMember


def create_family_member(
    db: Session,
    *,
    account_id: str,
    name: str,
    relation: str = "self",
    age_range: str = "adult",
    sex: str | None = None,
    date_of_birth=None,
    avatar_color: str = "teal",
    notes: str | None = None,
) -> FamilyMember:
    member = FamilyMember(
        account_id=account_id,
        name=name.strip(),
        relation=relation,
        age_range=age_range,
        sex=sex,
        date_of_birth=date_of_birth,
        avatar_color=avatar_color,
        notes=notes,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def list_family_members(db: Session, *, account_id: str) -> list[FamilyMember]:
    return (
        db.query(FamilyMember)
        .filter(FamilyMember.account_id == account_id)
        .order_by(FamilyMember.created_at.asc())
        .all()
    )


def get_family_member(db: Session, *, member_id: str) -> FamilyMember | None:
    return db.query(FamilyMember).filter(FamilyMember.id == member_id).first()


def get_family_member_for_account(db: Session, *, member_id: str, account_id: str) -> FamilyMember | None:
    return (
        db.query(FamilyMember)
        .filter(FamilyMember.id == member_id, FamilyMember.account_id == account_id)
        .first()
    )


def update_family_member(db: Session, member: FamilyMember, **fields) -> FamilyMember:
    for key, value in fields.items():
        if value is not None:
            setattr(member, key, value)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def delete_family_member(db: Session, member: FamilyMember) -> None:
    db.delete(member)
    db.commit()
