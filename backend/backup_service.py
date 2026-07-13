import logging
import os
import sqlite3
import tempfile
import zipfile
from datetime import datetime

from database import BACKUPS_DIR, DB_PATH, UPLOADS_DIR

logger = logging.getLogger("vlogplanner.backup")

RETENTION_COUNT = 12


def _snapshot_db(dest_path: str) -> None:
    """Copy the live SQLite file via the backup API so a concurrent writer can't corrupt the copy."""
    source = sqlite3.connect(DB_PATH)
    dest = sqlite3.connect(dest_path)
    try:
        source.backup(dest)
    finally:
        dest.close()
        source.close()


def create_backup() -> str:
    timestamp = datetime.utcnow().strftime("%Y-%m")
    zip_path = os.path.join(BACKUPS_DIR, f"vlogplanner-backup-{timestamp}.zip")

    with tempfile.TemporaryDirectory() as tmp_dir:
        db_snapshot_path = os.path.join(tmp_dir, "vlogplanner.db")
        _snapshot_db(db_snapshot_path)

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.write(db_snapshot_path, arcname="vlogplanner.db")
            for root, _dirs, files in os.walk(UPLOADS_DIR):
                for filename in files:
                    full_path = os.path.join(root, filename)
                    arcname = os.path.join("uploads", os.path.relpath(full_path, UPLOADS_DIR))
                    zf.write(full_path, arcname=arcname)

    logger.info("Backup created: %s", zip_path)
    apply_retention()
    return zip_path


def apply_retention(keep: int = RETENTION_COUNT) -> None:
    backups = sorted(
        (f for f in os.listdir(BACKUPS_DIR) if f.startswith("vlogplanner-backup-") and f.endswith(".zip")),
    )
    extra = backups[:-keep] if keep > 0 else backups
    for filename in extra:
        path = os.path.join(BACKUPS_DIR, filename)
        os.remove(path)
        logger.info("Old backup removed: %s", path)


def configure_backup_job(scheduler) -> None:
    scheduler.add_job(create_backup, "cron", day=1, hour=3, id="monthly_backup", replace_existing=True)
