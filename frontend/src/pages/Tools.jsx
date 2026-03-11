import React from 'react';
import { Search, Dna } from 'lucide-react';

function Tools() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Bioinformatics Tools</h1>
        <p>Integrated analysis tools for exploring minor millet genomes</p>
      </div>

      <div className="tools-grid" style={{ paddingBottom: '3rem' }}>
        <div className="tool-card">
          <div className="tool-card-icon">
            <Dna size={28} />
          </div>
          <h3>JBrowse Genome Browser</h3>
          <p>
            Visualize and navigate reference genome assemblies, gene annotations,
            transcript models, and variant tracks for all six minor millet species
            using the JBrowse 2 genome browser.
          </p>
          <span className="badge badge-amber">Coming Soon</span>
        </div>

        <div className="tool-card">
          <div className="tool-card-icon">
            <Search size={28} />
          </div>
          <h3>BLAST Search</h3>
          <p>
            Run nucleotide (BLASTn) and protein (BLASTp, tBLASTx) sequence similarity
            searches against the complete minor millet genome and protein databases
            hosted in MIMI DB.
          </p>
          <span className="badge badge-amber">Coming Soon</span>
        </div>
      </div>

      <div className="content-section">
        <h2><span className="section-title-bar"></span> Planned Features</h2>
        <ul>
          <li><strong>JBrowse 2 Integration</strong> — Interactive genome browser with support for BAM/CRAM, VCF, GFF3, BigWig, and BED tracks.</li>
          <li><strong>NCBI BLAST+</strong> — Local BLAST server against curated minor millet databases for rapid sequence alignment.</li>
          <li><strong>Gene Expression Heatmaps</strong> — Interactive heatmap visualization of RNA-Seq expression data across tissues and conditions.</li>
          <li><strong>Pathway Viewer</strong> — KEGG/Reactome pathway visualization overlaid with millet-specific gene and metabolite data.</li>
          <li><strong>Synteny Viewer</strong> — Comparative chromosome-level synteny maps between millet species and model cereals.</li>
        </ul>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>
          These tools are currently under active development and will be integrated into MIMI DB in upcoming releases.
          If you have specific tool requirements, please contact us through the About page.
        </p>
      </div>
    </div>
  );
}

export default Tools;
