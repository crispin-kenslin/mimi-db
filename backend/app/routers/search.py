from fastapi import APIRouter, HTTPException, Query

from ..services.data_catalog import build_genome_resources, find_gene_hits_in_gff

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/genes")
def gene_search(q: str = Query(..., min_length=2), crop: str | None = None, limit: int = Query(100, ge=1, le=500)):
    resources = build_genome_resources()
    if crop:
        resources = [r for r in resources if r.crop_slug == crop]
        if not resources:
            raise HTTPException(status_code=404, detail="Crop not found")

    results = []
    for resource in resources:
        if resource.gff_file is None:
            continue
        hits = find_gene_hits_in_gff(resource.gff_file, q, limit=limit)
        for hit in hits:
            results.append({"crop": resource.crop_slug, **hit})
            if len(results) >= limit:
                return {"query": q, "count": len(results), "results": results}

    return {"query": q, "count": len(results), "results": results}
