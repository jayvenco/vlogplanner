import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import INSPIRATIONS_DIR, get_db
from models import Inspiration, InspirationType, User
from schemas import InspirationCreate, InspirationUpdate, InspirationOut
from auth import get_current_user

router = APIRouter()

ALLOWED_INSPIRATION_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


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


@router.post("/with-image", response_model=InspirationOut)
def create_inspiration_with_image(
    content: str = Form(""),
    tags: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_INSPIRATION_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Alleen afbeeldingen zijn toegestaan (jpg, png, webp, gif)")

    filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(INSPIRATIONS_DIR, filename)
    with open(dest_path, "wb") as f:
        f.write(file.file.read())

    inspiration = Inspiration(
        user_id=current_user.id,
        type=InspirationType.image,
        content=content,
        tags=tags,
        image_path=f"/uploads/inspirations/{filename}",
    )
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
    if inspiration.image_path:
        full_path = os.path.join(INSPIRATIONS_DIR, os.path.basename(inspiration.image_path))
        if os.path.exists(full_path):
            os.remove(full_path)
    db.delete(inspiration)
    db.commit()
    return {"ok": True}
