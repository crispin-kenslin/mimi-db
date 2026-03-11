from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship

from .database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    scientific_name = Column(String, nullable=False)
    family = Column(String)
    description = Column(Text)
    reference_link = Column(String)
    chromosome_number = Column(Integer)
    ploidy_level = Column(String)
    genome_size_mb = Column(Float)
    growth_habit = Column(String)
    origin = Column(String)
    common_names = Column(Text)
    nutritional_highlights = Column(Text)
    drought_tolerance = Column(String)
    maturation_days = Column(String)
    protein_content_percent = Column(Float)
    fiber_content_percent = Column(Float)
    calcium_mg_per_100g = Column(Float)
    iron_mg_per_100g = Column(Float)
    image_url = Column(String)

    genomics = relationship("Genomics", back_populates="crop", cascade="all, delete-orphan")
    transcriptomics = relationship("Transcriptomics", back_populates="crop", cascade="all, delete-orphan")
    metabolomics = relationship("Metabolomics", back_populates="crop", cascade="all, delete-orphan")
    analyses = relationship("Analyses", back_populates="crop", cascade="all, delete-orphan")


class Genomics(Base):
    __tablename__ = "genomics"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    genome_version = Column(String)
    assembly_link = Column(String)
    annotation_link = Column(String)
    fasta_link = Column(String)
    gff_link = Column(String)
    transcriptome_summary = Column(JSON)
    stats = Column(JSON)
    gene_families = Column(JSON)
    repeat_content = Column(JSON)
    ortholog_stats = Column(JSON)

    crop = relationship("Crop", back_populates="genomics")


class Transcriptomics(Base):
    __tablename__ = "transcriptomics"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    experiment_id = Column(String, index=True)
    data_link = Column(String)
    tissue = Column(String)
    condition = Column(String)
    platform = Column(String)
    replicate_count = Column(Integer)
    stats = Column(JSON)
    top_genes = Column(JSON)

    crop = relationship("Crop", back_populates="transcriptomics")


class Metabolomics(Base):
    __tablename__ = "metabolomics"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    experiment_id = Column(String, index=True)
    data_link = Column(String)
    tissue = Column(String)
    metabolites_count = Column(Integer)
    platform = Column(String)
    stats = Column(JSON)
    top_metabolites = Column(JSON)

    crop = relationship("Crop", back_populates="metabolomics")


class Analyses(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    analysis_type = Column(String)
    result_summary = Column(Text)
    result_link = Column(String)
    method = Column(String)
    date_performed = Column(String)

    crop = relationship("Crop", back_populates="analyses")
