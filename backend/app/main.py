from __future__ import annotations

import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models
from .database import SessionLocal, engine
from .routers import crops, files, genomics, metabolomics, transcriptomics
from .routers import search, stats, tools

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Minor Millets Database API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crops.router)
app.include_router(genomics.router)
app.include_router(transcriptomics.router)
app.include_router(metabolomics.router)
app.include_router(files.router)
app.include_router(stats.router)
app.include_router(search.router)
app.include_router(tools.router)

# Mount data folder for static file serving
DATA_PATH = Path(__file__).resolve().parents[2] / "data"
if DATA_PATH.exists():
    app.mount("/data", StaticFiles(directory=str(DATA_PATH), html=True), name="data")

JBROWSE_WEB_PATH = Path(__file__).resolve().parents[2] / "jbroswe"
if JBROWSE_WEB_PATH.exists():
    app.mount("/jbrowse", StaticFiles(directory=str(JBROWSE_WEB_PATH), html=True), name="jbrowse")


@app.get("/health")
def health_check():
    return {"status": "ok"}


def seed_crops_from_config() -> None:
    """Seed only core crop metadata from a local config file.

    This avoids shipping any dummy omics records and keeps crop metadata editable
    in a simple script-level JSON file.
    """
    config_path = Path(__file__).resolve().parent / "crops_config.json"
    if not config_path.exists():
        return

    db = SessionLocal()
    try:
        existing = db.query(models.Crop).count()
        if existing > 0:
            return

        payload = json.loads(config_path.read_text(encoding="utf-8"))
        crop_rows = payload.get("crops", [])
        for row in crop_rows:
            db.add(models.Crop(**row))

        db.commit()
        print(f"Seeded {len(crop_rows)} crops from crops_config.json")
    except Exception as exc:
        db.rollback()
        print(f"Crop seeding error: {exc}")
    finally:
        db.close()


seed_crops_from_config()
