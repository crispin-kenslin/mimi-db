from fastapi import APIRouter
from typing import List, Dict, Any

from .. import csv_data

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/overview")
def overview_stats():
    return csv_data.get_stats_overview()

@router.get("/charts")
def get_charts():
    try:
        return csv_data.get_chart_data()
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

@router.get("/stresses")
def get_all_stresses():
    """Returns a list of all unique stress conditions from data folders."""
    stresses = []
    seen = set()
    
    crops = csv_data.get_crops()
    for crop in crops:
        slug = crop["slug"]
        trans_dir = csv_data.DATA_DIR / slug / "transcriptomics"
        if trans_dir.exists() and trans_dir.is_dir():
            for f in trans_dir.iterdir():
                if f.is_file() and f.suffix.lower() == ".csv" and not f.name.startswith("."):
                    parts = f.stem.split("-")
                    if len(parts) > 1:
                        condition = parts[-1].replace("-", " ").title()
                        cond_lower = condition.lower()
                        if f"{slug}-{cond_lower}" not in seen:
                            seen.add(f"{slug}-{cond_lower}")
                            stresses.append({
                                "condition": condition,
                                "crop": crop["name"],
                                "tissue": "Mixed",
                                "platform": "Various"
                            })
    return stresses
