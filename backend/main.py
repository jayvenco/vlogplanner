from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine, run_schema_upgrades, UPLOADS_DIR
from backup_service import configure_backup_job
from routers import auth, projects, checklist, storyboard, ideas, tasks, diary, dashboard, search, template, youtube

Base.metadata.create_all(bind=engine)
run_schema_upgrades()

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    configure_backup_job(scheduler)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="VlogBuddy Kids API", lifespan=lifespan)

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


@app.get("/api/health")
def health():
    return {"status": "ok"}
