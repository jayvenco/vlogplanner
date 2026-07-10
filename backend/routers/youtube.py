from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import YoutubeStatusOut, YoutubeVideoOut
from auth import get_current_user, create_oauth_state_token, verify_oauth_state_token
import youtube_service as yt
from youtube_service import YoutubeNotConfiguredError, YoutubeNotConnectedError, YoutubeApiError

router = APIRouter()


@router.get("/auth-url")
def get_auth_url(current_user: User = Depends(get_current_user)):
    try:
        state = create_oauth_state_token(current_user.id)
        url = yt.build_auth_url(state)
    except YoutubeNotConfiguredError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"url": url}


@router.get("/callback")
def oauth_callback(code: Optional[str] = None, state: Optional[str] = None, db: Session = Depends(get_db)):
    if not code or not state:
        return RedirectResponse("/instellingen?youtube=error")

    try:
        user_id = verify_oauth_state_token(state)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return RedirectResponse("/instellingen?youtube=error")

        token_data = yt.exchange_code(code)
        user.youtube_access_token = token_data["access_token"]
        user.youtube_refresh_token = token_data.get("refresh_token") or user.youtube_refresh_token
        user.youtube_token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))

        channel = yt.get_channel_info(user.youtube_access_token)
        user.youtube_channel_id = channel["channel_id"]
        user.youtube_channel_title = channel["title"]
        db.commit()
    except (ValueError, YoutubeNotConfiguredError, YoutubeApiError):
        return RedirectResponse("/instellingen?youtube=error")

    return RedirectResponse("/instellingen?youtube=connected")


@router.get("/status", response_model=YoutubeStatusOut)
def get_status(current_user: User = Depends(get_current_user)):
    return YoutubeStatusOut(
        connected=bool(current_user.youtube_refresh_token),
        channel_title=current_user.youtube_channel_title,
    )


@router.delete("/disconnect")
def disconnect(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.youtube_access_token = None
    current_user.youtube_refresh_token = None
    current_user.youtube_token_expires_at = None
    current_user.youtube_channel_id = None
    current_user.youtube_channel_title = None
    db.commit()
    return {"ok": True}


@router.get("/videos", response_model=list[YoutubeVideoOut])
def list_videos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        access_token = yt.get_valid_access_token(current_user, db)
        channel = yt.get_channel_info(access_token)
        videos = yt.list_recent_videos(access_token, channel["uploads_playlist_id"])
    except YoutubeNotConnectedError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except (YoutubeNotConfiguredError, YoutubeApiError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return videos
