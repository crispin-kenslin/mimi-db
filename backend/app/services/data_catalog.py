from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict, Iterable, List, Optional
import gzip

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
GENOMICS_DIR = "genomics"
TRANSCRIPTOMICS_DIR = "transcriptomics"
METABOLOMICS_DIR = "metabolomics"
OTHER_DIR = "other"

FASTA_EXTENSIONS = {".fa", ".fasta", ".fna", ".fas"}
GFF_EXTENSIONS = {".gff", ".gff3"}
TABULAR_EXTENSIONS = {".csv", ".tsv", ".txt", ".xls", ".xlsx"}


@dataclass(frozen=True)
class GenomeResources:
    crop_slug: str
    fasta_file: Optional[Path]
    gff_file: Optional[Path]



def crop_dirs() -> List[Path]:
    if not DATA_DIR.exists() or not DATA_DIR.is_dir():
        return []
    return sorted([p for p in DATA_DIR.iterdir() if p.is_dir() and not p.name.startswith(".")], key=lambda p: p.name)



def to_data_url(path: Path) -> str:
    rel = path.resolve().relative_to(DATA_DIR.resolve()).as_posix()
    return f"/data/{rel}"



def _has_suffix(path: Path, allowed: Iterable[str]) -> bool:
    suffixes = [s.lower() for s in path.suffixes]
    return any(s in allowed for s in suffixes)



def _iter_files(base: Path) -> Iterable[Path]:
    if not base.exists() or not base.is_dir():
        return []
    return (f for f in base.rglob("*") if f.is_file() and not f.name.startswith("."))



def find_files(crop_slug: str, data_type: str, extensions: Iterable[str]) -> List[Path]:
    base = DATA_DIR / crop_slug / data_type
    files = [f for f in _iter_files(base) if _has_suffix(f, extensions)]
    return sorted(files, key=lambda p: p.name.lower())



def preferred_fasta(crop_slug: str) -> Optional[Path]:
    fasta_files = find_files(crop_slug, GENOMICS_DIR, FASTA_EXTENSIONS)
    if not fasta_files:
        return None
    # Prefer files with names that look like genome assemblies.
    ranked = sorted(
        fasta_files,
        key=lambda p: (
            0 if "genome" in p.name.lower() else 1,
            0 if "assembly" in p.name.lower() else 1,
            p.name.lower(),
        ),
    )
    return ranked[0]



def preferred_gff(crop_slug: str) -> Optional[Path]:
    gff_files = find_files(crop_slug, GENOMICS_DIR, GFF_EXTENSIONS)
    if not gff_files:
        return None
    return sorted(gff_files, key=lambda p: p.name.lower())[0]



def build_genome_resources() -> List[GenomeResources]:
    resources: List[GenomeResources] = []
    for crop in crop_dirs():
        resources.append(
            GenomeResources(
                crop_slug=crop.name,
                fasta_file=preferred_fasta(crop.name),
                gff_file=preferred_gff(crop.name),
            )
        )
    return resources


@lru_cache(maxsize=128)
def _count_gff_genes_cached(path_str: str, mtime_ns: int) -> int:
    path = Path(path_str)
    count = 0
    with _open_text(path) as handle:
        for line in handle:
            if not line or line.startswith("#"):
                continue
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 3 and parts[2].lower() == "gene":
                count += 1
    return count


@lru_cache(maxsize=256)
def _count_tabular_rows_cached(path_str: str, mtime_ns: int) -> int:
    path = Path(path_str)
    rows = 0
    with _open_text(path) as handle:
        for _ in handle:
            rows += 1
    return max(0, rows - 1)



def count_gff_genes(path: Path) -> int:
    stat = path.stat()
    return _count_gff_genes_cached(str(path.resolve()), stat.st_mtime_ns)



def count_tabular_rows(path: Path) -> int:
    stat = path.stat()
    return _count_tabular_rows_cached(str(path.resolve()), stat.st_mtime_ns)



def _open_text(path: Path):
    if path.suffix.lower() == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", errors="ignore")
    return path.open("r", encoding="utf-8", errors="ignore")



def find_gene_hits_in_gff(path: Path, query: str, limit: int = 200) -> List[Dict[str, str]]:
    query_lower = query.lower()
    hits: List[Dict[str, str]] = []

    with _open_text(path) as handle:
        for line in handle:
            if not line or line.startswith("#"):
                continue
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 9:
                continue
            if parts[2].lower() != "gene":
                continue

            attributes = parts[8]
            attr_map: Dict[str, str] = {}
            for segment in attributes.split(";"):
                if "=" in segment:
                    k, v = segment.split("=", 1)
                    attr_map[k.strip()] = v.strip()

            gene_id = attr_map.get("ID") or attr_map.get("gene_id") or ""
            gene_name = attr_map.get("Name") or attr_map.get("gene_name") or ""
            haystack = f"{gene_id} {gene_name} {attributes}".lower()
            if query_lower not in haystack:
                continue

            hits.append(
                {
                    "seqid": parts[0],
                    "start": parts[3],
                    "end": parts[4],
                    "strand": parts[6],
                    "gene_id": gene_id,
                    "gene_name": gene_name,
                }
            )
            if len(hits) >= limit:
                break

    return hits
