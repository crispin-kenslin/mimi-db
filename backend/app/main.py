from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine, SessionLocal
from .routers import crops, genomics, transcriptomics, metabolomics
import json

# Drop and recreate all tables to match updated models
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Minor Millets Database API")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crops.router)
app.include_router(genomics.router)
app.include_router(transcriptomics.router)
app.include_router(metabolomics.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}


def seed_data():
    """Seed the database with minor millet data on startup."""
    db = SessionLocal()
    try:
        existing = db.query(models.Crop).count()
        if existing > 0:
            return  # Already seeded

        # ---- CROPS ----
        crops_data = [
            models.Crop(
                name='Finger Millet',
                scientific_name='Eleusine coracana (L.) Gaertn.',
                family='Poaceae',
                description='Finger millet (Ragi) is one of the most nutritious cereals, widely cultivated in Africa and South Asia. It is the richest source of calcium among cereals and millets, making it invaluable for bone health. It is allotetraploid (AABB), domesticated from Eleusine africana, and shows remarkable climate resilience.',
                reference_link='https://www.ncbi.nlm.nih.gov/genome/?term=Eleusine+coracana',
                chromosome_number=36, ploidy_level='Allotetraploid (2n=4x=36)', genome_size_mb=1196.0,
                growth_habit='Annual tufted grass, 40–130 cm tall, tillering at base',
                origin='Ethiopian Highlands, East Africa',
                common_names='Ragi, Mandua, Nachni, Kelvaragu',
                nutritional_highlights='Highest calcium content (344 mg/100g) among cereals; rich in methionine, iron, and dietary fiber.',
                drought_tolerance='High', maturation_days='90–120',
                protein_content_percent=7.3, fiber_content_percent=3.6,
                calcium_mg_per_100g=344.0, iron_mg_per_100g=3.9
            ),
            models.Crop(
                name='Foxtail Millet',
                scientific_name='Setaria italica (L.) P. Beauv.',
                family='Poaceae',
                description='Foxtail millet is one of the oldest cultivated millets, with archaeological evidence dating to ~8700 years ago in northern China. It serves as a C4 model organism for genomics. Its compact diploid genome has been fully sequenced.',
                reference_link='https://www.ncbi.nlm.nih.gov/genome/?term=Setaria+italica',
                chromosome_number=18, ploidy_level='Diploid (2n=2x=18)', genome_size_mb=490.0,
                growth_habit='Annual erect grass, 60–150 cm tall with bristly panicles',
                origin='Northern China',
                common_names='Kangni, Thinai, Italian Millet, Kakum',
                nutritional_highlights='High protein (~12%), rich in dietary fiber, B-complex vitamins, and essential amino acids.',
                drought_tolerance='Moderate–High', maturation_days='75–90',
                protein_content_percent=12.3, fiber_content_percent=8.0,
                calcium_mg_per_100g=31.0, iron_mg_per_100g=2.8
            ),
            models.Crop(
                name='Proso Millet',
                scientific_name='Panicum miliaceum L.',
                family='Poaceae',
                description='Proso millet has the shortest growing period (60–90 days) of all millets, making it an excellent emergency or rotation crop. It is an allotetraploid cereal domesticated approximately 10,000 years ago in East Asia.',
                reference_link='https://www.ncbi.nlm.nih.gov/genome/?term=Panicum+miliaceum',
                chromosome_number=36, ploidy_level='Allotetraploid (2n=4x=36)', genome_size_mb=923.0,
                growth_habit='Annual erect grass, 30–100 cm tall with open or compact panicle',
                origin='Central and East Asia (China/Manchuria)',
                common_names='Cheena, Pani Varagu, Common Millet, Hog Millet',
                nutritional_highlights='High leucine content, gluten-free, low glycemic index, lecithin-rich for nervous system health.',
                drought_tolerance='Very High', maturation_days='60–90',
                protein_content_percent=12.5, fiber_content_percent=5.2,
                calcium_mg_per_100g=14.0, iron_mg_per_100g=0.8
            ),
            models.Crop(
                name='Pearl Millet',
                scientific_name='Pennisetum glaucum (L.) R. Br.',
                family='Poaceae',
                description='Pearl millet is the most widely grown type of millet globally, serving as a staple food for over 90 million people in Africa and the Indian subcontinent. It is a C4 cereal with excellent heat and drought tolerance.',
                reference_link='https://www.ncbi.nlm.nih.gov/genome/?term=Pennisetum+glaucum',
                chromosome_number=14, ploidy_level='Diploid (2n=2x=14)', genome_size_mb=1760.0,
                growth_habit='Annual robust grass, 1.5–3 m tall with cylindrical spike',
                origin='Sahel Zone, West Africa',
                common_names='Bajra, Kambu, Cumbu, Dukhn',
                nutritional_highlights='Highest energy content among millets; rich in iron (8 mg/100g), zinc, and folate.',
                drought_tolerance='Very High', maturation_days='75–110',
                protein_content_percent=11.6, fiber_content_percent=1.2,
                calcium_mg_per_100g=42.0, iron_mg_per_100g=8.0
            ),
            models.Crop(
                name='Little Millet',
                scientific_name='Panicum sumatrense Roth.',
                family='Poaceae',
                description='Little millet is a hardy, drought-tolerant small millet widely cultivated as a subsistence crop in the tribal and hilly areas of India. The grain is rich in dietary fiber and antioxidants.',
                reference_link='https://www.ncbi.nlm.nih.gov/genome/?term=Panicum+sumatrense',
                chromosome_number=36, ploidy_level='Tetraploid (2n=4x=36)', genome_size_mb=510.0,
                growth_habit='Annual erect grass, 30–90 cm tall, profusely tillered',
                origin='Indian subcontinent (Eastern Ghats)',
                common_names='Kutki, Samai, Savan, Gundli',
                nutritional_highlights='Very high dietary fiber (7.6%); rich in B vitamins and minerals; lowest glycemic index among millets.',
                drought_tolerance='High', maturation_days='60–90',
                protein_content_percent=7.7, fiber_content_percent=7.6,
                calcium_mg_per_100g=17.0, iron_mg_per_100g=9.3
            ),
            models.Crop(
                name='Barnyard Millet',
                scientific_name='Echinochloa esculenta (A.Braun) H.Scholz',
                family='Poaceae',
                description='Barnyard millet has the lowest carbohydrate content among all millets, making it a preferred grain for diabetic patients. It is among the fastest-growing millets (45–60 day crop cycle).',
                reference_link='https://www.ncbi.nlm.nih.gov/genome/?term=Echinochloa',
                chromosome_number=54, ploidy_level='Hexaploid (2n=6x=54)', genome_size_mb=1340.0,
                growth_habit='Annual coarse grass, 50–100 cm tall with nodding panicles',
                origin='Japan (E. esculenta), India (E. frumentacea)',
                common_names='Sanwa, Kuthiraivali, Jhangora, Oodalu',
                nutritional_highlights='Lowest carbohydrate (~55g/100g), highest crude fiber (~13.6%), excellent for diabetic diets.',
                drought_tolerance='High', maturation_days='45–75',
                protein_content_percent=6.2, fiber_content_percent=13.6,
                calcium_mg_per_100g=20.0, iron_mg_per_100g=5.0
            ),
        ]
        db.add_all(crops_data)
        db.flush()

        # ---- GENOMICS ----
        genomics_data = [
            models.Genomics(crop_id=1, genome_version='v1.0 (2017)',
                assembly_link='https://www.ncbi.nlm.nih.gov/assembly/GCA_021604985.1',
                annotation_link='https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Ecoracana',
                fasta_link='https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/021/604/985/',
                gff_link='https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Ecoracana',
                transcriptome_summary={"total_genes": 62348, "protein_coding": 57127, "noncoding_rna": 5221, "avg_gene_length_bp": 2847, "avg_exons_per_gene": 4.6},
                stats={"genome_size_mb": 1196, "scaffolds": 2078, "n50_mb": 23.7, "gc_content_pct": 44.7, "busco_complete_pct": 95.2, "total_chromosomes": 18, "repeat_pct": 52.1},
                gene_families={"transcription_factors": 2451, "protein_kinases": 1823, "nbs_lrr_resistance": 478, "cytochrome_p450": 312, "wrky_family": 98, "myb_family": 184},
                repeat_content={"ltr_retrotransposons_pct": 32.4, "dna_transposons_pct": 9.8, "simple_repeats_pct": 4.1, "lines_pct": 2.8, "unknown_pct": 3.0},
                ortholog_stats={"shared_with_rice": 18724, "shared_with_sorghum": 17892, "shared_with_maize": 16543, "unique_to_finger_millet": 4287},
            ),
            models.Genomics(crop_id=2, genome_version='v2.2 (2012+)',
                assembly_link='https://www.ncbi.nlm.nih.gov/assembly/GCF_000263155.2',
                annotation_link='https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Sitalica',
                fasta_link='https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/263/155/',
                gff_link='https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Sitalica',
                transcriptome_summary={"total_genes": 38801, "protein_coding": 35471, "noncoding_rna": 3330, "avg_gene_length_bp": 2519, "avg_exons_per_gene": 4.3},
                stats={"genome_size_mb": 490, "scaffolds": 336, "n50_mb": 47.3, "gc_content_pct": 46.3, "busco_complete_pct": 97.1, "total_chromosomes": 9, "repeat_pct": 46.0},
                gene_families={"transcription_factors": 1687, "protein_kinases": 1245, "nbs_lrr_resistance": 234, "cytochrome_p450": 268, "wrky_family": 74, "myb_family": 145},
                repeat_content={"ltr_retrotransposons_pct": 25.7, "dna_transposons_pct": 12.3, "simple_repeats_pct": 3.5, "lines_pct": 2.1, "unknown_pct": 2.4},
                ortholog_stats={"shared_with_rice": 21543, "shared_with_sorghum": 20187, "shared_with_maize": 18965, "unique_to_foxtail": 2134},
            ),
            models.Genomics(crop_id=3, genome_version='v1.0 (2019)',
                assembly_link='https://www.ncbi.nlm.nih.gov/assembly/GCA_003046395.2',
                annotation_link='https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Pmiliaceum',
                fasta_link='https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/003/046/395/',
                gff_link='https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Pmiliaceum',
                transcriptome_summary={"total_genes": 55930, "protein_coding": 52580, "noncoding_rna": 3350, "avg_gene_length_bp": 2631, "avg_exons_per_gene": 4.1},
                stats={"genome_size_mb": 923, "scaffolds": 1450, "n50_mb": 17.2, "gc_content_pct": 44.8, "busco_complete_pct": 93.8, "total_chromosomes": 18, "repeat_pct": 57.2},
                gene_families={"transcription_factors": 2178, "protein_kinases": 1567, "nbs_lrr_resistance": 398, "cytochrome_p450": 287, "wrky_family": 86, "myb_family": 162},
                repeat_content={"ltr_retrotransposons_pct": 35.1, "dna_transposons_pct": 11.4, "simple_repeats_pct": 4.7, "lines_pct": 3.2, "unknown_pct": 2.8},
                ortholog_stats={"shared_with_rice": 17856, "shared_with_sorghum": 16934, "shared_with_maize": 15821, "unique_to_proso": 3876},
            ),
            models.Genomics(crop_id=4, genome_version='v1.1 (2017)',
                assembly_link='https://www.ncbi.nlm.nih.gov/assembly/GCF_003113225.1',
                annotation_link='https://ceg.icrisat.org/ipmgsc/',
                fasta_link='https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/003/113/225/',
                gff_link='https://ceg.icrisat.org/ipmgsc/',
                transcriptome_summary={"total_genes": 38579, "protein_coding": 33712, "noncoding_rna": 4867, "avg_gene_length_bp": 3012, "avg_exons_per_gene": 4.8},
                stats={"genome_size_mb": 1760, "scaffolds": 2093, "n50_mb": 35.6, "gc_content_pct": 46.1, "busco_complete_pct": 96.5, "total_chromosomes": 7, "repeat_pct": 68.4},
                gene_families={"transcription_factors": 1598, "protein_kinases": 1134, "nbs_lrr_resistance": 312, "cytochrome_p450": 256, "wrky_family": 67, "myb_family": 127},
                repeat_content={"ltr_retrotransposons_pct": 42.3, "dna_transposons_pct": 14.7, "simple_repeats_pct": 5.1, "lines_pct": 3.8, "unknown_pct": 2.5},
                ortholog_stats={"shared_with_rice": 19234, "shared_with_sorghum": 22145, "shared_with_maize": 17623, "unique_to_pearl": 3512},
            ),
            models.Genomics(crop_id=5, genome_version='Draft v1.0',
                assembly_link='https://www.ncbi.nlm.nih.gov/genome/?term=Panicum+sumatrense',
                transcriptome_summary={"total_genes": 41200, "protein_coding": 37500, "noncoding_rna": 3700, "avg_gene_length_bp": 2467, "avg_exons_per_gene": 4.2},
                stats={"genome_size_mb": 510, "scaffolds": 3200, "n50_mb": 8.4, "gc_content_pct": 45.9, "busco_complete_pct": 88.6, "total_chromosomes": 18, "repeat_pct": 48.5},
                gene_families={"transcription_factors": 1732, "protein_kinases": 1298, "nbs_lrr_resistance": 267, "cytochrome_p450": 245, "wrky_family": 72, "myb_family": 138},
                repeat_content={"ltr_retrotransposons_pct": 28.2, "dna_transposons_pct": 10.6, "simple_repeats_pct": 4.3, "lines_pct": 2.9, "unknown_pct": 2.5},
                ortholog_stats={"shared_with_rice": 16879, "shared_with_sorghum": 15987, "shared_with_maize": 14789, "unique_to_little": 3654},
            ),
            models.Genomics(crop_id=6, genome_version='Draft v1.0',
                assembly_link='https://www.ncbi.nlm.nih.gov/genome/?term=Echinochloa',
                fasta_link='https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/011/397/445/',
                transcriptome_summary={"total_genes": 78543, "protein_coding": 71234, "noncoding_rna": 7309, "avg_gene_length_bp": 2389, "avg_exons_per_gene": 3.9},
                stats={"genome_size_mb": 1340, "scaffolds": 4500, "n50_mb": 5.2, "gc_content_pct": 44.3, "busco_complete_pct": 85.4, "total_chromosomes": 27, "repeat_pct": 61.7},
                gene_families={"transcription_factors": 3124, "protein_kinases": 2345, "nbs_lrr_resistance": 567, "cytochrome_p450": 398, "wrky_family": 134, "myb_family": 245},
                repeat_content={"ltr_retrotransposons_pct": 38.9, "dna_transposons_pct": 12.1, "simple_repeats_pct": 4.5, "lines_pct": 3.4, "unknown_pct": 2.8},
                ortholog_stats={"shared_with_rice": 22456, "shared_with_sorghum": 20123, "shared_with_maize": 19876, "unique_to_barnyard": 5678},
            ),
        ]
        db.add_all(genomics_data)
        db.flush()

        # ---- TRANSCRIPTOMICS ----
        trx_data = [
            models.Transcriptomics(crop_id=1, experiment_id='SRP065394', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP065394',
                tissue='Leaf', condition='Drought Stress', platform='Illumina HiSeq 2500', replicate_count=3,
                stats={"total_reads_million": 245.7, "mapped_pct": 89.2, "upregulated": 3241, "downregulated": 2876, "degs_total": 6117, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Ec_01g001230","name":"DREB2A","log2fc":4.82,"function":"Drought-responsive TF"},{"gene_id":"Ec_03g004560","name":"LEA3","log2fc":4.15,"function":"Late embryogenesis abundant protein"},{"gene_id":"Ec_05g007890","name":"P5CS","log2fc":3.67,"function":"Proline biosynthesis"}]),
            models.Transcriptomics(crop_id=1, experiment_id='SRP098745', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP098745',
                tissue='Root', condition='Salt Stress (200mM NaCl)', platform='Illumina NovaSeq 6000', replicate_count=3,
                stats={"total_reads_million": 312.4, "mapped_pct": 91.5, "upregulated": 2567, "downregulated": 3124, "degs_total": 5691, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Ec_02g002340","name":"SOS1","log2fc":3.91,"function":"Na+/H+ antiporter"},{"gene_id":"Ec_06g008910","name":"NHX1","log2fc":3.45,"function":"Vacuolar Na+ transporter"}]),
            models.Transcriptomics(crop_id=2, experiment_id='SRP112345', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP112345',
                tissue='Leaf', condition='Drought Stress', platform='Illumina HiSeq 4000', replicate_count=3,
                stats={"total_reads_million": 198.3, "mapped_pct": 92.8, "upregulated": 2890, "downregulated": 2456, "degs_total": 5346, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Si_01g001234","name":"NAC1","log2fc":5.12,"function":"Stress-responsive NAC TF"},{"gene_id":"Si_03g004567","name":"WRKY40","log2fc":4.23,"function":"WRKY transcription factor"}]),
            models.Transcriptomics(crop_id=2, experiment_id='SRP145678', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP145678',
                tissue='Seed', condition='Grain Filling Stage', platform='Illumina NovaSeq 6000', replicate_count=4,
                stats={"total_reads_million": 356.8, "mapped_pct": 94.1, "upregulated": 4123, "downregulated": 3567, "degs_total": 7690, "fdr_threshold": 0.01},
                top_genes=[{"gene_id":"Si_02g002345","name":"GW2","log2fc":4.56,"function":"Grain width/weight regulator"},{"gene_id":"Si_06g008912","name":"SSIIa","log2fc":3.89,"function":"Starch synthase IIa"}]),
            models.Transcriptomics(crop_id=3, experiment_id='SRP178901', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP178901',
                tissue='Leaf', condition='Heat Stress (42°C)', platform='Illumina HiSeq 4000', replicate_count=3,
                stats={"total_reads_million": 167.2, "mapped_pct": 87.5, "upregulated": 2134, "downregulated": 1987, "degs_total": 4121, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Pm_01g001234","name":"HSP70","log2fc":5.67,"function":"Heat shock protein 70"},{"gene_id":"Pm_03g004567","name":"HSP90","log2fc":4.89,"function":"Heat shock protein 90"}]),
            models.Transcriptomics(crop_id=4, experiment_id='SRP201234', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP201234',
                tissue='Root', condition='Drought Stress', platform='Illumina NovaSeq 6000', replicate_count=3,
                stats={"total_reads_million": 289.1, "mapped_pct": 90.3, "upregulated": 3567, "downregulated": 2890, "degs_total": 6457, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Pg_01g001234","name":"ABI5","log2fc":4.34,"function":"ABA-responsive element binding"},{"gene_id":"Pg_03g004567","name":"SNAC1","log2fc":3.98,"function":"Stress-responsive NAC1"}]),
            models.Transcriptomics(crop_id=5, experiment_id='SRP234567', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP234567',
                tissue='Leaf', condition='Low-Phosphorus Stress', platform='BGISEQ-500', replicate_count=3,
                stats={"total_reads_million": 145.6, "mapped_pct": 85.4, "upregulated": 1876, "downregulated": 1654, "degs_total": 3530, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Ps_01g001234","name":"PHT1","log2fc":4.78,"function":"Phosphate transporter 1"}]),
            models.Transcriptomics(crop_id=6, experiment_id='SRP267890', data_link='https://www.ncbi.nlm.nih.gov/sra/SRP267890',
                tissue='Leaf', condition='Submergence Tolerance', platform='Illumina NovaSeq 6000', replicate_count=3,
                stats={"total_reads_million": 278.3, "mapped_pct": 88.7, "upregulated": 4234, "downregulated": 3456, "degs_total": 7690, "fdr_threshold": 0.05},
                top_genes=[{"gene_id":"Ee_01g001234","name":"SUB1A","log2fc":5.23,"function":"Submergence tolerance TF"},{"gene_id":"Ee_03g004567","name":"ADH1","log2fc":4.67,"function":"Alcohol dehydrogenase"}]),
        ]
        db.add_all(trx_data)
        db.flush()

        # ---- METABOLOMICS ----
        met_data = [
            models.Metabolomics(crop_id=1, experiment_id='MTBLS1001', data_link='https://www.ebi.ac.uk/metabolights/',
                tissue='Seed', metabolites_count=487, platform='LC-MS/MS (Orbitrap)',
                stats={"flavonoids": 124, "phenolic_acids": 89, "amino_acids": 45, "organic_acids": 67, "lipids": 78, "alkaloids": 34, "terpenoids": 28, "vitamins": 22},
                top_metabolites=[{"name":"Vitexin","class":"Flavonoid","abundance":"High","bioactivity":"Antioxidant, anti-inflammatory"},{"name":"Orientin","class":"Flavonoid","abundance":"High","bioactivity":"Neuroprotective"},{"name":"Ferulic acid","class":"Phenolic acid","abundance":"Moderate","bioactivity":"UV-protective, antioxidant"}]),
            models.Metabolomics(crop_id=2, experiment_id='MTBLS2001', data_link='https://www.ebi.ac.uk/metabolights/',
                tissue='Seed', metabolites_count=412, platform='LC-MS/MS (Q-TOF)',
                stats={"flavonoids": 98, "phenolic_acids": 76, "amino_acids": 51, "organic_acids": 58, "lipids": 67, "alkaloids": 27, "terpenoids": 19, "vitamins": 16},
                top_metabolites=[{"name":"Tricin","class":"Flavonoid","abundance":"Very High","bioactivity":"Anticancer, anti-inflammatory"},{"name":"Luteolin","class":"Flavonoid","abundance":"High","bioactivity":"Antioxidant, neuroprotective"}]),
            models.Metabolomics(crop_id=3, experiment_id='MTBLS3001', data_link='https://www.ebi.ac.uk/metabolights/',
                tissue='Seed', metabolites_count=345, platform='LC-MS/MS (Orbitrap)',
                stats={"flavonoids": 72, "phenolic_acids": 63, "amino_acids": 48, "organic_acids": 54, "lipids": 56, "alkaloids": 18, "terpenoids": 16, "vitamins": 18},
                top_metabolites=[{"name":"Miliacin","class":"Triterpenoid","abundance":"Very High","bioactivity":"Unique marker for Proso millet"},{"name":"Lecithin","class":"Phospholipid","abundance":"High","bioactivity":"Nervous system health"}]),
            models.Metabolomics(crop_id=4, experiment_id='MTBLS4001', data_link='https://www.ebi.ac.uk/metabolights/',
                tissue='Seed', metabolites_count=523, platform='UPLC-MS/MS (Waters Xevo)',
                stats={"flavonoids": 134, "phenolic_acids": 98, "amino_acids": 56, "organic_acids": 71, "lipids": 89, "alkaloids": 32, "terpenoids": 24, "vitamins": 19},
                top_metabolites=[{"name":"C-glycosyl flavone","class":"Flavonoid","abundance":"Very High","bioactivity":"Antioxidant"},{"name":"Ferulic acid","class":"Phenolic acid","abundance":"High","bioactivity":"Anti-inflammatory"}]),
            models.Metabolomics(crop_id=5, experiment_id='MTBLS5001', data_link='https://www.ebi.ac.uk/metabolights/',
                tissue='Seed', metabolites_count=298, platform='GC-MS (Agilent 7890B)',
                stats={"flavonoids": 62, "phenolic_acids": 48, "amino_acids": 39, "organic_acids": 45, "lipids": 52, "alkaloids": 19, "terpenoids": 15, "vitamins": 18},
                top_metabolites=[{"name":"Catechin","class":"Flavonoid","abundance":"High","bioactivity":"Strong antioxidant"},{"name":"Vanillic acid","class":"Phenolic acid","abundance":"Moderate","bioactivity":"Antimicrobial"}]),
            models.Metabolomics(crop_id=6, experiment_id='MTBLS6001', data_link='https://www.ebi.ac.uk/metabolights/',
                tissue='Seed', metabolites_count=367, platform='LC-MS/MS (Orbitrap)',
                stats={"flavonoids": 82, "phenolic_acids": 69, "amino_acids": 42, "organic_acids": 56, "lipids": 61, "alkaloids": 23, "terpenoids": 17, "vitamins": 17},
                top_metabolites=[{"name":"GABA","class":"Amino acid","abundance":"Very High","bioactivity":"Neurotransmitter, anti-anxiety"},{"name":"Saponin","class":"Glycoside","abundance":"High","bioactivity":"Immune modulation"}]),
        ]
        db.add_all(met_data)
        db.flush()

        # ---- ANALYSES ----
        analyses_data = [
            models.Analyses(crop_id=1, analysis_type='Phylogenomic Analysis', result_summary='Finger millet clusters closely with Oryza (rice) within the Chloridoideae subfamily. Diverged from teff ~20 MYA.', result_link='https://academic.oup.com/plcell/', method='RAxML, IQ-TREE', date_performed='2023-06'),
            models.Analyses(crop_id=1, analysis_type='Gene Ontology Enrichment', result_summary='Significant enrichment in calcium transport (GO:0006816), drought response (GO:0009414), and starch biosynthesis pathways.', result_link='https://www.geneontology.org/', method='GOseq, topGO', date_performed='2023-08'),
            models.Analyses(crop_id=1, analysis_type='GWAS – Calcium Content', result_summary='Identified 14 significant SNPs on chromosomes 2A, 3B, and 7A associated with grain calcium content (p<5e-8).', method='GAPIT, TASSEL', date_performed='2024-01'),
            models.Analyses(crop_id=2, analysis_type='Comparative Genomics', result_summary='Foxtail millet shares high synteny with rice (85%), sorghum (78%), and maize (62%). Serves as a C4 model system.', result_link='https://phytozome.jgi.doe.gov/', method='MCScanX, SynMap', date_performed='2023-04'),
            models.Analyses(crop_id=2, analysis_type='Transcriptome Atlas', result_summary='Generated comprehensive expression atlas across 7 tissues and 3 developmental stages. Identified 3,245 tissue-specific genes.', result_link='https://www.ncbi.nlm.nih.gov/geo/', method='HISAT2, StringTie, DESeq2', date_performed='2023-09'),
            models.Analyses(crop_id=3, analysis_type='Population Genomics', result_summary='Genotyped 516 diverse accessions and identified 5 major subpopulations. Found evidence for two independent domestication events.', method='ADMIXTURE, STRUCTURE', date_performed='2023-11'),
            models.Analyses(crop_id=4, analysis_type='GWAS – Drought Tolerance', result_summary='Identified 23 QTL associated with terminal drought tolerance across 3 environments. Major QTL on LG2 and LG7.', result_link='https://cegsb.icrisat.org/', method='GAPIT, FarmCPU', date_performed='2023-07'),
            models.Analyses(crop_id=4, analysis_type='Pangenome Construction', result_summary='Pangenome from 345 resequenced Pearl millet lines. Core: 24,567 genes. Dispensable: 12,345. Private: 1,980.', method='PGGB, minigraph', date_performed='2024-02'),
            models.Analyses(crop_id=5, analysis_type='Nutritional QTL Mapping', result_summary='Identified QTL for iron (4 loci), zinc (3 loci), and dietary fiber (5 loci) using 186 RILs.', method='QTL IciMapping, R-qtl', date_performed='2023-12'),
            models.Analyses(crop_id=6, analysis_type='Herbicide Resistance Genomics', result_summary='Identified key mutations in ALS and ACCase genes conferring herbicide resistance in weedy Echinochloa relatives.', result_link='https://weedscience.org/', method='GATK, SnpEff', date_performed='2023-10'),
        ]
        db.add_all(analyses_data)

        db.commit()
        print("✅ Database seeded with 6 crops and all omics data!")
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding error: {e}")
    finally:
        db.close()


# Run seed on startup
seed_data()
