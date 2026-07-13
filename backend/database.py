import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))
os.makedirs(DATA_DIR, exist_ok=True)

UPLOADS_DIR = os.environ.get("UPLOADS_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
THUMBNAILS_DIR = os.path.join(UPLOADS_DIR, "thumbnails")
os.makedirs(THUMBNAILS_DIR, exist_ok=True)

BACKUPS_DIR = os.environ.get("BACKUPS_DIR", os.path.join(os.path.dirname(__file__), "backups"))
os.makedirs(BACKUPS_DIR, exist_ok=True)

DB_PATH = os.path.join(DATA_DIR, "vlogplanner.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


SCHEMA_UPGRADE_STATEMENTS = [
    "ALTER TABLE users ADD COLUMN youtube_access_token VARCHAR",
    "ALTER TABLE users ADD COLUMN youtube_refresh_token VARCHAR",
    "ALTER TABLE users ADD COLUMN youtube_token_expires_at DATETIME",
    "ALTER TABLE users ADD COLUMN youtube_channel_id VARCHAR",
    "ALTER TABLE users ADD COLUMN youtube_channel_title VARCHAR",
    "ALTER TABLE users ADD COLUMN llm_provider VARCHAR",
    "ALTER TABLE users ADD COLUMN llm_api_key_encrypted VARCHAR",
    "ALTER TABLE users ADD COLUMN llm_model VARCHAR",
    "ALTER TABLE users ADD COLUMN llm_custom_endpoint VARCHAR",
    "ALTER TABLE projects ADD COLUMN youtube_video_id VARCHAR",
    "ALTER TABLE projects ADD COLUMN youtube_video_title VARCHAR",
    "ALTER TABLE idea_cards ADD COLUMN description TEXT",
    "ALTER TABLE idea_cards ADD COLUMN theme VARCHAR",
    "ALTER TABLE idea_cards ADD COLUMN target_age VARCHAR",
    "ALTER TABLE idea_cards ADD COLUMN estimated_date DATE",
    "ALTER TABLE idea_cards ADD COLUMN template_key VARCHAR",
    "ALTER TABLE idea_cards ADD COLUMN ai_generations TEXT",
]


def run_schema_upgrades():
    """New columns on pre-existing tables aren't added by create_all(); add them here."""
    with engine.connect() as conn:
        for statement in SCHEMA_UPGRADE_STATEMENTS:
            try:
                conn.execute(text(statement))
                conn.commit()
            except Exception:
                conn.rollback()
