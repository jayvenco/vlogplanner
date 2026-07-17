import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from crypto_utils import decrypt
from database import get_db
from models import User
from schemas import RecommendationRequest, RecommendationOut, ContentTemplateOut
from auth import get_current_user
from constants import CONTENT_TEMPLATES_BY_KEY, THEME_TEMPLATE_KEYWORDS, AGE_GROUP_GUIDANCE
from trends_service import get_trending, YoutubeApiKeyNotConfiguredError

router = APIRouter()

# Reuse the theme->template keyword map to also pick a plausible trending category.
TEMPLATE_TO_CATEGORY = {
    "tutorial": "26",
    "review": "24",
    "qa": "24",
    "storytime": "24",
    "dag_in_het_leven": "22",
}


def _match_template_key(theme: str) -> str:
    theme_lower = theme.lower()
    for key, keywords in THEME_TEMPLATE_KEYWORDS.items():
        if any(keyword in theme_lower for keyword in keywords):
            return key
    return "dag_in_het_leven"


@router.post("", response_model=RecommendationOut)
def recommend(
    payload: RecommendationRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    template_key = _match_template_key(payload.theme)
    category_id = TEMPLATE_TO_CATEGORY.get(template_key, "22")
    template = CONTENT_TEMPLATES_BY_KEY.get(template_key)

    tone_and_length = AGE_GROUP_GUIDANCE.get(payload.target_age.value, "")

    theme_words = [w for w in payload.theme.lower().split() if len(w) > 2]

    api_key = decrypt(current_user.youtube_api_key_encrypted) if current_user.youtube_api_key_encrypted else os.environ.get("YOUTUBE_API_KEY")
    try:
        trends = get_trending(db, "NL", category_id, api_key)
    except YoutubeApiKeyNotConfiguredError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Kon trends niet ophalen: {exc}")

    matching_videos = [
        v for v in trends["videos"] if any(word in v["title"].lower() for word in theme_words)
    ]

    if matching_videos:
        top = matching_videos[:3]
        suggested_ideas = [f"Maak een video over '{payload.theme}' geïnspireerd op: \"{v['title']}\"" for v in top]
        reasoning = (
            f"Gebaseerd op trending video '{top[0]['title']}' "
            f"({top[0]['view_count']:,} views, {top[0]['view_velocity']}/dag) die aansluit bij jouw thema."
        )
    elif trends["videos"]:
        top = trends["videos"][:3]
        suggested_ideas = [
            f"Probeer '{payload.theme}' te combineren met wat nu trending is: \"{v['title']}\"" for v in top
        ]
        reasoning = (
            f"Geen video's gevonden die direct over '{payload.theme}' gaan, dus gebaseerd op de "
            f"algemeen trending video '{top[0]['title']}' in deze categorie."
        )
    else:
        suggested_ideas = [f"Maak een video over '{payload.theme}' met de {template['name']}-opbouw."]
        reasoning = "Geen trending data beschikbaar, dus gebaseerd op het gekozen thema en template alleen."

    return RecommendationOut(
        suggested_ideas=suggested_ideas,
        suggested_template=ContentTemplateOut(**template) if template else None,
        tone_and_length=tone_and_length,
        reasoning=reasoning,
    )
