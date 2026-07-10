from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import IdeaCard, User
from schemas import IdeaCardOut, IdeaCardCreate, IdeaCardUpdate
from auth import get_current_user
from badges import check_and_award_badges

router = APIRouter()


def _get_owned_idea(db: Session, idea_id: int, current_user: User) -> IdeaCard:
    idea = db.query(IdeaCard).filter(IdeaCard.id == idea_id, IdeaCard.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee niet gevonden")
    return idea


@router.get("", response_model=list[IdeaCardOut])
def list_ideas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(IdeaCard)
        .filter(IdeaCard.user_id == current_user.id)
        .order_by(IdeaCard.column, IdeaCard.order)
        .all()
    )


@router.post("", response_model=IdeaCardOut)
def create_idea(payload: IdeaCardCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    max_order = (
        db.query(IdeaCard)
        .filter(IdeaCard.user_id == current_user.id, IdeaCard.column == payload.column)
        .count()
    )
    idea = IdeaCard(
        user_id=current_user.id,
        title=payload.title,
        note=payload.note,
        column=payload.column,
        order=max_order,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    check_and_award_badges(db, current_user)
    return idea


@router.put("/{idea_id}", response_model=IdeaCardOut)
def update_idea(
    idea_id: int,
    payload: IdeaCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = _get_owned_idea(db, idea_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(idea, key, value)
    db.commit()
    db.refresh(idea)
    return idea


@router.delete("/{idea_id}")
def delete_idea(idea_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    idea = _get_owned_idea(db, idea_id, current_user)
    db.delete(idea)
    db.commit()
    return {"ok": True}
