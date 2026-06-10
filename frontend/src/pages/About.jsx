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
          this gap by aggregating and curating all available genomic and transcriptomic
          data into an easy-to-use, visually rich web interface.
        </p>

        <h2><span className="section-title-bar"></span> Species Covered</h2>
        <ul>
          <li><strong>Finger Millet</strong> (<em>Eleusine coracana</em>) — Richest source of calcium among cereals</li>
          <li><strong>Foxtail Millet</strong> (<em>Setaria italica</em>) — C4 model organism for genomics</li>
          <li><strong>Proso Millet</strong> (<em>Panicum miliaceum</em>) — Shortest growing period of all millets</li>
          <li><strong>Little Millet</strong> (<em>Panicum sumatrense</em>) — Lowest glycemic index among millets</li>
          <li><strong>Barnyard Millet</strong> (<em>Echinochloa esculenta</em>) — Lowest carbohydrate content among millets</li>
          <li><strong>Kodo Millet</strong> (<em>Paspalum scrobiculatum</em>) — Traditional drought-resilient crop</li>
        </ul>

        <h2><span className="section-title-bar"></span> Key Features</h2>
        <ul>
          <li><strong>Integrated multi-omics data on six minor millets</strong> — Explore integrated multi-omics data, encompassing genomics, transcriptomics, proteomics, metabolomics, and phenomics, for comprehensive analyses of six minor millet species.</li>
          <li><strong>User-friendly interface</strong> Our platform offers a user-friendly interface designed for effortless data access and analysis, ensuring a seamless user experience. </li>
          <li><strong>Genome and metabolome analysis tools</strong> Utilize a diverse array of tools for genome and metabolome analyses, such as sequence alignment, variant calling, gene expression analysis, pathway analysis, and metabolite identification.</li>
          <li><strong>Regular updates</strong> We consistently update our platform with the latest data and analysis tools, guaranteeing access to the most current information and cutting-edge techniques. </li>
        </ul>

        <h2><span className="section-title-bar"></span> Developed At</h2>
        <p>
          MIMI DB is developed at the <strong>Department of Plant Molecular biology & Bioinformatics</strong>,
          <strong>Centre for Plant Molecular Biology & Biotechnology , Tamil Nadu Agricultural University (TNAU)</strong>, Coimbatore, India.
        </p>

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
