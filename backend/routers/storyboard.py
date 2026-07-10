from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import StoryboardScene, User
from schemas import StoryboardSceneOut, StoryboardSceneUpdate
from auth import get_current_user
from routers.projects import get_owned_project

router = APIRouter()


@router.get("/projects/{project_id}/storyboard", response_model=list[StoryboardSceneOut])
def list_storyboard(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    return project.storyboard_scenes


@router.put("/projects/{project_id}/storyboard", response_model=list[StoryboardSceneOut])
def update_storyboard(
    project_id: int,
    payload: list[StoryboardSceneUpdate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)
    scenes_by_id = {s.id: s for s in project.storyboard_scenes}

    for scene_update in payload:
        scene = scenes_by_id.get(scene_update.id)
        if not scene:
            raise HTTPException(status_code=404, detail="Storyboard-scene niet gevonden")
        data = scene_update.model_dump(exclude_unset=True, exclude={"id"})
        for key, value in data.items():
            setattr(scene, key, value)

    db.commit()
    db.refresh(project)
    return project.storyboard_scenes
