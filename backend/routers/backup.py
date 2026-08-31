import os

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from models import User
from auth import get_current_user
from backup_service import create_backup

router = APIRouter()


class BackupOut(BaseModel):
    ok: bool
    filename: str


@router.post("", response_model=BackupOut)
def trigger_backup(current_user: User = Depends(get_current_user)):
    zip_path = create_backup()
    return BackupOut(ok=True, filename=os.path.basename(zip_path))
