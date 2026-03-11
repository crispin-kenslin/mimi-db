from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/crops",
    tags=["genomics"],
)

@router.get("/{crop_id}/genomics", response_model=List[schemas.Genomics])
def read_genomics(crop_id: int, db: Session = Depends(get_db)):
    data = db.query(models.Genomics).filter(models.Genomics.crop_id == crop_id).all()
    if not data:
        raise HTTPException(status_code=404, detail="Genomics data not found for this crop")
    return data
