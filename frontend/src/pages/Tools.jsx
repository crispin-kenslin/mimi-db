import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, Search } from 'lucide-react';

function Tools() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Bioinformatics Tools</h1>
        <p>Select a tool to continue.</p>
      </div>

      <div className="tools-grid" style={{ paddingBottom: '3rem' }}>
        <Link to="/tools/jbrowse" className="tool-card" style={{ display: 'block' }}>
          <div className="tool-card-icon">
            <Dna size={28} />
          </div>
          <h3>JBrowse Genome Browser</h3>
          <p>
            Browse reference sequences and gene annotations using JBrowse.
          </p>
          <span className="badge badge-green">Open JBrowse</span>
        </Link>

        <Link to="/tools/blast" className="tool-card" style={{ display: 'block' }}>
          <div className="tool-card-icon">
            <Search size={28} />
          </div>
          <h3>BLAST Search</h3>
          <p>
            Run BLASTn against one or more Minor Millets.
          </p>
          <span className="badge badge-green">Open BLAST</span>
        </Link>
      </div>
    </div>
  );
}

export default Tools;
