import React from 'react';

function Help() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Help &amp; User Guide</h1>
        <p>Step-by-step instructions on how to use the MIMI DB platform</p>
      </div>

      <div className="content-section">
        <h2><span className="section-title-bar"></span> Getting Started</h2>
        <p>
          MIMI DB (Minor Millets Database) is designed to be a one-stop resource for researchers
          working on minor millet genomics, transcriptomics, and metabolomics. The database
          aggregates data from multiple public repositories including NCBI, Phytozome,
          MetaboLights, and Ensembl Plants.
        </p>

        <h2><span className="section-title-bar"></span> Browsing Crops</h2>
        <p>
          From the <strong>Home</strong> page, you can see all six minor millet species displayed
          horizontally with their images. Click on any millet to navigate to its dedicated crop page.
          Alternatively, hover over the <strong>Crops</strong> menu in the navigation bar to see a
          dropdown listing all species with quick links.
        </p>

        <h2><span className="section-title-bar"></span> Crop Detail Page</h2>
        <p>
          Each crop page contains five tabs of information:
        </p>
        <ul>
          <li><strong>Overview</strong> — Botanical classification, genetic profile (chromosome number, ploidy, genome size), growth characteristics, origin, common names, and nutritional composition with interactive charts.</li>
          <li><strong>Genomics</strong> — Genome assembly details with download links for FASTA, GFF, and annotations. Interactive charts showing genome statistics, gene family distributions, repeat element composition, and orthologous gene clusters shared with rice, sorghum, and maize.</li>
          <li><strong>Transcriptomics</strong> — RNA-Seq experiment details with links to NCBI SRA. Summary charts of differentially expressed genes (upregulated vs downregulated) across all experiments. Tables listing the top DEGs with gene IDs, log₂ fold change, and functional annotations.</li>
          <li><strong>Metabolomics</strong> — Metabolite profiling data with links to MetaboLights. Pie charts showing metabolite class distributions (flavonoids, phenolic acids, amino acids, etc.). Tables of key metabolites with bioactivity information.</li>
          <li><strong>Analyses</strong> — Published analysis reports including GWAS, phylogenomics, comparative genomics, pangenome construction, and nutritional QTL mapping. Each card shows the analysis type, method used, and links to publications or resources.</li>
        </ul>

        <h2><span className="section-title-bar"></span> Searching</h2>
        <p>
          Use the <strong>Search</strong> page to filter crops by name, scientific name, or common names.
          Gene-level and metabolite-level search capabilities are under development and will be available
          in upcoming releases.
        </p>

        <h2><span className="section-title-bar"></span> Tools</h2>
        <p>
          The <strong>Tools</strong> section will host integrated bioinformatics tools including JBrowse 2
          genome browser for interactive genome visualization and BLAST for sequence similarity searches
          against the minor millet databases. These are currently under active development.
        </p>

        <h2><span className="section-title-bar"></span> Downloading Data</h2>
        <p>
          External data links are provided throughout the database. On the Genomics tab, you will find
          buttons to download genome assemblies (FASTA), annotations (GFF), and access Phytozome/NCBI
          pages. On the Transcriptomics tab, direct links to NCBI SRA experiments are available.
          On the Metabolomics tab, links to MetaboLights and EBI repositories are provided.
        </p>
      </div>
    </div>
  );
}

export default Help;
