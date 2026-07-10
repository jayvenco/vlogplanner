from dataclasses import dataclass
from typing import Callable

from sqlalchemy import func
from sqlalchemy.orm import Session

from models import Project, ProjectStatus, ChecklistItem, IdeaCard, Task, UserBadge, User


@dataclass
class BadgeDefinition:
    key: str
    title: str
    icon: str
    check: Callable[[Session, int], bool]


def _has_first_project(db: Session, user_id: int) -> bool:
    return db.query(Project).filter(Project.user_id == user_id).count() >= 1


def _has_published_video(db: Session, user_id: int) -> bool:
    return (
        db.query(Project)
        .filter(Project.user_id == user_id, Project.status == ProjectStatus.gepubliceerd)
        .count()
        >= 1
    )


def _has_ten_finished_projects(db: Session, user_id: int) -> bool:
    return (
        db.query(Project)
        .filter(
            Project.user_id == user_id,
            Project.status.in_([ProjectStatus.klaar, ProjectStatus.gepubliceerd]),
        )
        .count()
        >= 10
    )


def _has_completed_checklist(db: Session, user_id: int) -> bool:
    project_ids = [p.id for p in db.query(Project.id).filter(Project.user_id == user_id).all()]
    for project_id in project_ids:
        total = db.query(ChecklistItem).filter(ChecklistItem.project_id == project_id).count()
        if total == 0:
            continue
        checked = (
            db.query(ChecklistItem)
            .filter(ChecklistItem.project_id == project_id, ChecklistItem.is_checked.is_(True))
            .count()
        )
        if checked == total:
            return True
    return False


def _has_ten_ideas(db: Session, user_id: int) -> bool:
    return db.query(IdeaCard).filter(IdeaCard.user_id == user_id).count() >= 10


def _has_twenty_done_tasks(db: Session, user_id: int) -> bool:
    return db.query(Task).filter(Task.user_id == user_id, Task.is_done.is_(True)).count() >= 20


BADGE_DEFINITIONS = [
    BadgeDefinition("eerste_project", "Eerste project!", "🎬", _has_first_project),
    BadgeDefinition("eerste_video", "Eerste video gepubliceerd!", "🚀", _has_published_video),
    BadgeDefinition("tien_projecten", "10 projecten voltooid!", "🏆", _has_ten_finished_projects),
    BadgeDefinition("checklist_kampioen", "Checklist kampioen!", "✅", _has_completed_checklist),
    BadgeDefinition("ideeenmachine", "Ideeënmachine!", "💡", _has_ten_ideas),
    BadgeDefinition("taken_de_baas", "Taken de baas!", "📋", _has_twenty_done_tasks),
]


def check_and_award_badges(db: Session, user: User) -> None:
    earned_keys = {b.badge_key for b in db.query(UserBadge).filter(UserBadge.user_id == user.id).all()}
    for definition in BADGE_DEFINITIONS:
        if definition.key in earned_keys:
            continue
        if definition.check(db, user.id):
            db.add(UserBadge(user_id=user.id, badge_key=definition.key))
    db.commit()


def get_badge_list(db: Session, user: User):
    earned = {b.badge_key: b.earned_at for b in db.query(UserBadge).filter(UserBadge.user_id == user.id).all()}
    return [
        {
            "key": d.key,
            "title": d.title,
            "icon": d.icon,
            "earned_at": earned.get(d.key),
            "earned": d.key in earned,
        }
        for d in BADGE_DEFINITIONS
    ]
