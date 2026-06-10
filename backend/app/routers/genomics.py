from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from .. import csv_data

router = APIRouter(
    prefix="/crops",
    tags=["genomics"],
)

@router.get("/{crop_id}/genomics")
def read_genomics(crop_id: int):
    data = csv_data.get_genomics(crop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Genomics data not found for this crop")
    return data

@router.get("/slug/{crop_slug}/genomes")
def read_genomes_files(crop_slug: str):
    return csv_data.get_genome_files(crop_slug)
