from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# ---------- Genomics ----------
class GenomicsBase(BaseModel):
    genome_version: Optional[str] = None
    assembly_link: Optional[str] = None
    annotation_link: Optional[str] = None
    fasta_link: Optional[str] = None
    gff_link: Optional[str] = None
    transcriptome_summary: Optional[Dict[str, Any]] = None
    stats: Optional[Dict[str, Any]] = None
    gene_families: Optional[Dict[str, Any]] = None
    repeat_content: Optional[Dict[str, Any]] = None
    ortholog_stats: Optional[Dict[str, Any]] = None

class Genomics(GenomicsBase):
    id: int
    crop_id: int
    class Config:
        orm_mode = True

# ---------- Transcriptomics ----------
class TranscriptomicsBase(BaseModel):
    experiment_id: str
    data_link: Optional[str] = None
    tissue: Optional[str] = None
    condition: Optional[str] = None
    platform: Optional[str] = None
    replicate_count: Optional[int] = None
    stats: Optional[Dict[str, Any]] = None
    top_genes: Optional[Any] = None

class Transcriptomics(TranscriptomicsBase):
    id: int
    crop_id: int
    class Config:
        orm_mode = True

# ---------- Metabolomics ----------
class MetabolomicsBase(BaseModel):
    experiment_id: str
    data_link: Optional[str] = None
    tissue: Optional[str] = None
    metabolites_count: Optional[int] = None
    platform: Optional[str] = None
    stats: Optional[Dict[str, Any]] = None
    top_metabolites: Optional[Any] = None

class Metabolomics(MetabolomicsBase):
    id: int
    crop_id: int
    class Config:
        orm_mode = True

# ---------- Analyses ----------
class AnalysesBase(BaseModel):
    analysis_type: Optional[str] = None
    result_summary: Optional[str] = None
    result_link: Optional[str] = None
    method: Optional[str] = None
    date_performed: Optional[str] = None

class Analyses(AnalysesBase):
    id: int
    crop_id: int
    class Config:
        orm_mode = True

# ---------- Crop ----------
class CropBase(BaseModel):
    name: str
    scientific_name: str
    family: Optional[str] = None
    description: Optional[str] = None
    reference_link: Optional[str] = None
    chromosome_number: Optional[int] = None
    ploidy_level: Optional[str] = None
    genome_size_mb: Optional[float] = None
    growth_habit: Optional[str] = None
    origin: Optional[str] = None
    common_names: Optional[str] = None
    nutritional_highlights: Optional[str] = None
    drought_tolerance: Optional[str] = None
    maturation_days: Optional[str] = None
    protein_content_percent: Optional[float] = None
    fiber_content_percent: Optional[float] = None
    calcium_mg_per_100g: Optional[float] = None
    iron_mg_per_100g: Optional[float] = None
    image_url: Optional[str] = None

class Crop(CropBase):
    id: int
    class Config:
        orm_mode = True

class CropDetail(Crop):
    genomics: List[Genomics] = []
    transcriptomics: List[Transcriptomics] = []
    metabolomics: List[Metabolomics] = []
    analyses: List[Analyses] = []
