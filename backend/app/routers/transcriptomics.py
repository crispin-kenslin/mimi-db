from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/crops",
    tags=["transcriptomics"],
)

@router.get("/{crop_id}/transcriptomics", response_model=List[schemas.Transcriptomics])
def read_transcriptomics(crop_id: int, db: Session = Depends(get_db)):
    data = db.query(models.Transcriptomics).filter(models.Transcriptomics.crop_id == crop_id).all()
    if not data:
        raise HTTPException(status_code=404, detail="Transcriptomics data not found for this crop")
    return data
