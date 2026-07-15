import React from 'react';

const DEVELOPERS = [
  {
    name: 'Crispin Joe Kenslin A',
    role: 'B.Tech Biotechnology',
    affiliation: 'Department of Plant Biotechnology, TNAU',
    email: 'crispin.biotech2022@tnau.ac.in',
    initials: 'D1',
    color: '#0f4867',
  },
  {
    name: 'Srinidhi HJ',
    role: 'B.Tech Biotechnology',
    affiliation: 'Department of Plant Biotechnology, TNAU',
    email: 'srinidhi.biotech2022@tnau.ac.in',
    initials: 'D2',
    color: '#165b80',
  },
  {
    name: 'Dr.M.Jayakanthan',
    role: 'Assistant Professor (Bioinformatics)',
    affiliation: 'Department of Plant Molecular Biology & Bioinformatics, TNAU',
    email: 'jayakanthan.m@tnau.ac.in',
    initials: 'D3',
    color: '#24719b',
  },
];

function DeveloperCard({ dev }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-xl)',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      boxShadow: 'var(--shadow-md)',
      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      width: '100%',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    >
      <div>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.2rem' }}>
          {dev.name}
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: dev.color, marginBottom: '0.4rem' }}>
          {dev.role}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
          {dev.affiliation}
        </div>
      </div>

      <a
        href={`mailto:${dev.email}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '0.5rem',
          padding: '0.45rem 1rem',
          borderRadius: '50px',
          background: 'var(--primary-50)',
          border: '1px solid var(--primary-200)',
          color: 'var(--primary-700)',
          fontSize: '0.82rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-100)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'var(--primary-50)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        {dev.email}
      </a>
    </div>
  );
}

function About() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>About MilletGenesDB</h1>
        <p>An Integrative Multi-Omics Resource for Minor Millets</p>
      </div>

      <div className="content-section">
        <h2><span className="section-title-bar"></span> Overview</h2>
        <p>
          The <strong>Minor Millets Database (MilletGenesDB)</strong> is a comprehensive bioinformatics
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
          difficult for researchers to access and compare data across species. MilletGenesDB addresses
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
          <li><strong>Integrated multi-omics data on six minor millets</strong> — Explore integrated multi-omics data, encompassing genomics, transcriptomics, metabolomics, and phenomics, for comprehensive analyses of six minor millet species.</li>
          <li><strong>User-friendly interface</strong> — Our platform offers a user-friendly interface designed for effortless data access and analysis, ensuring a seamless user experience.</li>
          <li><strong>Genome and metabolome analysis tools</strong> — Utilize a diverse array of tools for genome and metabolome analyses, such as sequence alignment, gene expression analysis, pathway analysis, and metabolite identification.</li>
          <li><strong>Regular updates</strong> — We consistently update our platform with the latest data and analysis tools, guaranteeing access to the most current information and cutting-edge techniques.</li>
        </ul>

        <h2><span className="section-title-bar"></span> Developed At</h2>
        <p>
          MilletGenesDB is developed at the <strong>Department of Plant Molecular Biology &amp; Bioinformatics</strong>,&nbsp;
          <strong>Centre for Plant Molecular Biology &amp; Biotechnology, Tamil Nadu Agricultural University (TNAU)</strong>, Coimbatore, India.
        </p>

        <h2><span className="section-title-bar"></span> Citation</h2>
        <p>
          If you use MilletGenesDB in your research, please cite:
        </p>
        <div className="info-panel" style={{ marginBottom: '1.5rem' }}>
          <div className="info-panel-body" style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
            MilletGenesDB: An Integrative Multi-Omics Database for Minor Millets.
            Bioinformatics Centre, Tamil Nadu Agricultural University, Coimbatore, India.
          </div>
        </div>

        <h2><span className="section-title-bar"></span> Contact</h2>
        <p>
          For queries, data submissions, or collaborations, please contact the
          Bioinformatics Centre at Tamil Nadu Agricultural University.
        </p>
      </div>

      {/* ── Developer Cards ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--white) 100%)', padding: '3rem 2rem', borderTop: '1px solid var(--gray-200)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
              Meet the Developers
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--gray-500)' }}>
              The team behind MilletGenesDB
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}>
            {DEVELOPERS.map(dev => (
              <DeveloperCard key={dev.name} dev={dev} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
