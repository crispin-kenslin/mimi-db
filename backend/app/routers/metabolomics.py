from fastapi import APIRouter, HTTPException

from .. import csv_data

router = APIRouter(
    prefix="/crops",
    tags=["metabolomics"],
)

@router.get("/{crop_id}/metabolomics")
def read_metabolomics(crop_id: int):
    data = csv_data.get_metabolomics(crop_id)
    if not data:
        raise HTTPException(status_code=404, detail="Metabolomics data not found for this crop")
    return data
