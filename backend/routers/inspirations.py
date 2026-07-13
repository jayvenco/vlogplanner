from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Inspiration, User
from schemas import InspirationCreate, InspirationUpdate, InspirationOut
from auth import get_current_user

router = APIRouter()


def _get_owned_inspiration(db: Session, inspiration_id: int, current_user: User) -> Inspiration:
    inspiration = (
        db.query(Inspiration)
        .filter(Inspiration.id == inspiration_id, Inspiration.user_id == current_user.id)
        .first()
    )
    if not inspiration:
        raise HTTPException(status_code=404, detail="Inspiratie niet gevonden")
    return inspiration


@router.get("", response_model=list[InspirationOut])
def list_inspirations(
    tag: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    query = db.query(Inspiration).filter(Inspiration.user_id == current_user.id)
    if tag:
        query = query.filter(Inspiration.tags.ilike(f"%{tag}%"))
    return query.order_by(Inspiration.created_at.desc()).all()


@router.post("", response_model=InspirationOut)
def create_inspiration(
    payload: InspirationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    inspiration = Inspiration(user_id=current_user.id, **payload.model_dump())
    db.add(inspiration)
    db.commit()
    db.refresh(inspiration)
    return inspiration


@router.put("/{inspiration_id}", response_model=InspirationOut)
def update_inspiration(
    inspiration_id: int,
    payload: InspirationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inspiration = _get_owned_inspiration(db, inspiration_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(inspiration, key, value)
    db.commit()
    db.refresh(inspiration)
    return inspiration


@router.delete("/{inspiration_id}")
def delete_inspiration(
    inspiration_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    inspiration = _get_owned_inspiration(db, inspiration_id, current_user)
    db.delete(inspiration)
    db.commit()
    return {"ok": True}
