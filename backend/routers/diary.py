from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import DiaryEntry, Project, User
from schemas import DiaryEntryOut, DiaryEntryCreate, DiaryEntryUpdate
from auth import get_current_user

router = APIRouter()


def _get_owned_entry(db: Session, entry_id: int, current_user: User) -> DiaryEntry:
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id, DiaryEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Dagboek-item niet gevonden")
    return entry


@router.get("", response_model=list[DiaryEntryOut])
def list_diary_entries(
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(DiaryEntry).filter(DiaryEntry.user_id == current_user.id)
    if project_id is not None:
        query = query.filter(DiaryEntry.project_id == project_id)
    return query.order_by(DiaryEntry.entry_date.desc()).all()


@router.post("", response_model=DiaryEntryOut)
def create_diary_entry(
    payload: DiaryEntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if payload.project_id is not None:
        project = db.query(Project).filter(Project.id == payload.project_id, Project.user_id == current_user.id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project niet gevonden")

    entry = DiaryEntry(user_id=current_user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{entry_id}", response_model=DiaryEntryOut)
def update_diary_entry(
    entry_id: int,
    payload: DiaryEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = _get_owned_entry(db, entry_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/{entry_id}")
def delete_diary_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = _get_owned_entry(db, entry_id, current_user)
    db.delete(entry)
    db.commit()
    return {"ok": True}
