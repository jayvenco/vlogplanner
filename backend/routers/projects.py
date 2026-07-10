import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db, THUMBNAILS_DIR
from models import Project, ChecklistItem, StoryboardScene, ProjectTemplate, User
from schemas import ProjectCreate, ProjectUpdate, ProjectOut, ProjectDetailOut, YoutubeLinkUpdate, YoutubeStatsOut
from auth import get_current_user
from badges import check_and_award_badges
from constants import DEFAULT_CHECKLIST_ITEMS, DEFAULT_STORYBOARD_BLOCKS
from pdf_export import generate_project_pdf
import youtube_service as yt
from youtube_service import YoutubeNotConfiguredError, YoutubeNotConnectedError, YoutubeApiError

router = APIRouter()

ALLOWED_THUMBNAIL_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def checklist_progress(project: Project) -> float:
    if not project.checklist_items:
        return 0.0
    checked = sum(1 for item in project.checklist_items if item.is_checked)
    return round(checked / len(project.checklist_items) * 100, 1)


def project_to_out(project: Project) -> ProjectOut:
    out = ProjectOut.model_validate(project)
    out.checklist_progress = checklist_progress(project)
    return out


def get_owned_project(db: Session, project_id: int, user: User) -> Project:
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project niet gevonden")
    return project


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = (
        db.query(Project)
        .filter(Project.user_id == current_user.id)
        .order_by(Project.updated_at.desc())
        .all()
    )
    return [project_to_out(p) for p in projects]


@router.post("", response_model=ProjectDetailOut)
def create_project(
    payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    project = Project(user_id=current_user.id, title=payload.title, description=payload.description)
    db.add(project)
    db.flush()

    for order, (section, text) in enumerate(DEFAULT_CHECKLIST_ITEMS):
        db.add(ChecklistItem(project_id=project.id, section=section, text=text, order=order))

    for order, block in enumerate(DEFAULT_STORYBOARD_BLOCKS):
        db.add(StoryboardScene(project_id=project.id, block=block, title="", notes="", order=order))

    db.add(ProjectTemplate(project_id=project.id))

    db.commit()
    db.refresh(project)
    check_and_award_badges(db, current_user)
    db.refresh(project)
    return _to_detail(project)


def _to_detail(project: Project) -> ProjectDetailOut:
    base = project_to_out(project)
    return ProjectDetailOut(**base.model_dump(), checklist_items=project.checklist_items, storyboard_scenes=project.storyboard_scenes)


@router.get("/{project_id}", response_model=ProjectDetailOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    return _to_detail(project)


@router.put("/{project_id}", response_model=ProjectDetailOut)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    check_and_award_badges(db, current_user)
    db.refresh(project)
    return _to_detail(project)


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    if project.thumbnail_path:
        full_path = os.path.join(THUMBNAILS_DIR, os.path.basename(project.thumbnail_path))
        if os.path.exists(full_path):
            os.remove(full_path)
    db.delete(project)
    db.commit()
    return {"ok": True}


@router.post("/{project_id}/thumbnail", response_model=ProjectOut)
def upload_thumbnail(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_THUMBNAIL_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Alleen afbeeldingen zijn toegestaan (jpg, png, webp, gif)")

    if project.thumbnail_path:
        old_path = os.path.join(THUMBNAILS_DIR, os.path.basename(project.thumbnail_path))
        if os.path.exists(old_path):
            os.remove(old_path)

    filename = f"{uuid.uuid4()}{ext}"
    dest_path = os.path.join(THUMBNAILS_DIR, filename)
    with open(dest_path, "wb") as f:
        f.write(file.file.read())

    project.thumbnail_path = f"/uploads/thumbnails/{filename}"
    db.commit()
    db.refresh(project)
    return project_to_out(project)


@router.get("/{project_id}/export/pdf")
def export_project_pdf(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    buffer = generate_project_pdf(project)
    filename = f"{project.title or 'project'}.pdf".replace(" ", "_")
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.put("/{project_id}/youtube", response_model=ProjectOut)
def link_youtube_video(
    project_id: int,
    payload: YoutubeLinkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)
    project.youtube_video_id = payload.youtube_video_id
    project.youtube_video_title = payload.youtube_video_title
    db.commit()
    db.refresh(project)
    return project_to_out(project)


@router.get("/{project_id}/youtube-stats", response_model=YoutubeStatsOut)
def get_youtube_stats(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    if not project.youtube_video_id:
        raise HTTPException(status_code=400, detail="Dit project is nog niet gekoppeld aan een YouTube-video.")

    try:
        access_token = yt.get_valid_access_token(current_user, db)
        stats = yt.get_video_stats(access_token, [project.youtube_video_id])
    except YoutubeNotConnectedError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except (YoutubeNotConfiguredError, YoutubeApiError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    video_stats = stats.get(project.youtube_video_id, {})
    return YoutubeStatsOut(view_count=video_stats.get("view_count"), like_count=video_stats.get("like_count"))
