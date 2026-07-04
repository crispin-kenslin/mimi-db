from fastapi import APIRouter, Query
import csv
from pathlib import Path

router = APIRouter(prefix="/search", tags=["search"])

DATA_DIR = Path(__file__).resolve().parents[3] / "data"


def _get_all_stress_csvs():
    """Yield (crop_slug, stress_type, csv_path) for every transcriptomics CSV."""
    if not DATA_DIR.exists():
        return
    for crop_dir in sorted(DATA_DIR.iterdir()):
        if not crop_dir.is_dir() or crop_dir.name.startswith("."):
            continue
        trans_dir = crop_dir / "transcriptomics"
        if not trans_dir.exists():
            continue
        for csv_file in sorted(trans_dir.glob("*.csv")):
            parts = csv_file.stem.split("-")
            stress_type = parts[-1] if len(parts) > 1 else csv_file.stem
            yield crop_dir.name, stress_type, csv_file


@router.get("/genes")
def gene_search(
    q: str = Query(..., min_length=2),
    limit: int = Query(500, ge=1, le=5000),
):
    """
    Search all transcriptomics stress CSVs for gene ID or protein name.
    Returns: crop, stress, gene_id, log2fc, pvalue, protein.
    """
    q_lower = q.strip().lower()
    results = []

    for crop_slug, stress_type, csv_path in _get_all_stress_csvs():
        try:
            with csv_path.open("r", encoding="utf-8-sig", errors="ignore") as f:
                reader = csv.DictReader(f)
                # Normalise header keys (strip BOM, spaces, lowercase)
                for raw_row in reader:
                    row = {k.strip().lower(): v.strip() for k, v in raw_row.items() if k}

                    gene_id = row.get("gene", "") or row.get("gene_id", "")
                    product = (
                        row.get("product", "")
                        or row.get("annotation", "")
                        or row.get("description", "")
                    )

                    # Match against gene id or protein/product name
                    if q_lower not in gene_id.lower() and q_lower not in product.lower():
                        continue

                    try:
                        log2fc = float(row.get("log2foldchange", "nan"))
                    except ValueError:
                        log2fc = None

                    try:
                        pvalue = float(row.get("pvalue", "nan"))
                    except ValueError:
                        pvalue = None

                    results.append({
                        "crop": crop_slug,
                        "stress": stress_type,
                        "gene_id": gene_id,
                        "log2fc": log2fc,
                        "pvalue": pvalue,
                        "protein": product,
                    })

                    if len(results) >= limit:
                        return {"query": q, "count": len(results), "results": results}
        except Exception as e:
            print(f"Error reading {csv_path}: {e}")
            continue

    return {"query": q, "count": len(results), "results": results}
