from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import crops, files, genomics, metabolomics, transcriptomics
from .routers import search, stats, tools

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
app.include_router(transcriptomics.transcriptomics_router)
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
