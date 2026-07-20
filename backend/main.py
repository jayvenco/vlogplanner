import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from database import Base, engine, run_schema_upgrades, UPLOADS_DIR
from backup_service import configure_backup_job
from routers import (
    auth,
    projects,
    checklist,
    storyboard,
    ideas,
    tasks,
    diary,
    dashboard,
    search,
    template,
    youtube,
    content_templates,
    inspirations,
    trends,
    recommendations,
)

Base.metadata.create_all(bind=engine)
run_schema_upgrades()

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_backup_job(scheduler)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="VlogPlanner API", lifespan=lifespan)

# In dev the Vite proxy avoids CORS entirely; in prod nginx proxies /api and /uploads.
# This is kept permissive as a fallback for direct-to-API access during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(checklist.router, prefix="/api", tags=["checklist"])
app.include_router(storyboard.router, prefix="/api", tags=["storyboard"])
app.include_router(template.router, prefix="/api", tags=["template"])
app.include_router(ideas.router, prefix="/api/ideas", tags=["ideas"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(diary.router, prefix="/api/diary", tags=["diary"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(youtube.router, prefix="/api/youtube", tags=["youtube"])
app.include_router(content_templates.router, prefix="/api/templates", tags=["templates"])
app.include_router(inspirations.router, prefix="/api/inspirations", tags=["inspirations"])
app.include_router(trends.router, prefix="/api/trends", tags=["trends"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serves the built frontend (frontend/dist, copied into ./static at image build
# time) so a single container/process handles both the API and the SPA. Only
# present in the combined Docker image; absent in local `uvicorn --reload` dev,
# where Vite serves the frontend separately on its own port.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(STATIC_DIR):

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            raise HTTPException(status_code=404)
        candidate = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
