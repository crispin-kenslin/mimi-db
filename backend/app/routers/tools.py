from __future__ import annotations

from pathlib import Path
from pydantic import BaseModel, Field
import gzip
import shutil
import subprocess
from functools import lru_cache

from fastapi import APIRouter, HTTPException, Request

from ..services.data_catalog import DATA_DIR, build_genome_resources, preferred_fasta, preferred_gff, to_data_url

router = APIRouter(prefix="/tools", tags=["tools"])

BLAST_CACHE_DIR = Path(__file__).resolve().parents[3] / ".blast_cache"
BLAST_CACHE_DIR.mkdir(parents=True, exist_ok=True)
JBROWSE_CACHE_DIR = DATA_DIR / ".jbrowse-cache"
JBROWSE_CACHE_DIR.mkdir(parents=True, exist_ok=True)
PROJECT_BLAST_BIN = Path(__file__).resolve().parents[3] / "blast" / "bin"
LOCAL_BLAST_BIN = Path(__file__).resolve().parents[3] / "tools" / "blast" / "ncbi-blast-2.17.0+" / "bin"


class BlastRequest(BaseModel):
    sequence: str = Field(..., min_length=10)
    max_target_seqs: int = Field(default=20, ge=1, le=100)
    evalue: float = Field(default=1e-5, gt=0)
    crops: list[str] | None = None
    crop: str | None = None
    task: str | None = None


def _ensure_blast_installed() -> None:
    missing = [exe for exe in ["makeblastdb", "blastn"] if _blast_executable(exe) is None]
    if missing:
        missing_text = ", ".join(missing)
        raise HTTPException(
            status_code=503,
            detail=(
                f"BLAST+ binaries are not available ({missing_text}). Install NCBI BLAST+ and add it to PATH."
            ),
        )


def _blast_executable(name: str) -> str | None:
    found = shutil.which(name)
    if found:
        return found

    exe_name = f"{name}.exe"
    project_candidate = PROJECT_BLAST_BIN / exe_name
    if project_candidate.exists():
        return str(project_candidate)

    local_candidate = LOCAL_BLAST_BIN / exe_name
    if local_candidate.exists():
        return str(local_candidate)

    return None


def _resolve_blast_task(query_seq: str, requested_task: str | None) -> str:
    if requested_task:
        allowed = {"blastn", "megablast", "dc-megablast", "blastn-short"}
        if requested_task not in allowed:
            raise HTTPException(status_code=400, detail=f"Invalid BLAST task: {requested_task}")
        return requested_task

    if len(query_seq) < 50:
        return "blastn-short"
    return "blastn"


def _normalize_sequence(seq: str) -> str:
    lines = [line.strip() for line in seq.splitlines() if line.strip()]
    if not lines:
        raise HTTPException(status_code=400, detail="Sequence is empty")

    if lines[0].startswith(">"):
        seq_text = "".join(lines[1:])
    else:
        seq_text = "".join(lines)

    seq_text = seq_text.upper().replace(" ", "")
    if not seq_text:
        raise HTTPException(status_code=400, detail="Sequence is empty")

    allowed = set("ACGTRYSWKMBDHVN")
    invalid = sorted(set(ch for ch in seq_text if ch not in allowed))
    if invalid:
        raise HTTPException(status_code=400, detail=f"Sequence contains invalid characters: {''.join(invalid)}")

    return seq_text


def _materialize_fasta(path: Path) -> Path:
    if path.suffix.lower() != ".gz":
        return path

    out_path = BLAST_CACHE_DIR / f"{path.stem}"
    src_mtime = path.stat().st_mtime_ns

    if out_path.exists() and out_path.stat().st_mtime_ns >= src_mtime:
        return out_path

    with gzip.open(path, "rb") as src, out_path.open("wb") as dst:
        shutil.copyfileobj(src, dst)
    return out_path


def _build_fai(fasta_path: Path, fai_path: Path) -> None:
    records = []
    with fasta_path.open("rb") as handle:
        seq_name = None
        seq_length = 0
        seq_offset = 0
        line_bases = 0
        line_width = 0

        while True:
            pos = handle.tell()
            line = handle.readline()
            if not line:
                break

            if line.startswith(b">"):
                if seq_name is not None:
                    records.append((seq_name, seq_length, seq_offset, line_bases, line_width))

                seq_name = line[1:].strip().split(b" ", 1)[0].decode("utf-8", errors="ignore")
                seq_length = 0
                seq_offset = handle.tell()
                line_bases = 0
                line_width = 0
                continue

            if seq_name is None:
                continue

            stripped = line.rstrip(b"\r\n")
            if not stripped:
                continue

            if line_bases == 0:
                line_bases = len(stripped)
                line_width = len(line)
            seq_length += len(stripped)

        if seq_name is not None:
            records.append((seq_name, seq_length, seq_offset, line_bases, line_width))

    with fai_path.open("w", encoding="utf-8") as out:
        for name, length, offset, bases, width in records:
            out.write(f"{name}\t{length}\t{offset}\t{bases}\t{width}\n")


def _prepare_jbrowse_fasta(crop_slug: str, source_fasta: Path) -> tuple[Path, Path]:
    crop_dir = JBROWSE_CACHE_DIR / crop_slug
    crop_dir.mkdir(parents=True, exist_ok=True)

    if source_fasta.suffix.lower() == ".gz":
        target_fasta = crop_dir / source_fasta.stem
        src_mtime = source_fasta.stat().st_mtime_ns
        if not target_fasta.exists() or target_fasta.stat().st_mtime_ns < src_mtime:
            with gzip.open(source_fasta, "rb") as src, target_fasta.open("wb") as dst:
                shutil.copyfileobj(src, dst)
    else:
        target_fasta = source_fasta

    fai_path = Path(str(target_fasta) + ".fai")
    if not fai_path.exists() or fai_path.stat().st_mtime_ns < target_fasta.stat().st_mtime_ns:
        _build_fai(target_fasta, fai_path)

    return target_fasta, fai_path


def _prepare_jbrowse_gff(crop_slug: str, source_gff: Path) -> Path:
    if source_gff.suffix.lower() != ".gz":
        return source_gff

    crop_dir = JBROWSE_CACHE_DIR / crop_slug
    crop_dir.mkdir(parents=True, exist_ok=True)

    target_gff = crop_dir / source_gff.stem
    src_mtime = source_gff.stat().st_mtime_ns
    if not target_gff.exists() or target_gff.stat().st_mtime_ns < src_mtime:
        with gzip.open(source_gff, "rb") as src, target_gff.open("wb") as dst:
            shutil.copyfileobj(src, dst)

    return target_gff


def _open_text(path: Path):
    if path.suffix.lower() == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", errors="ignore")
    return path.open("r", encoding="utf-8", errors="ignore")


def _parse_attrs(attributes: str) -> dict[str, str]:
    parsed: dict[str, str] = {}
    for segment in attributes.split(";"):
        if "=" in segment:
            k, v = segment.split("=", 1)
            parsed[k.strip()] = v.strip()
    return parsed


def _normalize_seqid(sseqid: str) -> list[str]:
    candidates = [sseqid]
    if "|" in sseqid:
        parts = sseqid.split("|")
        if len(parts) >= 2 and parts[1]:
            candidates.append(parts[1])
    return candidates


@lru_cache(maxsize=128)
def _gff_features_cached(gff_path: str, mtime_ns: int) -> dict[str, list[dict[str, object]]]:
    features: dict[str, list[dict[str, object]]] = {}
    path = Path(gff_path)
    with _open_text(path) as handle:
        for line in handle:
            if not line or line.startswith("#"):
                continue

            parts = line.rstrip("\n").split("\t")
            if len(parts) < 9:
                continue

            feature_type = parts[2].lower()
            if feature_type not in {"gene", "mrna", "transcript"}:
                continue

            seqid = parts[0]
            start = int(parts[3])
            end = int(parts[4])
            attrs = _parse_attrs(parts[8])

            gene_id = attrs.get("ID") or attrs.get("gene_id") or attrs.get("locus_tag")
            gene_name = attrs.get("Name") or attrs.get("gene") or attrs.get("gene_name")
            function = attrs.get("product") or attrs.get("description") or attrs.get("Note") or attrs.get("note")

            features.setdefault(seqid, []).append(
                {
                    "start": start,
                    "end": end,
                    "gene_id": gene_id,
                    "gene_name": gene_name,
                    "function": function,
                }
            )

    for key in features:
        features[key].sort(key=lambda row: int(row["start"]))

    return features


def _annotate_hit(crop_slug: str, sseqid: str, sstart: int, send: int) -> dict[str, str | None]:
    gff = preferred_gff(crop_slug)
    if gff is None:
        return {"gene_id": None, "gene_name": None, "function": None}

    stat = gff.stat()
    features_map = _gff_features_cached(str(gff.resolve()), stat.st_mtime_ns)

    hit_start = min(sstart, send)
    hit_end = max(sstart, send)

    for candidate_seqid in _normalize_seqid(sseqid):
        seq_features = features_map.get(candidate_seqid)
        if not seq_features:
            continue

        for feat in seq_features:
            feat_start = int(feat["start"])
            feat_end = int(feat["end"])
            if feat_end < hit_start or feat_start > hit_end:
                continue

            return {
                "gene_id": feat.get("gene_id") if isinstance(feat.get("gene_id"), str) else None,
                "gene_name": feat.get("gene_name") if isinstance(feat.get("gene_name"), str) else None,
                "function": feat.get("function") if isinstance(feat.get("function"), str) else None,
            }

        # If the hit is intergenic, attach the nearest annotated feature.
        nearest = None
        nearest_distance = None
        for feat in seq_features:
            feat_start = int(feat["start"])
            feat_end = int(feat["end"])
            if feat_end < hit_start:
                distance = hit_start - feat_end
            else:
                distance = feat_start - hit_end

            if nearest_distance is None or distance < nearest_distance:
                nearest_distance = distance
                nearest = feat

        if nearest is not None:
            nearest_note = f"Nearest feature (distance {nearest_distance} bp)"
            function_value = nearest.get("function") if isinstance(nearest.get("function"), str) else None
            return {
                "gene_id": nearest.get("gene_id") if isinstance(nearest.get("gene_id"), str) else None,
                "gene_name": nearest.get("gene_name") if isinstance(nearest.get("gene_name"), str) else None,
                "function": function_value or nearest_note,
            }

    return {"gene_id": None, "gene_name": None, "function": None}


def _absolute_data_url(request: Request, path: Path) -> str:
    base = str(request.base_url).rstrip("/")
    return f"{base}{to_data_url(path)}"


def _db_prefix(crop_slug: str, fasta_file: Path) -> Path:
    base_dir = BLAST_CACHE_DIR / crop_slug
    base_dir.mkdir(parents=True, exist_ok=True)
    safe_stem = fasta_file.name.replace(".", "_")
    return base_dir / safe_stem


def _ensure_blast_db(crop_slug: str, fasta_file: Path) -> Path:
    materialized = _materialize_fasta(fasta_file)
    db_prefix = _db_prefix(crop_slug, materialized)
    required = [db_prefix.with_suffix(s) for s in [".nhr", ".nin", ".nsq"]]

    src_mtime = materialized.stat().st_mtime_ns
    if all(f.exists() and f.stat().st_mtime_ns >= src_mtime for f in required):
        return db_prefix

    makeblastdb_exe = _blast_executable("makeblastdb")
    if makeblastdb_exe is None:
        raise HTTPException(status_code=503, detail="makeblastdb executable not found")

    cmd = [
        makeblastdb_exe,
        "-in",
        str(materialized),
        "-dbtype",
        "nucl",
        "-out",
        str(db_prefix),
        "-parse_seqids",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise HTTPException(status_code=500, detail=f"makeblastdb failed for {crop_slug}: {proc.stderr.strip()}")

    return db_prefix


@router.get("/genomes")
def list_genomes():
    genomes = []
    for resource in build_genome_resources():
        genomes.append(
            {
                "crop": resource.crop_slug,
                "has_fasta": resource.fasta_file is not None,
                "has_gff": resource.gff_file is not None,
                "fasta_url": to_data_url(resource.fasta_file) if resource.fasta_file else None,
                "gff_url": to_data_url(resource.gff_file) if resource.gff_file else None,
            }
        )
    return {"genomes": genomes}


@router.get("/jbrowse/cli/version")
def jbrowse_cli_version():
    exe = shutil.which("jbrowse")
    if not exe:
        return {"available": False, "version": None}

    proc = subprocess.run([exe, "--version"], capture_output=True, text=True)
    version_text = (proc.stdout or proc.stderr).strip()
    return {"available": proc.returncode == 0, "version": version_text}


@router.get("/jbrowse/{crop_slug}")
def jbrowse_config(crop_slug: str):
    fasta = preferred_fasta(crop_slug)
    gff = preferred_gff(crop_slug)

    if fasta is None:
        raise HTTPException(status_code=404, detail="No genome FASTA found for this crop")

    return {
        "crop": crop_slug,
        "assembly": {
            "name": crop_slug,
            "fasta_url": to_data_url(fasta),
        },
        "tracks": [
            {
                "name": "Gene annotations",
                "type": "gff3",
                "url": to_data_url(gff),
            }
        ]
        if gff
        else [],
    }


@router.get("/jbrowse/{crop_slug}/config.json")
def jbrowse_runtime_config(crop_slug: str, request: Request):
    fasta = preferred_fasta(crop_slug)
    if fasta is None:
        raise HTTPException(status_code=404, detail="No genome FASTA found for this crop")

    prepared_fasta, fai = _prepare_jbrowse_fasta(crop_slug, fasta)
    gzi = Path(str(prepared_fasta) + ".gzi")

    gff = preferred_gff(crop_slug)
    gff_tbi = Path(str(gff) + ".tbi") if gff else None

    assembly_adapter = {
        "type": "IndexedFastaAdapter",
        "fastaLocation": {"uri": _absolute_data_url(request, prepared_fasta)},
        "faiLocation": {"uri": _absolute_data_url(request, fai)},
    }
    if gzi.exists():
        assembly_adapter["gziLocation"] = {"uri": _absolute_data_url(request, gzi)}

    config = {
        "assemblies": [
            {
                "name": crop_slug,
                "sequence": {
                    "type": "ReferenceSequenceTrack",
                    "trackId": f"{crop_slug}-refseq",
                    "adapter": assembly_adapter,
                },
            }
        ],
        "defaultSession": {
            "name": f"{crop_slug} session",
            "view": {
                "id": "linearGenomeView",
                "type": "LinearGenomeView",
                "tracks": [
                    {
                        "id": f"{crop_slug}-refseq",
                        "type": "ReferenceSequenceTrack",
                        "configuration": f"{crop_slug}-refseq",
                        "displays": [{"type": "LinearReferenceSequenceDisplay", "configuration": f"{crop_slug}-refseq-LinearReferenceSequenceDisplay"}],
                    }
                ],
            },
        },
        "tracks": [],
    }

    if gff and gff_tbi and gff_tbi.exists():
        adapter = {
            "type": "Gff3TabixAdapter",
            "gffGzLocation": {"uri": _absolute_data_url(request, gff)},
            "index": {"location": {"uri": _absolute_data_url(request, gff_tbi)}, "indexType": "TBI"},
        }
    elif gff:
        prepared_gff = _prepare_jbrowse_gff(crop_slug, gff)
        adapter = {
            "type": "Gff3Adapter",
            "gffLocation": {"uri": _absolute_data_url(request, prepared_gff)},
        }
    else:
        adapter = None

    if adapter:
        config["tracks"].append(
            {
                "type": "FeatureTrack",
                "trackId": f"{crop_slug}-genes",
                "name": "Gene annotations",
                "assemblyNames": [crop_slug],
                "adapter": adapter,
            }
        )

    return config


@router.post("/blast")
def blast_against_all_crops(payload: BlastRequest):
    _ensure_blast_installed()
    blastn_exe = _blast_executable("blastn")
    if blastn_exe is None:
        raise HTTPException(status_code=503, detail="blastn executable not found")

    query_seq = _normalize_sequence(payload.sequence)
    blast_task = _resolve_blast_task(query_seq, payload.task)

    resources = [r for r in build_genome_resources() if r.fasta_file is not None]

    selected_crops: set[str] = set()
    if payload.crops:
        selected_crops = {crop.strip().lower() for crop in payload.crops if crop and crop.strip()}
    elif payload.crop and payload.crop.strip().lower() != "all":
        selected_crops = {payload.crop.strip().lower()}

    if selected_crops:
        resources = [r for r in resources if r.crop_slug.lower() in selected_crops]

    if not resources:
        raise HTTPException(status_code=404, detail="No matching crop FASTA files found in data folder")

    results = []
    query_fasta = BLAST_CACHE_DIR / "query.tmp.fa"
    query_fasta.write_text(f">query\n{query_seq}\n", encoding="utf-8")

    outfmt = "6 qseqid sseqid pident length mismatch gapopen qstart qend sstart send evalue bitscore"

    for resource in resources:
        db_prefix = _ensure_blast_db(resource.crop_slug, resource.fasta_file)
        cmd = [
            blastn_exe,
            "-query",
            str(query_fasta),
            "-db",
            str(db_prefix),
            "-task",
            blast_task,
            "-outfmt",
            outfmt,
            "-max_target_seqs",
            str(payload.max_target_seqs),
            "-evalue",
            str(payload.evalue),
        ]
        if blast_task == "blastn-short":
            cmd.extend(["-dust", "no"])
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise HTTPException(status_code=500, detail=f"blastn failed for {resource.crop_slug}: {proc.stderr.strip()}")

        for line in proc.stdout.splitlines():
            cols = line.split("\t")
            if len(cols) != 12:
                continue
            annotation = _annotate_hit(resource.crop_slug, cols[1], int(cols[8]), int(cols[9]))
            results.append(
                {
                    "crop": resource.crop_slug,
                    "qseqid": cols[0],
                    "sseqid": cols[1],
                    "pident": float(cols[2]),
                    "length": int(cols[3]),
                    "mismatch": int(cols[4]),
                    "gapopen": int(cols[5]),
                    "qstart": int(cols[6]),
                    "qend": int(cols[7]),
                    "sstart": int(cols[8]),
                    "send": int(cols[9]),
                    "evalue": float(cols[10]),
                    "bitscore": float(cols[11]),
                    **annotation,
                }
            )

    results.sort(key=lambda row: (-row["bitscore"], row["evalue"], -row["pident"]))
    return {
        "query_length": len(query_seq),
        "task": blast_task,
        "scope": sorted(selected_crops) if selected_crops else "all",
        "total_hits": len(results),
        "results": results,
    }
