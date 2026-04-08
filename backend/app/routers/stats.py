from fastapi import APIRouter

from ..services.data_catalog import (
    METABOLOMICS_DIR,
    TABULAR_EXTENSIONS,
    TRANSCRIPTOMICS_DIR,
    build_genome_resources,
    count_gff_genes,
    count_tabular_rows,
    crop_dirs,
    find_files,
)

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/overview")
def overview_stats():
    crops = crop_dirs()
    genomes = build_genome_resources()

    reference_genomes = sum(1 for g in genomes if g.fasta_file is not None)

    transcriptome_studies = 0
    for crop in crops:
        transcriptome_studies += len(find_files(crop.name, TRANSCRIPTOMICS_DIR, TABULAR_EXTENSIONS))

    metabolites_catalogued = 0
    for crop in crops:
        for file in find_files(crop.name, METABOLOMICS_DIR, TABULAR_EXTENSIONS):
            metabolites_catalogued += count_tabular_rows(file)

    predicted_genes = 0
    for resource in genomes:
        if resource.gff_file is not None:
            predicted_genes += count_gff_genes(resource.gff_file)

    return {
        "millet_species": len(crops),
        "reference_genomes": reference_genomes,
        "transcriptome_studies": transcriptome_studies,
        "metabolites_catalogued": metabolites_catalogued,
        "predicted_genes": predicted_genes,
    }
