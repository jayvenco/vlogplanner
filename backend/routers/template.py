from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ProjectTemplate, ProjectTip, User
from schemas import ProjectTemplateOut, ProjectTemplateUpdate, ProjectTipOut, TipRequest
from auth import get_current_user
from llm_service import generate, NoApiKeyError, LLMRequestError
from routers.projects import get_owned_project

TIP_SYSTEM_PROMPT = (
    "Je bent een vriendelijke, behulpzame assistent voor kinderen die YouTube-video's en vlogs maken. "
    "Geef korte, concrete, positieve tips in het Nederlands, in eenvoudige taal die een kind van rond de "
    "10-12 jaar goed begrijpt. Gebruik geen moeilijke woorden en houd het antwoord kort (max. 4-5 zinnen)."
)

router = APIRouter()


def _get_or_create_template(db: Session, project) -> ProjectTemplate:
    if project.template:
        return project.template
    template = ProjectTemplate(project_id=project.id)
    db.add(template)
    db.commit()
    db.refresh(project)
    return project.template


@router.get("/projects/{project_id}/template", response_model=ProjectTemplateOut)
def get_template(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    return _get_or_create_template(db, project)


@router.put("/projects/{project_id}/template", response_model=ProjectTemplateOut)
def update_template(
    project_id: int,
    payload: ProjectTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)
    template = _get_or_create_template(db, project)
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(template, key, value)
    db.commit()
    db.refresh(template)
    return template


@router.get("/projects/{project_id}/tips", response_model=list[ProjectTipOut])
def list_tips(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = get_owned_project(db, project_id, current_user)
    return project.tips


@router.post("/projects/{project_id}/tips", response_model=ProjectTipOut)
def create_tip(
    project_id: int,
    payload: TipRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(db, project_id, current_user)
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Typ eerst een vraag voor GPT.")

    context = f"Project thema: {project.title}. Beschrijving: {project.description or 'geen beschrijving'}."
    try:
        answer = generate(current_user, TIP_SYSTEM_PROMPT, f"{context}\n\nVraag: {payload.question}")
    except NoApiKeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except LLMRequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    tip = ProjectTip(project_id=project.id, question=payload.question, answer=answer)
    db.add(tip)
    db.commit()
    db.refresh(tip)
    return tip
