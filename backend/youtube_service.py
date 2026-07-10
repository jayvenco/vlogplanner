import os
from datetime import datetime, timedelta
from urllib.parse import urlencode

import requests
from sqlalchemy.orm import Session

from models import User

AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"
API_BASE = "https://www.googleapis.com/youtube/v3"
SCOPE = "https://www.googleapis.com/auth/youtube.readonly"


class YoutubeNotConfiguredError(Exception):
    pass


class YoutubeNotConnectedError(Exception):
    pass


class YoutubeApiError(Exception):
    pass


def _get_config():
    client_id = os.environ.get("YOUTUBE_CLIENT_ID")
    client_secret = os.environ.get("YOUTUBE_CLIENT_SECRET")
    redirect_uri = os.environ.get("YOUTUBE_REDIRECT_URI")
    if not client_id or not client_secret or not redirect_uri:
        raise YoutubeNotConfiguredError(
            "YouTube-koppeling is nog niet geconfigureerd. Vraag een volwassene om dit in te stellen."
        )
    return client_id, client_secret, redirect_uri


def build_auth_url(state: str) -> str:
    client_id, _client_secret, redirect_uri = _get_config()
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return f"{AUTH_URL}?{urlencode(params)}"


def exchange_code(code: str) -> dict:
    client_id, client_secret, redirect_uri = _get_config()
    response = requests.post(
        TOKEN_URL,
        data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    if not response.ok:
        raise YoutubeApiError(f"Kon YouTube-toegang niet bevestigen: {response.text}")
    return response.json()


def refresh_access_token(refresh_token: str) -> dict:
    client_id, client_secret, _redirect_uri = _get_config()
    response = requests.post(
        TOKEN_URL,
        data={
            "refresh_token": refresh_token,
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "refresh_token",
        },
        timeout=10,
    )
    if not response.ok:
        raise YoutubeApiError(f"Kon YouTube-toegang niet vernieuwen: {response.text}")
    return response.json()


def get_valid_access_token(user: User, db: Session) -> str:
    if not user.youtube_refresh_token:
        raise YoutubeNotConnectedError("Dit account is nog niet verbonden met YouTube.")

    if user.youtube_token_expires_at and user.youtube_token_expires_at > datetime.utcnow():
        return user.youtube_access_token

    data = refresh_access_token(user.youtube_refresh_token)
    user.youtube_access_token = data["access_token"]
    user.youtube_token_expires_at = datetime.utcnow() + timedelta(seconds=data.get("expires_in", 3600))
    db.commit()
    return user.youtube_access_token


def _get(path: str, access_token: str, params: dict) -> dict:
    response = requests.get(
        f"{API_BASE}/{path}",
        headers={"Authorization": f"Bearer {access_token}"},
        params=params,
        timeout=10,
    )
    if not response.ok:
        raise YoutubeApiError(f"YouTube API-fout: {response.text}")
    return response.json()


def get_channel_info(access_token: str) -> dict:
    data = _get("channels", access_token, {"part": "snippet,contentDetails", "mine": "true"})
    items = data.get("items", [])
    if not items:
        raise YoutubeApiError("Geen YouTube-kanaal gevonden voor dit account.")
    channel = items[0]
    return {
        "channel_id": channel["id"],
        "title": channel["snippet"]["title"],
        "uploads_playlist_id": channel["contentDetails"]["relatedPlaylists"]["uploads"],
    }


def list_recent_videos(access_token: str, uploads_playlist_id: str, max_results: int = 25) -> list[dict]:
    data = _get(
        "playlistItems",
        access_token,
        {"part": "snippet", "playlistId": uploads_playlist_id, "maxResults": max_results},
    )
    videos = []
    for item in data.get("items", []):
        snippet = item["snippet"]
        thumbnails = snippet.get("thumbnails", {})
        thumbnail = (thumbnails.get("medium") or thumbnails.get("default") or {}).get("url")
        videos.append(
            {
                "video_id": snippet["resourceId"]["videoId"],
                "title": snippet["title"],
                "thumbnail": thumbnail,
            }
        )

    if videos:
        stats = get_video_stats(access_token, [v["video_id"] for v in videos])
        for video in videos:
            video_stats = stats.get(video["video_id"], {})
            video["view_count"] = video_stats.get("view_count")
            video["like_count"] = video_stats.get("like_count")

    return videos


def get_video_stats(access_token: str, video_ids: list[str]) -> dict:
    if not video_ids:
        return {}
    data = _get("videos", access_token, {"part": "statistics", "id": ",".join(video_ids)})
    result = {}
    for item in data.get("items", []):
        stats = item.get("statistics", {})
        result[item["id"]] = {
            "view_count": int(stats["viewCount"]) if "viewCount" in stats else None,
            "like_count": int(stats["likeCount"]) if "likeCount" in stats else None,
        }
    return result
