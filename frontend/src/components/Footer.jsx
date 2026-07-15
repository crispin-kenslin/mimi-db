import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>MilletGenesDB</h3>
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
          <a href="https://www.ebi.ac.uk/ena/browser/" target="_blank" rel="noopener noreferrer">ENA Browser</a>
          <a href="https://www.ncbi.nlm.nih.gov/gds" target="_blank" rel="noopener noreferrer">GEO Datasets</a>
          <a href="https://plants.ensembl.org/" target="_blank" rel="noopener noreferrer">Ensembl Plants</a>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <Link to="/tools">Tools</Link>
          <Link to="/help">Help &amp; User Guide</Link>
          <Link to="/about">About</Link>
          <Link to="/browse">Browse</Link>
          <a href="https://tnau.ac.in/" target="_blank" rel="noopener noreferrer">TNAU</a>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} MilletGenesDB — Minor Millets Database. Tamil Nadu Agricultural University. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
