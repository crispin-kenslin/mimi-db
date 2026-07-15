import React from 'react';
import { Link } from 'react-router-dom';

const IMAGE_BASE = `${import.meta.env.BASE_URL}images`;

/* Reusable placeholder when no real screenshot exists */
function ImgPlaceholder({ label, height = 220 }) {
  return (
    <div style={{
      width: '100%',
      height,
      background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--primary-50) 100%)',
      border: '2px dashed var(--primary-300)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--primary-500)',
      fontSize: '0.9rem',
      fontWeight: 500,
      gap: '0.5rem',
      marginBottom: '1.5rem',
    }}>
      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      {label}
    </div>
  );
}

/* One help section card */
function HelpCard({ id, title, children }) {
  return (
    <div id={id} style={{
      background: 'var(--white)',
      border: '1px solid var(--gray-200)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '1.5rem',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--white) 100%)',
        borderBottom: '1px solid var(--gray-200)',
        borderLeft: '4px solid var(--primary-600)',
      }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-800)' }}>{title}</h2>
      </div>
      <div style={{ padding: '1.5rem', fontSize: '1rem', lineHeight: 1.75, color: '#1f2937' }}>
        {children}
      </div>
    </div>
  );
}

function Help() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Help &amp; User Guide</h1>
        <p>Step-by-step instructions for every page and section of MilletGenesDB</p>
      </div>

      {/* Quick-nav links */}
      <div style={{ background: 'var(--primary-50)', padding: '1rem 2rem', borderBottom: '1px solid var(--primary-200)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            ['#home', 'Home'],
            ['#crop', 'Crop Page'],
            ['#genomics', 'Genomics'],
            ['#transcriptomics', 'Transcriptomics'],
            ['#deg', 'DEG Analysis'],
            ['#metabolomics', 'Metabolomics'],
            ['#search', 'Search'],
            ['#tools', 'Tools'],
            ['#download', 'Downloading Data'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{
              padding: '0.4rem 1rem',
              background: 'var(--primary-100)',
              borderRadius: '50px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--primary-800)',
              textDecoration: 'none',
              border: '1px solid var(--primary-200)',
              transition: 'all 0.2s',
            }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-200)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'var(--primary-100)'; }}
            >{label}</a>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 'auto', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* ── Home Page ── */}
        <HelpCard id="home" title="Home Page">
          <p>
            The <strong>Home page</strong> is your entry point to MilletGenesDB. It displays summary
            statistics (number of species, stress conditions, genes identified, and metabolites),
            three interactive charts, and quick-access cards for each millet species.
          </p>

          <img
            src={`${IMAGE_BASE}/help/home.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Summary Statistics Bar</h3>
          <p>Four counters animate on scroll, showing the total number of <em>Millet Species</em>,
            <em> Stress Conditions</em>, <em>Genes Identified</em>, and <em>Metabolites</em> in the database.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Charts Section</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Genes Identified per Species</strong> — a colour-coded bar chart showing how many unique genes have been identified for each crop. Only crops with at least one gene are shown.</li>
            <li><strong>Gene Distribution (Sunburst)</strong> — an interactive sunburst / Krona-style chart. Click any slice to zoom in; click the centre to zoom back out.</li>
            <li><strong>% DEGs by Stress</strong> — a stacked bar chart showing the proportion of upregulated vs downregulated differentially expressed genes for each stress type across all crops.</li>
          </ul>

          <img
            src={`${IMAGE_BASE}/help/charts.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Millet Species Cards</h3>
          <p>Scroll down to find illustrated cards for all five minor millet species. Click any card to open its dedicated <strong>Crop Page</strong>. You can also hover over <strong>Crops</strong> in the top navigation bar for a quick dropdown.</p>
        </HelpCard>

        {/* ── Crop Page ── */}
        <HelpCard id="crop" title="Crop Page">
          <p>
            Each millet species has its own <strong>Crop Page</strong>. Navigate there by clicking a
            species card on the Home page or selecting the species from the <em>Crops</em> navbar dropdown.
          </p>
          <img
            src={`${IMAGE_BASE}/help/crops.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Left Sidebar Navigation</h3>
          <p>The sticky left sidebar lets you jump between the three data sections: <strong>Genomics</strong>,
            <strong> Transcriptomics</strong>, and <strong>Metabolomics</strong>. On mobile, these become
            horizontal scroll tabs.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Quick Access Cards</h3>
          <p>At the top of the crop page, three quick-access cards link to:</p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li><strong>Download Files</strong> — browse all genome / transcriptomics / metabolomics files for this species.</li>
            <li><strong>Genome Browser (JBrowse)</strong> — open the interactive JBrowse 2 genome browser.</li>
            <li><strong>BLAST Search</strong> — run a BLAST sequence similarity search pre-filtered to this species.</li>
          </ul>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Overview Card</h3>
          <p>Just below the header, find the <strong>Scientific name</strong>, a brief <strong>Description</strong>,
            and a list of <strong>Common names</strong> for the selected millet species.</p>
        </HelpCard>

        {/* ── Genomics ── */}
        <HelpCard id="genomics" title="Genomics Section">
          <p>
            The <strong>Genomics</strong> section (accessible from the crop page sidebar) contains
            all genome-level data for the selected species.
          </p>
          <img
            src={`${IMAGE_BASE}/help/genomics.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Genome Information</h3>
          <p>Displays four key genome metrics in cards: <strong>Chromosomes</strong>, <strong>Genome Size</strong>,
            <strong> Plant Family</strong>, and <strong>Ploidy Level</strong>. A button links out to NCBI to
            browse all genomes for this species' taxon ID.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Reference Genome (RefSeq)</h3>
          <p>Detailed metadata for the reference genome assembly is shown here, including <strong>Scientific name</strong>,
            <strong> Family</strong>, <strong>Genome Size</strong>, <strong>Chromosomes</strong>,
            <strong> BioProject ID</strong> (linked to NCBI), <strong>Cultivar</strong>, and <strong>Publisher</strong>.
            Click <em>Open JBrowse</em> to visualise the genome interactively.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Downloading Genome Files</h3>
          <p>Use the <strong>Download Files</strong> quick-access card at the top of the crop page to browse
            FASTA genome assemblies, GFF3 annotation files, and other genomics files.</p>
        </HelpCard>

        {/* ── Transcriptomics ── */}
        <HelpCard id="transcriptomics" title="Transcriptomics Section">
          <p>
            The <strong>Transcriptomics</strong> section lists all available stress experiments for the
            selected crop. Each experiment corresponds to one or more RNA-Seq datasets that have been
            analysed for differentially expressed genes (DEGs).
          </p>
          <img
            src={`${IMAGE_BASE}/help/transcriptomics.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Stress Condition Cards</h3>
          <p>Each stress (e.g., Aluminium, Osmotic, Salt, Drought, Cold) appears as a clickable card.
            Click <em>View DEG Analysis</em> on any card to open the full DEG Analysis page for that
            stress–species combination.</p>

          <p style={{ marginTop: '0.75rem' }}>
            If no transcriptomics data is available for a species, a message is displayed instead of cards.
          </p>
        </HelpCard>

        {/* ── DEG Analysis ── */}
        <HelpCard id="deg" title="DEG Analysis Page">
          <p>
            The <strong>DEG Analysis page</strong> opens when you click a stress condition on the Crop page.
            It shows the full differentially expressed gene (DEG) dataset for one stress experiment.
          </p>
          <img
            src={`${IMAGE_BASE}/help/deg.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Summary Stats Bar</h3>
          <p>Four coloured cards show: <strong>Total Genes</strong> in the dataset,
            <strong> Upregulated</strong> genes (Log2FC &gt; 1), <strong>Downregulated</strong> genes
            (Log2FC &lt; −1), and <strong>Significant</strong> genes (padj &lt; 0.05).</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Volcano Plot</h3>
          <p>An interactive scatter plot with <strong>Log2 Fold Change</strong> on the X axis and
            <strong> −Log10(padj)</strong> on the Y axis. Each point is a gene, colour-coded:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li><span style={{ color: '#10b981', fontWeight: 700 }}>Green</span> — Upregulated</li>
            <li><span style={{ color: '#ef4444', fontWeight: 700 }}>Red</span> — Downregulated</li>
            <li><span style={{ color: '#9ca3af', fontWeight: 700 }}>Grey</span> — Not significant</li>
          </ul>
          <p>Hover over any point for a tooltip showing the gene ID, protein, Log2FC, padj, and regulation status.
            <strong> Click a point</strong> to open the <em>Sequence Viewer</em> modal for that gene.</p>
          <img
            src={`${IMAGE_BASE}/help/volcano-plot.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Gene Expression Data Table</h3>
          <p>Below the volcano plot, a searchable and sortable table lists every gene in the dataset.
            Columns include Gene ID, Log2FC, p-value, adjusted p-value, chromosomal location, and
            protein annotation. Use the table's search bar to filter by gene ID or protein name.</p>
        </HelpCard>

        {/* ── Metabolomics ── */}
        <HelpCard id="metabolomics" title="Metabolomics Section">
          <p>
            The <strong>Metabolomics</strong> section provides GC-MS metabolite profile data for each
            millet species. Click the <em>Seed</em> card on the Crop page to open the full metabolites table.
          </p>
          <img
            src={`${IMAGE_BASE}/help/metabolites.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Metabolites Table</h3>
          <p>Lists all compounds identified in GC-MS analysis. You can search by compound name using
            the search bar at the top of the table. Each row shows the compound name, retention time,
            and relative abundance. Data is sourced from publicly available metabolomics repositories.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Downloading Metabolomics Files</h3>
          <p>Click the <strong>Browse Metabolomics Files</strong> button on the Crop page to download the
            raw GC-MS data files.</p>
        </HelpCard>

        {/* ── Search ── */}
        <HelpCard id="search" title="Search Page">
          <p>
            The <strong>Search page</strong> lets you query the entire database in two modes selected
            with the radio buttons at the top.
          </p>
          <img
            src={`${IMAGE_BASE}/help/search.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Crops Mode</h3>
          <p>Enter any part of a crop's common name, scientific name, or family. Matching crops are
            displayed as clickable cards that link directly to their Crop page.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Genes / Proteins Mode</h3>
          <p>Enter a gene ID (e.g., <code>DN18722_c0_g1_i1</code>) or a protein keyword
            (e.g., <code>kinase</code>, <code>peroxidase</code>). The search scans <em>all</em> stress
            experiment CSV files across every crop and returns a results table with six columns:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li><strong>Crop</strong> — links to the crop's page</li>
            <li><strong>Stress</strong> — links to the DEG analysis page for that stress</li>
            <li><strong>Gene ID</strong> — also links to the DEG page; opens the full gene list where you can find the gene</li>
            <li><strong>Log2FC</strong> — coloured green (up) or red (down) when |LFC| &gt; 1</li>
            <li><strong>P-value</strong> — raw p-value from the DEG analysis</li>
            <li><strong>Protein</strong> — full protein annotation / product description</li>
          </ul>
          <p>Results are limited to 500 entries per search. If the limit is reached, a warning is shown —
            try a more specific query to narrow results.</p>
        </HelpCard>

        {/* ── Tools ── */}
        <HelpCard id="tools" title="Tools">
          <p>
            The <strong>Tools</strong> section hosts two integrated bioinformatics tools accessible from
            the top navigation bar.
          </p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>BLAST Search</h3>
          <p>BLAST (Basic Local Alignment Search Tool) lets you search for sequence similarity against the
            minor millet genome databases. Paste a nucleotide or protein FASTA sequence, select the target
            species and database, choose a BLAST program (blastn, blastp, blastx, tblastn, or tblastx),
            and click <em>Run BLAST</em>. Results appear in a table with hit information, e-values, identity
            percentages, and alignment scores.</p>
          <img
            src={`${IMAGE_BASE}/help/blast.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>JBrowse Genome Browser</h3>
          <p>JBrowse 2 is an interactive genome browser embedded directly in MilletGenesDB. It lets you:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li>Navigate chromosomal regions with pan and zoom</li>
            <li>View gene annotations from GFF3 files</li>
            <li>Inspect individual genes, exons, and introns in detail</li>
          </ul>
          <p>Select the species from the JBrowse controls to load the appropriate reference genome assembly.</p>
          <img
            src={`${IMAGE_BASE}/help/jb.png`}
            alt="Home page showing summary statistics and species cards"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '900px',
              borderRadius: '8px',
              border: '2px solid black',
              margin: '1rem auto'
            }}
          />
        </HelpCard>

        {/* ── Downloading ── */}
        <HelpCard id="download" title="Downloading Data">
          <p>
            All data in MilletGenesDB can be downloaded for offline analysis. Files are organised by crop and
            data type.
          </p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary-700)' }}>Genomics Files</h3>
          <p>From the Crop page, click the <strong>Download Files</strong> card at the top. A file browser
            modal will open listing all available genome files (FASTA assemblies, GFF3 annotations, etc.).
            Click any file name to download it directly.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Transcriptomics Files</h3>
          <p>DEG CSV files are available through the download browser. Each file is named
            <code>&lt;crop&gt;-&lt;stress&gt;.csv</code> and contains Gene ID, Log2FoldChange, p-value,
            adjusted p-value, chromosomal coordinates, and protein annotations.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>Metabolomics Files</h3>
          <p>Click <strong>Browse Metabolomics Files</strong> on the Crop page to download the raw GC-MS
            metabolomics data for that species.</p>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: '1rem', color: 'var(--primary-700)' }}>External Databases</h3>
          <p>MilletGenesDB also links out to external repositories:</p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li><strong>NCBI</strong> — genome assemblies, BioProjects, and SRA experiments</li>
            <li><strong>Phytozome</strong> — plant genome browser and downloads</li>
            <li><strong>MetaboLights / EBI</strong> — metabolomics datasets</li>
          </ul>
        </HelpCard>

      </div>
    </div>
  );
}

export default Help;
