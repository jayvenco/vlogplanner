import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import IdeaCard, User
from schemas import IdeaCardOut, IdeaCardCreate, IdeaCardUpdate, IdeaGenerateRequest
from auth import get_current_user
from badges import check_and_award_badges
from constants import CONTENT_TEMPLATES_BY_KEY, AGE_GROUP_GUIDANCE
from llm_service import generate, NoApiKeyError, LLMRequestError

router = APIRouter()

GENERATION_KINDS = {"script", "titles", "thumbnail_text", "description", "hashtags"}

IDEA_SYSTEM_PROMPT = (
    "Je bent een creatieve assistent die jonge YouTube-vloggers helpt met het maken van hun video's. "
    "Antwoord in het Nederlands, kort en concreet, in taal die een tiener goed begrijpt."
)


def _get_owned_idea(db: Session, idea_id: int, current_user: User) -> IdeaCard:
    idea = db.query(IdeaCard).filter(IdeaCard.id == idea_id, IdeaCard.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idee niet gevonden")
    return idea


@router.get("", response_model=list[IdeaCardOut])
def list_ideas(
    theme: Optional[str] = None,
    target_age: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(IdeaCard).filter(IdeaCard.user_id == current_user.id)
    if theme:
        query = query.filter(IdeaCard.theme == theme)
    if target_age:
        query = query.filter(IdeaCard.target_age == target_age)
    ideas = query.order_by(IdeaCard.column, IdeaCard.order).all()
    return [IdeaCardOut.from_idea(i) for i in ideas]


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
        description=payload.description,
        note=payload.note,
        theme=payload.theme,
        target_age=payload.target_age,
        estimated_date=payload.estimated_date,
        template_key=payload.template_key,
        column=payload.column,
        order=max_order,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    check_and_award_badges(db, current_user)
    return IdeaCardOut.from_idea(idea)


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
    return IdeaCardOut.from_idea(idea)


@router.delete("/{idea_id}")
def delete_idea(idea_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    idea = _get_owned_idea(db, idea_id, current_user)
    db.delete(idea)
    db.commit()
    return {"ok": True}


@router.post("/{idea_id}/generate", response_model=IdeaCardOut)
def generate_for_idea(
    idea_id: int,
    payload: IdeaGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    idea = _get_owned_idea(db, idea_id, current_user)
    if payload.kind not in GENERATION_KINDS:
        raise HTTPException(status_code=400, detail=f"Onbekend type: {payload.kind}")

    template = CONTENT_TEMPLATES_BY_KEY.get(idea.template_key) if idea.template_key else None
    age_guidance = AGE_GROUP_GUIDANCE.get(idea.target_age.value if idea.target_age else "", "")

    context_parts = [f"Video-idee: {idea.title}."]
    if idea.description:
        context_parts.append(f"Beschrijving: {idea.description}.")
    if idea.theme:
        context_parts.append(f"Thema: {idea.theme}.")
    if age_guidance:
        context_parts.append(f"Doelgroep-richtlijn: {age_guidance}")
    if template:
        structure = template["structure"]
        context_parts.append(
            "Gebruik deze scriptstructuur als leidraad: "
            f"hook: {structure['hook']} / intro: {structure['intro']} / body: {structure['body']} / "
            f"cta: {structure['cta']} / outro: {structure['outro']}."
        )

    context = " ".join(context_parts)

    prompts = {
        "script": f"{context}\n\nSchrijf een concept-script met duidelijke kopjes Hook, Intro, Body, CTA en Outro.",
        "titles": f"{context}\n\nBedenk 5 pakkende titel-suggesties voor deze video, elk op een aparte regel.",
        "thumbnail_text": f"{context}\n\nBedenk 3 korte, pakkende tekst-ideeën voor op de thumbnail (max. 4 woorden per idee).",
        "description": f"{context}\n\nSchrijf een korte, aantrekkelijke videobeschrijving (max. 4 zinnen).",
        "hashtags": f"{context}\n\nBedenk 8 relevante hashtags voor deze video, gescheiden door spaties.",
    }

    try:
        result = generate(current_user, IDEA_SYSTEM_PROMPT, prompts[payload.kind])
    except NoApiKeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except LLMRequestError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    generations = json.loads(idea.ai_generations) if idea.ai_generations else {}
    generations[payload.kind] = result
    idea.ai_generations = json.dumps(generations)
    db.commit()
    db.refresh(idea)
    return IdeaCardOut.from_idea(idea)
