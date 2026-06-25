from fastapi import APIRouter, HTTPException

from .. import csv_data

router = APIRouter(
    prefix="/metabolites",
    tags=["metabolomics"],
)

@router.get("/{crop_slug}")
def read_metabolites(crop_slug: str):
    data = csv_data.get_metabolites_data(crop_slug)
    if not data:
        raise HTTPException(status_code=404, detail="Metabolomics data not found for this crop")
    return data
