-- Drop existing tables if they exist
DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS metabolomics CASCADE;
DROP TABLE IF EXISTS transcriptomics CASCADE;
DROP TABLE IF EXISTS genomics CASCADE;
DROP TABLE IF EXISTS crops CASCADE;

CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    scientific_name VARCHAR(255) NOT NULL,
    family VARCHAR(255),
    description TEXT,
    reference_link VARCHAR(500),
    chromosome_number INTEGER,
    ploidy_level VARCHAR(100),
    genome_size_mb FLOAT,
    growth_habit VARCHAR(255),
    origin VARCHAR(255),
    common_names TEXT,
    nutritional_highlights TEXT,
    drought_tolerance VARCHAR(100),
    maturation_days VARCHAR(100),
    protein_content_percent FLOAT,
    fiber_content_percent FLOAT,
    calcium_mg_per_100g FLOAT,
    iron_mg_per_100g FLOAT,
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS genomics (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    genome_version VARCHAR(255),
    assembly_link VARCHAR(500),
    annotation_link VARCHAR(500),
    fasta_link VARCHAR(500),
    gff_link VARCHAR(500),
    transcriptome_summary JSONB,
    stats JSONB,
    gene_families JSONB,
    repeat_content JSONB,
    ortholog_stats JSONB
);

CREATE TABLE IF NOT EXISTS transcriptomics (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    experiment_id VARCHAR(255),
    data_link VARCHAR(500),
    tissue VARCHAR(255),
    condition VARCHAR(255),
    platform VARCHAR(255),
    replicate_count INTEGER,
    stats JSONB,
    top_genes JSONB
);

CREATE TABLE IF NOT EXISTS metabolomics (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    experiment_id VARCHAR(255),
    data_link VARCHAR(500),
    tissue VARCHAR(255),
    metabolites_count INTEGER,
    platform VARCHAR(255),
    stats JSONB,
    top_metabolites JSONB
);

CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    analysis_type VARCHAR(255),
    result_summary TEXT,
    result_link VARCHAR(500),
    method VARCHAR(255),
    date_performed VARCHAR(100)
);

-- =====================================================
-- INSERT COMPREHENSIVE DATA FOR 6 MINOR MILLETS
-- =====================================================

INSERT INTO crops (name, scientific_name, family, description, reference_link, chromosome_number, ploidy_level, genome_size_mb, growth_habit, origin, common_names, nutritional_highlights, drought_tolerance, maturation_days, protein_content_percent, fiber_content_percent, calcium_mg_per_100g, iron_mg_per_100g, image_url) VALUES
(
    'Finger Millet',
    'Eleusine coracana (L.) Gaertn.',
    'Poaceae',
    'Finger millet (Ragi) is one of the most nutritious cereals, widely cultivated in Africa and South Asia. It is the richest source of calcium among cereals and millets, making it invaluable for bone health. It is allotetraploid (AABB), domesticated from Eleusine africana, and shows remarkable climate resilience with adaptation to diverse agro-ecological conditions.',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Eleusine+coracana',
    36, 'Allotetraploid (2n=4x=36)', 1196.0,
    'Annual tufted grass, 40–130 cm tall, tillering at base',
    'Ethiopian Highlands, East Africa',
    'Ragi, Mandua, Nachni, Kelvaragu',
    'Highest calcium content (344 mg/100g) among cereals; rich in methionine, iron, and dietary fiber.',
    'High',
    '90–120',
    7.3, 3.6, 344.0, 3.9, NULL
),
(
    'Foxtail Millet',
    'Setaria italica (L.) P. Beauv.',
    'Poaceae',
    'Foxtail millet is one of the oldest cultivated millets, with archaeological evidence dating to ~8700 years ago in northern China. It serves as a C4 model organism for genomics. Its compact diploid genome has been fully sequenced, making it one of the best-characterized millet species for comparative genomics and gene discovery.',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Setaria+italica',
    18, 'Diploid (2n=2x=18)', 490.0,
    'Annual erect grass, 60–150 cm tall with bristly panicles',
    'Northern China',
    'Kangni, Thinai, Italian Millet, Kakum',
    'High protein (~12%), rich in dietary fiber, B-complex vitamins, and essential amino acids.',
    'Moderate–High',
    '75–90',
    12.3, 8.0, 31.0, 2.8, NULL
),
(
    'Proso Millet',
    'Panicum miliaceum L.',
    'Poaceae',
    'Proso millet has the shortest growing period (60–90 days) of all millets, making it an excellent emergency or rotation crop. It is an allotetraploid cereal domesticated approximately 10,000 years ago in East Asia. Recently gaining attention for its low glycemic index, high protein digestibility, and minimal water requirement for cultivation.',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Panicum+miliaceum',
    36, 'Allotetraploid (2n=4x=36)', 923.0,
    'Annual erect grass, 30–100 cm tall with open or compact panicle',
    'Central and East Asia (China/Manchuria)',
    'Cheena, Pani Varagu, Common Millet, Hog Millet',
    'High leucine content, gluten-free, low glycemic index, lecithin-rich for nervous system health.',
    'Very High',
    '60–90',
    12.5, 5.2, 14.0, 0.8, NULL
),
(
    'Pearl Millet',
    'Pennisetum glaucum (L.) R. Br.',
    'Poaceae',
    'Pearl millet is the most widely grown type of millet globally, serving as a staple food for over 90 million people in Africa and the Indian subcontinent. It is a C4 cereal with excellent heat and drought tolerance, able to produce grain in very hot, dry conditions where other cereals fail. Its genome (~1.76 Gb) has been sequenced by ICRISAT.',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Pennisetum+glaucum',
    14, 'Diploid (2n=2x=14)', 1760.0,
    'Annual robust grass, 1.5–3 m tall with cylindrical spike',
    'Sahel Zone, West Africa',
    'Bajra, Kambu, Cumbu, Dukhn',
    'Highest energy content among millets; rich in iron (8 mg/100g), zinc, and folate.',
    'Very High',
    '75–110',
    11.6, 1.2, 42.0, 8.0, NULL
),
(
    'Little Millet',
    'Panicum sumatrense Roth.',
    'Poaceae',
    'Little millet is a hardy, drought-tolerant small millet widely cultivated as a subsistence crop in the tribal and hilly areas of India. It grows well in poor soils and requires minimal inputs. The grain is rich in dietary fiber and antioxidants, making it increasingly popular in the health food sector. Its genome is currently being sequenced.',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Panicum+sumatrense',
    36, 'Tetraploid (2n=4x=36)', 510.0,
    'Annual erect grass, 30–90 cm tall, profusely tillered',
    'Indian subcontinent (Eastern Ghats)',
    'Kutki, Samai, Savan, Gundli',
    'Very high dietary fiber (7.6%); rich in B vitamins and minerals; lowest glycemic index among millets.',
    'High',
    '60–90',
    7.7, 7.6, 17.0, 9.3, NULL
),
(
    'Barnyard Millet',
    'Echinochloa esculenta (A.Braun) H.Scholz',
    'Poaceae',
    'Barnyard millet has the lowest carbohydrate content among all millets, making it a preferred grain for diabetic patients. It is among the fastest-growing millets (45–60 day crop cycle). Japanese barnyard millet was domesticated in Japan ~4000 years ago and Indian barnyard millet (E. frumentacea) was domesticated in India. Both are hexaploid species.',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Echinochloa',
    54, 'Hexaploid (2n=6x=54)', 1340.0,
    'Annual coarse grass, 50–100 cm tall with nodding panicles',
    'Japan (E. esculenta), India (E. frumentacea)',
    'Sanwa, Kuthiraivali, Jhangora, Oodalu',
    'Lowest carbohydrate (~55g/100g), highest crude fiber (~13.6%), excellent for diabetic diets.',
    'High',
    '45–75',
    6.2, 13.6, 20.0, 5.0, NULL
);

-- =====================================================
-- GENOMICS DATA (richer stats and gene families)
-- =====================================================
INSERT INTO genomics (crop_id, genome_version, assembly_link, annotation_link, fasta_link, gff_link, transcriptome_summary, stats, gene_families, repeat_content, ortholog_stats) VALUES
(1, 'v1.0 (2017)',
    'https://www.ncbi.nlm.nih.gov/assembly/GCA_021604985.1',
    'https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Ecoracana',
    'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/021/604/985/',
    'https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Ecoracana',
    '{"total_genes": 62348, "protein_coding": 57127, "noncoding_rna": 5221, "avg_gene_length_bp": 2847, "avg_exons_per_gene": 4.6}',
    '{"genome_size_mb": 1196, "scaffolds": 2078, "n50_mb": 23.7, "gc_content_pct": 44.7, "busco_complete_pct": 95.2, "total_chromosomes": 18, "repeat_pct": 52.1}',
    '{"transcription_factors": 2451, "protein_kinases": 1823, "nbs_lrr_resistance": 478, "cytochrome_p450": 312, "wrky_family": 98, "myb_family": 184}',
    '{"ltr_retrotransposons_pct": 32.4, "dna_transposons_pct": 9.8, "simple_repeats_pct": 4.1, "lines_pct": 2.8, "unknown_pct": 3.0}',
    '{"shared_with_rice": 18724, "shared_with_sorghum": 17892, "shared_with_maize": 16543, "unique_to_finger_millet": 4287}'
),
(2, 'v2.2 (2012+)',
    'https://www.ncbi.nlm.nih.gov/assembly/GCF_000263155.2',
    'https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Sitalica',
    'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/263/155/',
    'https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Sitalica',
    '{"total_genes": 38801, "protein_coding": 35471, "noncoding_rna": 3330, "avg_gene_length_bp": 2519, "avg_exons_per_gene": 4.3}',
    '{"genome_size_mb": 490, "scaffolds": 336, "n50_mb": 47.3, "gc_content_pct": 46.3, "busco_complete_pct": 97.1, "total_chromosomes": 9, "repeat_pct": 46.0}',
    '{"transcription_factors": 1687, "protein_kinases": 1245, "nbs_lrr_resistance": 234, "cytochrome_p450": 268, "wrky_family": 74, "myb_family": 145}',
    '{"ltr_retrotransposons_pct": 25.7, "dna_transposons_pct": 12.3, "simple_repeats_pct": 3.5, "lines_pct": 2.1, "unknown_pct": 2.4}',
    '{"shared_with_rice": 21543, "shared_with_sorghum": 20187, "shared_with_maize": 18965, "unique_to_foxtail": 2134}'
),
(3, 'v1.0 (2019)',
    'https://www.ncbi.nlm.nih.gov/assembly/GCA_003046395.2',
    'https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Pmiliaceum',
    'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/003/046/395/',
    'https://phytozome.jgi.doe.gov/pz/portal.html#!info?alias=Org_Pmiliaceum',
    '{"total_genes": 55930, "protein_coding": 52580, "noncoding_rna": 3350, "avg_gene_length_bp": 2631, "avg_exons_per_gene": 4.1}',
    '{"genome_size_mb": 923, "scaffolds": 1450, "n50_mb": 17.2, "gc_content_pct": 44.8, "busco_complete_pct": 93.8, "total_chromosomes": 18, "repeat_pct": 57.2}',
    '{"transcription_factors": 2178, "protein_kinases": 1567, "nbs_lrr_resistance": 398, "cytochrome_p450": 287, "wrky_family": 86, "myb_family": 162}',
    '{"ltr_retrotransposons_pct": 35.1, "dna_transposons_pct": 11.4, "simple_repeats_pct": 4.7, "lines_pct": 3.2, "unknown_pct": 2.8}',
    '{"shared_with_rice": 17856, "shared_with_sorghum": 16934, "shared_with_maize": 15821, "unique_to_proso": 3876}'
),
(4, 'v1.1 (2017)',
    'https://www.ncbi.nlm.nih.gov/assembly/GCF_003113225.1',
    'https://ceg.icrisat.org/ipmgsc/',
    'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/003/113/225/',
    'https://ceg.icrisat.org/ipmgsc/',
    '{"total_genes": 38579, "protein_coding": 33712, "noncoding_rna": 4867, "avg_gene_length_bp": 3012, "avg_exons_per_gene": 4.8}',
    '{"genome_size_mb": 1760, "scaffolds": 2093, "n50_mb": 35.6, "gc_content_pct": 46.1, "busco_complete_pct": 96.5, "total_chromosomes": 7, "repeat_pct": 68.4}',
    '{"transcription_factors": 1598, "protein_kinases": 1134, "nbs_lrr_resistance": 312, "cytochrome_p450": 256, "wrky_family": 67, "myb_family": 127}',
    '{"ltr_retrotransposons_pct": 42.3, "dna_transposons_pct": 14.7, "simple_repeats_pct": 5.1, "lines_pct": 3.8, "unknown_pct": 2.5}',
    '{"shared_with_rice": 19234, "shared_with_sorghum": 22145, "shared_with_maize": 17623, "unique_to_pearl": 3512}'
),
(5, 'Draft v1.0',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Panicum+sumatrense',
    NULL,
    NULL,
    NULL,
    '{"total_genes": 41200, "protein_coding": 37500, "noncoding_rna": 3700, "avg_gene_length_bp": 2467, "avg_exons_per_gene": 4.2}',
    '{"genome_size_mb": 510, "scaffolds": 3200, "n50_mb": 8.4, "gc_content_pct": 45.9, "busco_complete_pct": 88.6, "total_chromosomes": 18, "repeat_pct": 48.5}',
    '{"transcription_factors": 1732, "protein_kinases": 1298, "nbs_lrr_resistance": 267, "cytochrome_p450": 245, "wrky_family": 72, "myb_family": 138}',
    '{"ltr_retrotransposons_pct": 28.2, "dna_transposons_pct": 10.6, "simple_repeats_pct": 4.3, "lines_pct": 2.9, "unknown_pct": 2.5}',
    '{"shared_with_rice": 16879, "shared_with_sorghum": 15987, "shared_with_maize": 14789, "unique_to_little": 3654}'
),
(6, 'Draft v1.0',
    'https://www.ncbi.nlm.nih.gov/genome/?term=Echinochloa',
    NULL,
    'https://ftp.ncbi.nlm.nih.gov/genomes/all/GCA/011/397/445/',
    NULL,
    '{"total_genes": 78543, "protein_coding": 71234, "noncoding_rna": 7309, "avg_gene_length_bp": 2389, "avg_exons_per_gene": 3.9}',
    '{"genome_size_mb": 1340, "scaffolds": 4500, "n50_mb": 5.2, "gc_content_pct": 44.3, "busco_complete_pct": 85.4, "total_chromosomes": 27, "repeat_pct": 61.7}',
    '{"transcription_factors": 3124, "protein_kinases": 2345, "nbs_lrr_resistance": 567, "cytochrome_p450": 398, "wrky_family": 134, "myb_family": 245}',
    '{"ltr_retrotransposons_pct": 38.9, "dna_transposons_pct": 12.1, "simple_repeats_pct": 4.5, "lines_pct": 3.4, "unknown_pct": 2.8}',
    '{"shared_with_rice": 22456, "shared_with_sorghum": 20123, "shared_with_maize": 19876, "unique_to_barnyard": 5678}'
);

-- =====================================================
-- TRANSCRIPTOMICS (multiple experiments per crop)
-- =====================================================
INSERT INTO transcriptomics (crop_id, experiment_id, data_link, tissue, condition, platform, replicate_count, stats, top_genes) VALUES
(1, 'SRP065394', 'https://www.ncbi.nlm.nih.gov/sra/SRP065394', 'Leaf', 'Drought Stress', 'Illumina HiSeq 2500', 3,
    '{"total_reads_million": 245.7, "mapped_pct": 89.2, "upregulated": 3241, "downregulated": 2876, "degs_total": 6117, "fdr_threshold": 0.05}',
    '[{"gene_id":"Ec_01g001230","name":"DREB2A","log2fc":4.82,"function":"Drought-responsive TF"},{"gene_id":"Ec_03g004560","name":"LEA3","log2fc":4.15,"function":"Late embryogenesis abundant protein"},{"gene_id":"Ec_05g007890","name":"P5CS","log2fc":3.67,"function":"Proline biosynthesis"}]'
),
(1, 'SRP098745', 'https://www.ncbi.nlm.nih.gov/sra/SRP098745', 'Root', 'Salt Stress (200mM NaCl)', 'Illumina NovaSeq 6000', 3,
    '{"total_reads_million": 312.4, "mapped_pct": 91.5, "upregulated": 2567, "downregulated": 3124, "degs_total": 5691, "fdr_threshold": 0.05}',
    '[{"gene_id":"Ec_02g002340","name":"SOS1","log2fc":3.91,"function":"Na+/H+ antiporter"},{"gene_id":"Ec_06g008910","name":"NHX1","log2fc":3.45,"function":"Vacuolar Na+ transporter"},{"gene_id":"Ec_04g005670","name":"HKT1","log2fc":2.98,"function":"High-affinity K+ transporter"}]'
),
(2, 'SRP112345', 'https://www.ncbi.nlm.nih.gov/sra/SRP112345', 'Leaf', 'Drought Stress', 'Illumina HiSeq 4000', 3,
    '{"total_reads_million": 198.3, "mapped_pct": 92.8, "upregulated": 2890, "downregulated": 2456, "degs_total": 5346, "fdr_threshold": 0.05}',
    '[{"gene_id":"Si_01g001234","name":"NAC1","log2fc":5.12,"function":"Stress-responsive NAC TF"},{"gene_id":"Si_03g004567","name":"WRKY40","log2fc":4.23,"function":"WRKY transcription factor"},{"gene_id":"Si_05g007891","name":"RD29A","log2fc":3.87,"function":"Response to desiccation"}]'
),
(2, 'SRP145678', 'https://www.ncbi.nlm.nih.gov/sra/SRP145678', 'Seed', 'Grain Filling Stage', 'Illumina NovaSeq 6000', 4,
    '{"total_reads_million": 356.8, "mapped_pct": 94.1, "upregulated": 4123, "downregulated": 3567, "degs_total": 7690, "fdr_threshold": 0.01}',
    '[{"gene_id":"Si_02g002345","name":"GW2","log2fc":4.56,"function":"Grain width/weight regulator"},{"gene_id":"Si_06g008912","name":"SSIIa","log2fc":3.89,"function":"Starch synthase IIa"},{"gene_id":"Si_04g005678","name":"GBSS1","log2fc":3.45,"function":"Granule-bound starch synthase"}]'
),
(3, 'SRP178901', 'https://www.ncbi.nlm.nih.gov/sra/SRP178901', 'Leaf', 'Heat Stress (42°C)', 'Illumina HiSeq 4000', 3,
    '{"total_reads_million": 167.2, "mapped_pct": 87.5, "upregulated": 2134, "downregulated": 1987, "degs_total": 4121, "fdr_threshold": 0.05}',
    '[{"gene_id":"Pm_01g001234","name":"HSP70","log2fc":5.67,"function":"Heat shock protein 70"},{"gene_id":"Pm_03g004567","name":"HSP90","log2fc":4.89,"function":"Heat shock protein 90"},{"gene_id":"Pm_05g007891","name":"HSFA2","log2fc":4.12,"function":"Heat shock factor A2"}]'
),
(4, 'SRP201234', 'https://www.ncbi.nlm.nih.gov/sra/SRP201234', 'Root', 'Drought Stress', 'Illumina NovaSeq 6000', 3,
    '{"total_reads_million": 289.1, "mapped_pct": 90.3, "upregulated": 3567, "downregulated": 2890, "degs_total": 6457, "fdr_threshold": 0.05}',
    '[{"gene_id":"Pg_01g001234","name":"ABI5","log2fc":4.34,"function":"ABA-responsive element binding"},{"gene_id":"Pg_03g004567","name":"SNAC1","log2fc":3.98,"function":"Stress-responsive NAC1"},{"gene_id":"Pg_05g007891","name":"OsRab7","log2fc":3.56,"function":"Drought-inducible Rab GTPase"}]'
),
(5, 'SRP234567', 'https://www.ncbi.nlm.nih.gov/sra/SRP234567', 'Leaf', 'Low-Phosphorus Stress', 'BGISEQ-500', 3,
    '{"total_reads_million": 145.6, "mapped_pct": 85.4, "upregulated": 1876, "downregulated": 1654, "degs_total": 3530, "fdr_threshold": 0.05}',
    '[{"gene_id":"Ps_01g001234","name":"PHT1","log2fc":4.78,"function":"Phosphate transporter 1"},{"gene_id":"Ps_03g004567","name":"SPX1","log2fc":3.67,"function":"SPX domain protein"},{"gene_id":"Ps_05g007891","name":"PHO2","log2fc":-3.45,"function":"Phosphate homeostasis"}]'
),
(6, 'SRP267890', 'https://www.ncbi.nlm.nih.gov/sra/SRP267890', 'Leaf', 'Submergence Tolerance', 'Illumina NovaSeq 6000', 3,
    '{"total_reads_million": 278.3, "mapped_pct": 88.7, "upregulated": 4234, "downregulated": 3456, "degs_total": 7690, "fdr_threshold": 0.05}',
    '[{"gene_id":"Ee_01g001234","name":"SUB1A","log2fc":5.23,"function":"Submergence tolerance TF"},{"gene_id":"Ee_03g004567","name":"ADH1","log2fc":4.67,"function":"Alcohol dehydrogenase"},{"gene_id":"Ee_05g007891","name":"PDC1","log2fc":4.12,"function":"Pyruvate decarboxylase"}]'
);

-- =====================================================
-- METABOLOMICS DATA
-- =====================================================
INSERT INTO metabolomics (crop_id, experiment_id, data_link, tissue, metabolites_count, platform, stats, top_metabolites) VALUES
(1, 'MTBLS1001', 'https://www.ebi.ac.uk/metabolights/', 'Seed', 487,
    'LC-MS/MS (Orbitrap)',
    '{"flavonoids": 124, "phenolic_acids": 89, "amino_acids": 45, "organic_acids": 67, "lipids": 78, "alkaloids": 34, "terpenoids": 28, "vitamins": 22}',
    '[{"name":"Vitexin","class":"Flavonoid","abundance":"High","bioactivity":"Antioxidant, anti-inflammatory"},{"name":"Orientin","class":"Flavonoid","abundance":"High","bioactivity":"Neuroprotective"},{"name":"Ferulic acid","class":"Phenolic acid","abundance":"Moderate","bioactivity":"UV-protective, antioxidant"},{"name":"Calcium phytate","class":"Mineral complex","abundance":"Very High","bioactivity":"Mineral storage"},{"name":"Tryptophan","class":"Amino acid","abundance":"Moderate","bioactivity":"Serotonin precursor"}]'
),
(1, 'MTBLS1002', 'https://www.ebi.ac.uk/metabolights/', 'Leaf', 356,
    'GC-MS (Agilent 7890B)',
    '{"flavonoids": 87, "phenolic_acids": 56, "amino_acids": 38, "organic_acids": 72, "lipids": 45, "alkaloids": 21, "terpenoids": 19, "vitamins": 18}',
    '[{"name":"Chlorogenic acid","class":"Phenolic acid","abundance":"High","bioactivity":"Antioxidant"},{"name":"Quercetin","class":"Flavonoid","abundance":"Moderate","bioactivity":"Anti-inflammatory"},{"name":"Malic acid","class":"Organic acid","abundance":"High","bioactivity":"Metabolic intermediate"}]'
),
(2, 'MTBLS2001', 'https://www.ebi.ac.uk/metabolights/', 'Seed', 412,
    'LC-MS/MS (Q-TOF)',
    '{"flavonoids": 98, "phenolic_acids": 76, "amino_acids": 51, "organic_acids": 58, "lipids": 67, "alkaloids": 27, "terpenoids": 19, "vitamins": 16}',
    '[{"name":"Tricin","class":"Flavonoid","abundance":"Very High","bioactivity":"Anticancer, anti-inflammatory"},{"name":"Luteolin","class":"Flavonoid","abundance":"High","bioactivity":"Antioxidant, neuroprotective"},{"name":"p-Coumaric acid","class":"Phenolic acid","abundance":"Moderate","bioactivity":"Anti-tyrosinase"},{"name":"Proline","class":"Amino acid","abundance":"High","bioactivity":"Osmotic adjustment"}]'
),
(3, 'MTBLS3001', 'https://www.ebi.ac.uk/metabolights/', 'Seed', 345,
    'LC-MS/MS (Orbitrap)',
    '{"flavonoids": 72, "phenolic_acids": 63, "amino_acids": 48, "organic_acids": 54, "lipids": 56, "alkaloids": 18, "terpenoids": 16, "vitamins": 18}',
    '[{"name":"Miliacin","class":"Triterpenoid","abundance":"Very High","bioactivity":"Unique marker for Proso millet"},{"name":"Lecithin","class":"Phospholipid","abundance":"High","bioactivity":"Nervous system health"},{"name":"Apigenin","class":"Flavonoid","abundance":"Moderate","bioactivity":"Anti-inflammatory"}]'
),
(4, 'MTBLS4001', 'https://www.ebi.ac.uk/metabolights/', 'Seed', 523,
    'UPLC-MS/MS (Waters Xevo)',
    '{"flavonoids": 134, "phenolic_acids": 98, "amino_acids": 56, "organic_acids": 71, "lipids": 89, "alkaloids": 32, "terpenoids": 24, "vitamins": 19}',
    '[{"name":"C-glycosyl flavone","class":"Flavonoid","abundance":"Very High","bioactivity":"Antioxidant"},{"name":"Ferulic acid","class":"Phenolic acid","abundance":"High","bioactivity":"Anti-inflammatory"},{"name":"Phytosterols","class":"Sterol","abundance":"Moderate","bioactivity":"Cholesterol-lowering"},{"name":"Folate","class":"Vitamin B9","abundance":"Moderate","bioactivity":"DNA synthesis"}]'
),
(5, 'MTBLS5001', 'https://www.ebi.ac.uk/metabolights/', 'Seed', 298,
    'GC-MS (Agilent 7890B)',
    '{"flavonoids": 62, "phenolic_acids": 48, "amino_acids": 39, "organic_acids": 45, "lipids": 52, "alkaloids": 19, "terpenoids": 15, "vitamins": 18}',
    '[{"name":"Catechin","class":"Flavonoid","abundance":"High","bioactivity":"Strong antioxidant"},{"name":"Vanillic acid","class":"Phenolic acid","abundance":"Moderate","bioactivity":"Antimicrobial"},{"name":"Tocopherol","class":"Vitamin E","abundance":"Moderate","bioactivity":"Antioxidant"}]'
),
(6, 'MTBLS6001', 'https://www.ebi.ac.uk/metabolights/', 'Seed', 367,
    'LC-MS/MS (Orbitrap)',
    '{"flavonoids": 82, "phenolic_acids": 69, "amino_acids": 42, "organic_acids": 56, "lipids": 61, "alkaloids": 23, "terpenoids": 17, "vitamins": 17}',
    '[{"name":"Gamma-aminobutyric acid","class":"Amino acid","abundance":"Very High","bioactivity":"Neurotransmitter, anti-anxiety"},{"name":"Saponin","class":"Glycoside","abundance":"High","bioactivity":"Immune modulation"},{"name":"Kaempferol","class":"Flavonoid","abundance":"Moderate","bioactivity":"Antioxidant, cardioprotective"}]'
);

-- =====================================================
-- ANALYSES DATA
-- =====================================================
INSERT INTO analyses (crop_id, analysis_type, result_summary, result_link, method, date_performed) VALUES
(1, 'Phylogenomic Analysis', 'Finger millet clusters closely with Oryza (rice) within the Chloridoideae subfamily. It diverged from teff ~20 MYA. Maximum likelihood with 1000 bootstrap replicates.', 'https://academic.oup.com/plcell/', 'RAxML, IQ-TREE', '2023-06'),
(1, 'Gene Ontology Enrichment', 'Significant enrichment in calcium transport (GO:0006816), drought response (GO:0009414), and starch biosynthesis pathways. FDR < 0.001.', 'https://www.geneontology.org/', 'GOseq, topGO', '2023-08'),
(1, 'GWAS – Calcium Content', 'Identified 14 significant SNPs on chromosomes 2A, 3B, and 7A associated with grain calcium content (p<5e-8). Major QTL on Chr2A explains 18% of phenotypic variance.', NULL, 'GAPIT, TASSEL', '2024-01'),
(2, 'Comparative Genomics', 'Foxtail millet shares high synteny with rice (85%), sorghum (78%), and maize (62%). It serves as a C4 model system with well-annotated stress-response gene families. Genome duplication events dated to ~70 MYA (grass WGD).', 'https://phytozome.jgi.doe.gov/', 'MCScanX, SynMap', '2023-04'),
(2, 'Transcriptome Atlas', 'Generated a comprehensive expression atlas across 7 tissues and 3 developmental stages. Identified 3,245 tissue-specific genes and 856 housekeeping genes.', 'https://www.ncbi.nlm.nih.gov/geo/', 'HISAT2, StringTie, DESeq2', '2023-09'),
(3, 'Population Genomics', 'Genotyped 516 diverse accessions and identified 5 major subpopulations corresponding to geographic origins. Found evidence for two independent domestication events. Identified allelic diversity in waxy gene affecting grain quality.', NULL, 'ADMIXTURE, STRUCTURE', '2023-11'),
(4, 'GWAS – Drought Tolerance', 'Identified 23 quantitative trait loci associated with terminal drought tolerance across 3 environments. Major QTL on LG2 and LG7 contribute to stay-green and osmotic adjustment.', 'https://cegsb.icrisat.org/', 'GAPIT, FarmCPU', '2023-07'),
(4, 'Pangenome Construction', 'Constructed pangenome from 345 resequenced Pearl millet lines. Core genome: 24,567 genes. Dispensable: 12,345 genes. Private: 1,980 genes. Identified structural variations in drought and disease resistance loci.', NULL, 'PGGB, minigraph', '2024-02'),
(5, 'Nutritional QTL Mapping', 'Identified QTL for iron (4 loci), zinc (3 loci), and dietary fiber (5 loci) content using a biparental mapping population of 186 RILs. Major QTL on LG3 for iron explains 22% phenotypic variance.', NULL, 'QTL IciMapping, R-qtl', '2023-12'),
(6, 'Herbicide Resistance Genomics', 'Identified key mutations in ALS and ACCase genes conferring herbicide resistance in weedy Echinochloa relatives. Analyzed gene flow potential between cultivated and weedy species.', 'https://weedscience.org/', 'GATK, SnpEff', '2023-10');
