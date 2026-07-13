from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import TrendsOut
from auth import get_current_user
from trends_service import get_trending, CATEGORIES, YoutubeApiKeyNotConfiguredError

router = APIRouter()


@router.get("/categories")
def list_categories(current_user: User = Depends(get_current_user)):
    return CATEGORIES


@router.get("", response_model=TrendsOut)
def trending(
    region: str = "NL",
    category: str = "22",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        data = get_trending(db, region, category)
    except YoutubeApiKeyNotConfiguredError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Kon trends niet ophalen: {exc}")

    return TrendsOut(region_code=region, category_id=category, **data)
