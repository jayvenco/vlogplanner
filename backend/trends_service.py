import json
import re
from collections import Counter
from datetime import datetime, timedelta, timezone

import requests
from sqlalchemy.orm import Session

from models import TrendsCache

API_URL = "https://www.googleapis.com/youtube/v3/videos"
CACHE_MAX_AGE = timedelta(hours=6)

CATEGORIES = [
    {"id": "22", "label": "Vlogs / People & Blogs"},
    {"id": "24", "label": "Entertainment"},
    {"id": "23", "label": "Comedy"},
    {"id": "26", "label": "Howto & Style"},
    {"id": "27", "label": "Education"},
]

STOPWORDS = {
    "de", "het", "een", "en", "van", "is", "op", "in", "met", "voor", "the", "and",
    "to", "of", "a", "in", "on", "for", "my", "you", "your", "this", "that", "je",
    "ik", "we", "wij", "zijn", "was", "wat", "hoe", "die", "dit", "niet", "how",
}


class YoutubeApiKeyNotConfiguredError(Exception):
    pass


def _extract_keywords(videos: list[dict], top_n: int = 15) -> list[str]:
    counter: Counter = Counter()
    for video in videos:
        text = video["title"] + " " + " ".join(video.get("tags", []))
        words = re.findall(r"[a-zA-ZÀ-ſ]{4,}", text.lower())
        counter.update(w for w in words if w not in STOPWORDS)
    return [word for word, _count in counter.most_common(top_n)]


def _view_velocity(view_count: int, published_at: str) -> float:
    try:
        published = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
    except ValueError:
        return 0.0
    days = max((datetime.now(timezone.utc) - published).total_seconds() / 86400, 1)
    return round(view_count / days, 1)


def _fetch_from_youtube(region_code: str, category_id: str, api_key: str) -> dict:
    if not api_key:
        raise YoutubeApiKeyNotConfiguredError(
            "Er is nog geen YouTube API-sleutel ingesteld. Vul deze in bij Instellingen."
        )

    response = requests.get(
        API_URL,
        params={
            "part": "snippet,statistics",
            "chart": "mostPopular",
            "regionCode": region_code,
            "videoCategoryId": category_id,
            "maxResults": 25,
            "key": api_key,
        },
        timeout=10,
    )
    response.raise_for_status()
    items = response.json().get("items", [])

    videos = []
    for item in items:
        snippet = item["snippet"]
        stats = item.get("statistics", {})
        view_count = int(stats.get("viewCount", 0))
        videos.append(
            {
                "video_id": item["id"],
                "title": snippet["title"],
                "channel_title": snippet["channelTitle"],
                "thumbnail": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
                "view_count": view_count,
                "published_at": snippet["publishedAt"],
                "view_velocity": _view_velocity(view_count, snippet["publishedAt"]),
                "tags": snippet.get("tags", []),
            }
        )
    videos.sort(key=lambda v: v["view_velocity"], reverse=True)

    return {"keywords": _extract_keywords(videos), "videos": videos}


def get_trending(db: Session, region_code: str, category_id: str, api_key: str) -> dict:
    cached = (
        db.query(TrendsCache)
        .filter(TrendsCache.region_code == region_code, TrendsCache.category_id == category_id)
        .first()
    )
    if cached and cached.fetched_at > datetime.utcnow() - CACHE_MAX_AGE:
        payload = json.loads(cached.data)
        return {"fetched_at": cached.fetched_at, **payload}

    payload = _fetch_from_youtube(region_code, category_id, api_key)

    if cached:
        cached.data = json.dumps(payload)
        cached.fetched_at = datetime.utcnow()
    else:
        cached = TrendsCache(
            region_code=region_code, category_id=category_id, data=json.dumps(payload), fetched_at=datetime.utcnow()
        )
        db.add(cached)
    db.commit()

    return {"fetched_at": cached.fetched_at, **payload}
