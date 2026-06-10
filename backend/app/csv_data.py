"""CSV-based data layer for MIMI-DB.

All data is loaded from CSV files in data/csv/ at import time and cached in memory.
Edit the CSV files to update data — changes take effect on server restart.
"""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
CSV_DIR = DATA_DIR / "csv"

FASTA_EXTENSIONS = {".fa", ".fasta", ".fna", ".fas", ".gz"}
GFF_EXTENSIONS = {".gff", ".gff3", ".gz"}


def _slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    return re.sub(r"[\s_-]+", "-", value)


def _read_csv(filename: str) -> List[Dict[str, str]]:
    """Read a CSV file and return list of dicts."""
    path = CSV_DIR / filename
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        return list(reader)


def _safe_int(val) -> Optional[int]:
    if val is None:
        return None

    if isinstance(val, int):
        return val

    if isinstance(val, float):
        return int(val)

    if not str(val).strip():
        return None

    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


def _safe_float(val: str) -> Optional[float]:
    if not val or not val.strip():
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


def _safe_json(val: str) -> Any:
    if not val or not val.strip():
        return None
    try:
        return json.loads(val)
    except (json.JSONDecodeError, TypeError):
        return val


# ─── Crops ────────────────────────────────────────────────────────────────────

def get_crops() -> List[Dict[str, Any]]:
    """Return all crops as list of dicts."""
    rows = _read_csv("crops.csv")
    crops = []
    for row in rows:
        crops.append({
            "id": _safe_int(row.get("id")),
            "name": row.get("name", ""),
            "scientific_name": row.get("scientific_name", ""),
            "family": row.get("family", ""),
            "description": row.get("description", ""),
            "reference_link": row.get("reference_link", ""),
            "chromosome_number": _safe_int(row.get("chromosome_number")),
            "ploidy_level": row.get("ploidy_level", ""),
            "genome_size_mb": _safe_float(row.get("genome_size_mb")),
            "growth_habit": row.get("growth_habit", ""),
            "origin": row.get("origin", ""),
            "common_names": row.get("common_names", ""),
            "nutritional_highlights": row.get("nutritional_highlights", ""),
            "drought_tolerance": row.get("drought_tolerance", ""),
            "maturation_days": row.get("maturation_days", ""),
            "protein_content_percent": _safe_float(row.get("protein_content_percent")),
            "fiber_content_percent": _safe_float(row.get("fiber_content_percent")),
            "calcium_mg_per_100g": _safe_float(row.get("calcium_mg_per_100g")),
            "iron_mg_per_100g": _safe_float(row.get("iron_mg_per_100g")),
            "image_url": row.get("image_url", ""),
            "publisher": row.get("publisher", ""),
            "cultivar": row.get("cultivar", ""),
            "bioproject": row.get("bioproject", ""),
            "taxid": row.get("taxid", ""),
            "slug": _slugify(row.get("name", "")),
        })
    return crops


def get_crop_by_id(crop_id: int) -> Optional[Dict[str, Any]]:
    """Return a single crop by integer ID."""
    for crop in get_crops():
        if crop["id"] == crop_id:
            return crop
    return None


def get_crop_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """Return a single crop by URL slug."""
    slug_lower = slug.lower().strip()
    for crop in get_crops():
        if crop["slug"] == slug_lower:
            return crop
    return None


def get_crop_detail(crop: Dict[str, Any]) -> Dict[str, Any]:
    """Return crop with all related data attached."""
    crop_id = crop["id"]
    detail = dict(crop)
    detail["genomics"] = get_genomics(crop_id)
    detail["transcriptomics"] = get_transcriptomics_meta(crop_id)
    detail["metabolomics"] = get_metabolomics(crop_id)
    detail["analyses"] = get_analyses(crop_id)
    return detail


# ─── Genomics ─────────────────────────────────────────────────────────────────

def get_genomics(crop_id: int) -> List[Dict[str, Any]]:
    """Return genomics data for a crop."""
    rows = _read_csv("genomics.csv")
    results = []
    for row in rows:
        if _safe_int(row.get("crop_id")) != crop_id:
            continue
        results.append({
            "id": _safe_int(row.get("id")),
            "crop_id": crop_id,
            "genome_version": row.get("genome_version", ""),
            "assembly_link": row.get("assembly_link", ""),
            "annotation_link": row.get("annotation_link", ""),
            "fasta_link": row.get("fasta_link", ""),
            "gff_link": row.get("gff_link", ""),
            "transcriptome_summary": {
                "total_genes": _safe_int(row.get("total_genes")),
                "protein_coding": _safe_int(row.get("protein_coding")),
                "noncoding_rna": _safe_int(row.get("noncoding_rna")),
                "avg_gene_length_bp": _safe_float(row.get("avg_gene_length_bp")),
                "avg_exons_per_gene": _safe_float(row.get("avg_exons_per_gene")),
            },
            "stats": {
                "genome_size_mb": _safe_float(row.get("genome_size_mb")),
                "scaffolds": _safe_int(row.get("scaffolds")),
                "n50_mb": _safe_float(row.get("n50_mb")),
                "gc_content_pct": _safe_float(row.get("gc_content_pct")),
                "busco_complete_pct": _safe_float(row.get("busco_complete_pct")),
                "total_chromosomes": _safe_int(row.get("total_chromosomes")),
                "repeat_pct": _safe_float(row.get("repeat_pct")),
            },
            "gene_families": {
                "transcription_factors": _safe_int(row.get("transcription_factors")),
                "protein_kinases": _safe_int(row.get("protein_kinases")),
                "nbs_lrr_resistance": _safe_int(row.get("nbs_lrr_resistance")),
                "cytochrome_p450": _safe_int(row.get("cytochrome_p450")),
                "wrky_family": _safe_int(row.get("wrky_family")),
                "myb_family": _safe_int(row.get("myb_family")),
            },
            "repeat_content": {
                "ltr_retrotransposons_pct": _safe_float(row.get("ltr_retrotransposons_pct")),
                "dna_transposons_pct": _safe_float(row.get("dna_transposons_pct")),
                "simple_repeats_pct": _safe_float(row.get("simple_repeats_pct")),
                "lines_pct": _safe_float(row.get("lines_pct")),
                "unknown_pct": _safe_float(row.get("unknown_pct")),
            },
            "ortholog_stats": {
                "shared_with_rice": _safe_int(row.get("shared_with_rice")),
                "shared_with_sorghum": _safe_int(row.get("shared_with_sorghum")),
                "shared_with_maize": _safe_int(row.get("shared_with_maize")),
                "unique_genes": _safe_int(row.get("unique_genes")),
            },
        })
    return results


# ─── Transcriptomics ──────────────────────────────────────────────────────────

def get_transcriptomics_meta(crop_id: int) -> List[Dict[str, Any]]:
    """Return transcriptomics metadata for a crop. (Deprecated as we deleted the CSV, using data folders directly in frontend)"""
    return []


# ─── Metabolomics ─────────────────────────────────────────────────────────────

def get_metabolomics(crop_id: int) -> List[Dict[str, Any]]:
    """Return metabolomics data for a crop."""
    rows = _read_csv("metabolomics.csv")
    results = []
    for row in rows:
        if _safe_int(row.get("crop_id")) != crop_id:
            continue
        results.append({
            "id": _safe_int(row.get("id")),
            "crop_id": crop_id,
            "experiment_id": row.get("experiment_id", ""),
            "data_link": row.get("data_link", ""),
            "tissue": row.get("tissue", ""),
            "metabolites_count": _safe_int(row.get("metabolites_count")),
            "platform": row.get("platform", ""),
            "stats": {
                "flavonoids": _safe_int(row.get("flavonoids")),
                "phenolic_acids": _safe_int(row.get("phenolic_acids")),
                "amino_acids": _safe_int(row.get("amino_acids")),
                "organic_acids": _safe_int(row.get("organic_acids")),
                "lipids": _safe_int(row.get("lipids")),
                "alkaloids": _safe_int(row.get("alkaloids")),
                "terpenoids": _safe_int(row.get("terpenoids")),
                "vitamins": _safe_int(row.get("vitamins")),
            },
            "top_metabolites": _safe_json(row.get("top_metabolites", "")),
        })
    return results


# ─── Analyses ─────────────────────────────────────────────────────────────────

def get_analyses(crop_id: int) -> List[Dict[str, Any]]:
    """Return analyses for a crop."""
    rows = _read_csv("analyses.csv")
    results = []
    for row in rows:
        if _safe_int(row.get("crop_id")) != crop_id:
            continue
        results.append({
            "id": _safe_int(row.get("id")),
            "crop_id": crop_id,
            "analysis_type": row.get("analysis_type", ""),
            "result_summary": row.get("result_summary", ""),
            "result_link": row.get("result_link", ""),
            "method": row.get("method", ""),
            "date_performed": row.get("date_performed", ""),
        })
    return results


# ─── Genome Files (from data folder) ─────────────────────────────────────────

def get_genome_files(crop_slug: str) -> List[Dict[str, Any]]:
    """List all genome files in data/{crop_slug}/genomics/."""
    genomics_dir = DATA_DIR / crop_slug / "genomics"
    if not genomics_dir.exists() or not genomics_dir.is_dir():
        return []

    files = []
    for f in sorted(genomics_dir.rglob("*"), key=lambda p: p.name.lower()):
        if f.is_file() and not f.name.startswith("."):
            stat = f.stat()
            size_bytes = stat.st_size
            # human readable size
            size_str = _human_size(size_bytes)
            # determine type
            suffixes = [s.lower() for s in f.suffixes]
            file_type = "unknown"
            if any(s in {".fa", ".fasta", ".fna", ".fas"} for s in suffixes):
                file_type = "fasta"
            elif any(s in {".gff", ".gff3"} for s in suffixes):
                file_type = "gff"
            elif ".gz" in suffixes:
                # check the stem
                stem_suffixes = [s.lower() for s in Path(f.stem).suffixes]
                if any(s in {".fa", ".fasta", ".fna", ".fas"} for s in stem_suffixes):
                    file_type = "fasta"
                elif any(s in {".gff", ".gff3"} for s in stem_suffixes):
                    file_type = "gff"

            rel_path = f.relative_to(genomics_dir).as_posix()
            files.append({
                "name": f.name,
                "path": rel_path,
                "size_bytes": size_bytes,
                "size_str": size_str,
                "type": file_type,
                "download_url": f"/api/files/download/{crop_slug}/genomics/{rel_path}",
            })
    return files


def _human_size(size_bytes: int) -> str:
    for unit in ["B", "KB", "MB", "GB"]:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


# ─── Statistics ───────────────────────────────────────────────────────────────

def get_stats_overview() -> Dict[str, Any]:
    """Return database overview statistics for the homepage."""
    crops = get_crops()
    num_crops = len(crops)

    # Count unique stress conditions from actual CSV files in data/{crop}/transcriptomics/
    stress_conditions = set()
    for crop in crops:
        slug = crop["slug"]
        trans_dir = DATA_DIR / slug / "transcriptomics"
        if trans_dir.exists() and trans_dir.is_dir():
            for f in trans_dir.iterdir():
                if f.is_file() and f.suffix.lower() == ".csv" and not f.name.startswith("."):
                    # Extract stress name from filename (e.g., "finger-al.csv" -> "al")
                    parts = f.stem.split("-")
                    if len(parts) > 1:
                        stress_conditions.add(parts[-1])

    num_stresses = len(stress_conditions)

    # Count total genes from all transcriptomics CSV files
    total_genes = 0
    for crop in crops:
        slug = crop["slug"]
        trans_dir = DATA_DIR / slug / "transcriptomics"
        if trans_dir.exists() and trans_dir.is_dir():
            for f in trans_dir.iterdir():
                if f.is_file() and f.suffix.lower() == ".csv" and not f.name.startswith("."):
                    try:
                        with open(f, "r", encoding="utf-8", errors="ignore") as file:
                            lines = sum(1 for line in file if line.strip()) - 1
                            if lines > 0:
                                total_genes += lines
                    except Exception:
                        pass

    return {
        "num_crops": num_crops,
        "num_stresses": num_stresses,
        "genes_identified": total_genes,
    }


_chart_data_cache = None

def get_chart_data() -> Dict[str, Any]:
    global _chart_data_cache
    if _chart_data_cache is not None:
        return _chart_data_cache
        
    crops = get_crops()
    genes_per_crop = []
    upreg = 0
    downreg = 0

    for crop in crops:
        slug = crop["slug"]
        trans_dir = DATA_DIR / slug / "transcriptomics"

        crop_genes = set()

        if trans_dir.exists() and trans_dir.is_dir():

            for csv_file in trans_dir.glob("*.csv"):

                try:
                    with open(
                        csv_file,
                        "r",
                        encoding="utf-8",   
                        errors="ignore"
                    ) as f:

                        reader = csv.DictReader(f)

                        for row in reader:

                            gene = row.get("gene", "").strip()

                            if gene:
                                crop_genes.add(gene)

                            try:
                                log2fc = float(row["log2FoldChange"])

                                if log2fc > 1:
                                    upreg += 1
                                elif log2fc < -1:
                                    downreg += 1

                            except (ValueError, TypeError, KeyError):
                                continue

                except Exception as e:
                    print(f"Error reading {csv_file}: {e}")

        genes_per_crop.append({
            "name": crop["name"],
            "genes": len(crop_genes)
        })

    _chart_data_cache = {
        "genes_per_crop": genes_per_crop,
        "deg_distribution": [
            {
                "name": "Upregulated",
                "value": upreg,
                "fill": "#10b981"
            },
            {
                "name": "Downregulated",
                "value": downreg,
                "fill": "#ef4444"
            }
        ]
    }

    return _chart_data_cache