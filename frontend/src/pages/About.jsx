import React from 'react';

function About() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>About MIMI DB</h1>
        <p>An Integrative Multi-Omics Resource for Minor Millets</p>
      </div>

      <div className="content-section">
        <h2><span className="section-title-bar"></span> Overview</h2>
        <p>
          The <strong>Minor Millets Database (MIMI DB)</strong> is a comprehensive bioinformatics
          platform developed to serve as a centralized resource for researchers, breeders, and
          students working on minor millet crops. The database integrates genomic, transcriptomic,
          and metabolomic data from all publicly available open-source databases, making it easy to
          access multi-omics information for six important minor millet species in a single place.
        </p>

        <h2><span className="section-title-bar"></span> Mission</h2>
        <p>
          Minor millets are nutritionally superior, climate-resilient crops with immense potential
          for food security and sustainable agriculture. However, their multi-omics data is
          scattered across numerous repositories (NCBI, Phytozome, EBI, KEGG, etc.), making it
          difficult for researchers to access and compare data across species. MIMI DB addresses
          this gap by aggregating and curating all available genomic, transcriptomic, and metabolomic
          data into an easy-to-use, visually rich web interface.
        </p>

        <h2><span className="section-title-bar"></span> Species Covered</h2>
        <ul>
          <li><strong>Finger Millet</strong> (<em>Eleusine coracana</em>) — Richest source of calcium among cereals</li>
          <li><strong>Foxtail Millet</strong> (<em>Setaria italica</em>) — C4 model organism for genomics</li>
          <li><strong>Proso Millet</strong> (<em>Panicum miliaceum</em>) — Shortest growing period of all millets</li>
          <li><strong>Pearl Millet</strong> (<em>Pennisetum glaucum</em>) — Most widely grown millet globally</li>
          <li><strong>Little Millet</strong> (<em>Panicum sumatrense</em>) — Lowest glycemic index among millets</li>
          <li><strong>Barnyard Millet</strong> (<em>Echinochloa esculenta</em>) — Lowest carbohydrate content among millets</li>
        </ul>

        <h2><span className="section-title-bar"></span> Data Sources</h2>
        <p>
          The data in MIMI DB has been curated from the following public repositories and publications:
        </p>
        <ul>
          <li><strong>NCBI</strong> — Genome assemblies, SRA transcriptome experiments, gene annotations</li>
          <li><strong>Phytozome (JGI)</strong> — Plant genome annotations and comparative genomics data</li>
          <li><strong>Ensembl Plants</strong> — Gene models and variation data</li>
          <li><strong>MetaboLights (EBI)</strong> — Metabolomics experiment data</li>
          <li><strong>ICRISAT</strong> — Pearl millet genome project data</li>
          <li><strong>Published literature</strong> — Peer-reviewed journals for analysis results and summary statistics</li>
        </ul>

        <h2><span className="section-title-bar"></span> Developed At</h2>
        <p>
          MIMI DB is developed at the <strong>Bioinformatics Centre</strong>,
          <strong> Tamil Nadu Agricultural University (TNAU)</strong>, Coimbatore, India.
        </p>

        <h2><span className="section-title-bar"></span> Technology Stack</h2>
        <ul>
          <li><strong>Backend:</strong> Python 3.11, FastAPI, SQLAlchemy, PostgreSQL</li>
          <li><strong>Frontend:</strong> React 18, Vite, Recharts, Lucide Icons</li>
          <li><strong>Database:</strong> PostgreSQL with JSONB for flexible omics metadata storage</li>
        </ul>

        <h2><span className="section-title-bar"></span> Citation</h2>
        <p>
          If you use MIMI DB in your research, please cite:
        </p>
        <div className="info-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="info-panel-body" style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            MIMI DB: An Integrative Multi-Omics Database for Minor Millets.
            Bioinformatics Centre, Tamil Nadu Agricultural University, Coimbatore, India.
            Available at: http://localhost:5173 (development version)
          </div>
        </div>

        <h2><span className="section-title-bar"></span> Contact</h2>
        <p>
          For queries, data submissions, or collaborations, please contact the
          Bioinformatics Centre at Tamil Nadu Agricultural University.
        </p>
      </div>
    </div>
  );
}

export default About;
