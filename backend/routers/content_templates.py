from fastapi import APIRouter, Depends

from auth import get_current_user
from constants import CONTENT_TEMPLATES
from models import User
from schemas import ContentTemplateOut

router = APIRouter()


@router.get("", response_model=list[ContentTemplateOut])
def list_templates(current_user: User = Depends(get_current_user)):
    return CONTENT_TEMPLATES
