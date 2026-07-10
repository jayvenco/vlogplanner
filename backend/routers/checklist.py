from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ChecklistItem, User
from schemas import ChecklistItemOut, ChecklistItemCreate, ChecklistItemUpdate
from auth import get_current_user
from badges import check_and_award_badges
from routers.projects import get_owned_project

router = APIRouter()


@router.get("/projects/{project_id}/checklist", response_model=list[ChecklistItemOut])
def list_checklist(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    return project.checklist_items


@router.post("/projects/{project_id}/checklist", response_model=ChecklistItemOut)
def add_checklist_item(
    project_id: int,
    payload: ChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)
    max_order = max([i.order for i in project.checklist_items], default=-1)
    item = ChecklistItem(
        project_id=project.id,
        section=payload.section,
        text=payload.text,
        is_custom=True,
        order=max_order + 1,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _get_owned_item(db: Session, item_id: int, current_user: User) -> ChecklistItem:
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item or item.project.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Checklist-item niet gevonden")
    return item


@router.put("/checklist/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(
    item_id: int,
    payload: ChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = _get_owned_item(db, item_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    check_and_award_badges(db, current_user)
    return item


@router.delete("/checklist/{item_id}")
def delete_checklist_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    item = _get_owned_item(db, item_id, current_user)
    db.delete(item)
    db.commit()
    return {"ok": True}
