from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Project, IdeaCard, Task, User
from schemas import SearchResults, IdeaCardOut
from auth import get_current_user
from routers.projects import project_to_out

router = APIRouter()


@router.get("", response_model=SearchResults)
def search(q: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    like = f"%{q}%"

    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .filter(or_(Project.title.ilike(like), Project.description.ilike(like)))
        .all()
    )
    ideas = (
        db.query(IdeaCard)
        .filter(IdeaCard.user_id == current_user.id)
        .filter(or_(IdeaCard.title.ilike(like), IdeaCard.note.ilike(like)))
        .all()
    )
    tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .filter(Task.title.ilike(like))
        .all()
    )

    return SearchResults(
        projects=[project_to_out(p) for p in projects],
        ideas=[IdeaCardOut.from_idea(i) for i in ideas],
        tasks=tasks,
    )
