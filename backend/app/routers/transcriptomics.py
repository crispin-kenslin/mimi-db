from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os

from .. import models, schemas
from ..database import get_db

crops_router = APIRouter(
    prefix="/crops",
    tags=["transcriptomics"],
)

transcriptomics_router = APIRouter(
    prefix="/transcriptomics",
    tags=["transcriptomics"],
)

@crops_router.get("/{crop_id}/transcriptomics", response_model=List[schemas.Transcriptomics])
def read_transcriptomics(crop_id: int, db: Session = Depends(get_db)):
    data = db.query(models.Transcriptomics).filter(models.Transcriptomics.crop_id == crop_id).all()
    if not data:
        raise HTTPException(status_code=404, detail="Transcriptomics data not found for this crop")
    return data


@transcriptomics_router.get("/stresses/{crop_name}")
def get_available_stresses(crop_name: str):
    """List available stress types for a crop based on CSV files"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.normpath(os.path.join(current_dir, '..', '..', '..', 'data'))
    transcriptomics_dir = os.path.normpath(os.path.join(base_path, crop_name, 'transcriptomics'))

    if not os.path.exists(transcriptomics_dir):
        return []

    stresses = []
    try:
        for filename in os.listdir(transcriptomics_dir):
            if filename.endswith('.csv'):
                stress_type = filename.replace('.csv', '')
                parts = stress_type.split('-')
                if len(parts) > 1:
                    stress = parts[-1]
                    stresses.append({
                        'name': stress.capitalize(),
                        'type': stress,
                        'file': filename
                    })
    except Exception as e:
        print(f"Error reading directory {transcriptomics_dir}: {e}")
        return []

    return stresses


@transcriptomics_router.get("/csv/{crop_name}/{stress_type}")
def get_deg_csv(crop_name: str, stress_type: str):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    base_path = os.path.normpath(os.path.join(current_dir, '..', '..', '..', 'data'))

    possible_names = [
        f'{crop_name}-{stress_type}.csv',
        f'{crop_name.split("-")[0]}-{stress_type}.csv',
    ]

    csv_path = None
    for filename in possible_names:
        path = os.path.normpath(os.path.join(base_path, crop_name, 'transcriptomics', filename))
        if os.path.exists(path):
            csv_path = path
            break

    if csv_path is None:
        raise HTTPException(status_code=404, detail=f"CSV file not found for {crop_name} - {stress_type}")

    def generate():
        with open(csv_path, 'r', encoding='utf-8') as f:
            yield f.read()

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={"Content-Disposition": f"inline"}
    )

router = crops_router

