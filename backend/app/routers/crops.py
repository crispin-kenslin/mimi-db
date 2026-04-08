from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import re

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/crops",
    tags=["crops"],
)


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    return re.sub(r"[\s_-]+", "-", value)

@router.get("/", response_model=List[schemas.Crop])
def read_crops(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    crops = db.query(models.Crop).offset(skip).limit(limit).all()
    return crops

@router.get("/{crop_id}", response_model=schemas.CropDetail)
def read_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).filter(models.Crop.id == crop_id).first()
    if crop is None:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop


@router.get("/slug/{crop_slug}", response_model=schemas.CropDetail)
def read_crop_by_slug(crop_slug: str, db: Session = Depends(get_db)):
    crop = db.query(models.Crop).all()
    matched = next((c for c in crop if slugify(c.name) == crop_slug.lower().strip()), None)
    if matched is None:
        raise HTTPException(status_code=404, detail="Crop not found")
    return matched

@router.get("/{crop_id}/analyses", response_model=List[schemas.Analyses])
def read_analyses(crop_id: int, db: Session = Depends(get_db)):
    data = db.query(models.Analyses).filter(models.Analyses.crop_id == crop_id).all()
    if not data:
        raise HTTPException(status_code=404, detail="Analyses data not found for this crop")
    return data
