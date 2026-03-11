import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>MIMI DB</h3>
          <p>
            The Minor Millets Database is a comprehensive integrative resource containing
            genomic, transcriptomic, and metabolomic data for six minor millet species,
            aggregated from all publicly available open-source databases. Developed at the
            Bioinformatics Centre, Tamil Nadu Agricultural University.
          </p>
        </div>
        <div className="footer-links">
          <h4>Resources</h4>
          <a href="https://www.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer">NCBI</a>
          <a href="https://phytozome.jgi.doe.gov/" target="_blank" rel="noopener noreferrer">Phytozome</a>
          <a href="https://www.ebi.ac.uk/metabolights/" target="_blank" rel="noopener noreferrer">MetaboLights</a>
          <a href="https://www.geneontology.org/" target="_blank" rel="noopener noreferrer">Gene Ontology</a>
          <a href="https://plants.ensembl.org/" target="_blank" rel="noopener noreferrer">Ensembl Plants</a>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/tools">Tools</a>
          <a href="/help">Help &amp; User Guide</a>
          <a href="/about">About</a>
          <a href="https://tnau.ac.in/" target="_blank" rel="noopener noreferrer">TNAU</a>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} MIMI DB — Minor Millets Database. Tamil Nadu Agricultural University. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
