from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/crops",
    tags=["metabolomics"],
)

@router.get("/{crop_id}/metabolomics", response_model=List[schemas.Metabolomics])
def read_metabolomics(crop_id: int, db: Session = Depends(get_db)):
    data = db.query(models.Metabolomics).filter(models.Metabolomics.crop_id == crop_id).all()
    if not data:
        raise HTTPException(status_code=404, detail="Metabolomics data not found for this crop")
    return data
