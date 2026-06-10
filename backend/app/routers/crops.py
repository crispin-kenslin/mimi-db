from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from .. import csv_data

router = APIRouter(
    prefix="/crops",
    tags=["crops"],
)

@router.get("/")
def read_crops():
    crops = csv_data.get_crops()
    # Filter out Kodo and Pearl millet if required, or serve all. The front end will filter out Pearl.
    return crops

@router.get("/{crop_id}")
def read_crop(crop_id: int):
    crop = csv_data.get_crop_by_id(crop_id)
    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found")
    return csv_data.get_crop_detail(crop)


@router.get("/slug/{crop_slug}")
def read_crop_by_slug(crop_slug: str):
    crop = csv_data.get_crop_by_slug(crop_slug)
    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found")
    return csv_data.get_crop_detail(crop)

@router.get("/{crop_id}/analyses")
def read_analyses(crop_id: int):
    data = csv_data.get_analyses(crop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Analyses data not found for this crop")
    return data
