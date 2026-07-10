import random

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Task, IdeaCard, User
from schemas import DashboardOut
from auth import get_current_user
from badges import get_badge_list
from constants import MOTIVATIONAL_QUOTES
from routers.projects import project_to_out

router = APIRouter()


@router.get("", response_model=DashboardOut)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project_count = db.query(Project).filter(Project.user_id == current_user.id).count()
    open_task_count = (
        db.query(Task).filter(Task.user_id == current_user.id, Task.is_done.is_(False)).count()
    )
    idea_count = db.query(IdeaCard).filter(IdeaCard.user_id == current_user.id).count()
    latest_project = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
        .first()
    )

    return DashboardOut(
        project_count=project_count,
        open_task_count=open_task_count,
        idea_count=idea_count,
        latest_project=project_to_out(latest_project) if latest_project else None,
        quote=random.choice(MOTIVATIONAL_QUOTES),
        badges=get_badge_list(db, current_user),
    )
