import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, ExternalLink, FlaskConical } from 'lucide-react';

function Metabolites() {
  const { slug } = useParams();
  const [metabolites, setMetabolites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const cropName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const fetchMetabolites = async () => {
      try {
        const response = await fetch(`/api/metabolites/${slug}`);
        if (!response.ok) throw new Error('No metabolite data available for this crop.');
        const data = await response.json();
        setMetabolites(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetabolites();
  }, [slug]);

  const filtered = metabolites.filter((m) => {
    const term = searchTerm.toLowerCase();
    const name = m['Search Name'] || m.compound_name || '';
    const formula = m['Molecular Formula'] || m.molecular_formula || '';
    const func = m.Function || m.function || '';
    const cid = m['PubChem CID'] || m.pubchem_cid || '';
    
    return (
      name.toLowerCase().includes(term) ||
      formula.toLowerCase().includes(term) ||
      func.toLowerCase().includes(term) ||
      cid.toString().includes(term)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    // Helper to get value falling back to old keys if needed
    const getValue = (obj, key) => {
      if (key === 'compound_name') return obj['Search Name'] || obj.compound_name || '';
      if (key === 'pubchem_cid') return obj['PubChem CID'] || obj.pubchem_cid || '';
      if (key === 'molecular_formula') return obj['Molecular Formula'] || obj.molecular_formula || '';
      if (key === 'molecular_weight') return obj['Molecular Weight (g/mol)'] || obj.molecular_weight || '';
      if (key === 'smiles') return obj['SMILES'] || obj.smiles || '';
      if (key === 'inchikey') return obj['InChIKey'] || obj.inchikey || '';
      if (key === 'function') return obj.Function || obj.function || '';
      return obj[key] || '';
    };

    const aVal = getValue(a, sortConfig.key);
    const bVal = getValue(b, sortConfig.key);
    
    if (sortConfig.key === 'molecular_weight' || sortConfig.key === 'pubchem_cid') {
      const numA = Number(aVal) || 0;
      const numB = Number(bVal) || 0;
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
    }
    return sortConfig.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="fade-in metabolites-page">
      <section className="metabolites-header">
        <div className="metabolites-header-inner">
          <Link to={`/crop/${slug}`} className="crop-back-link">
            <ArrowLeft size={18} /> Back to {cropName}
          </Link>
          <h1 className="metabolites-title">
            <FlaskConical size={32} /> {cropName} — Metabolites
          </h1>
          <p className="metabolites-subtitle">
            Browse the metabolite compounds identified in {cropName}
          </p>
        </div>
      </section>

      <section className="metabolites-content">
        <div className="metabolites-toolbar">
          <div className="metabolites-search-wrap">
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)',
              }}
            />
            <input
              type="text"
              placeholder="Search by compound, formula, or function..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="metabolites-search-input"
            />
          </div>
          <div className="metabolites-count">
            {filtered.length} compound{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {loading ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : error ? (
          <div className="no-data-message">{error}</div>
        ) : sorted.length === 0 ? (
          <div className="no-data-message">No metabolites match your search.</div>
        ) : (
          <div className="metabolites-table-wrap">
            <table className="metabolites-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('compound_name')} style={{ cursor: 'pointer' }}>
                    Compound Name {getSortIcon('compound_name')}
                  </th>
                  <th onClick={() => handleSort('pubchem_cid')} style={{ cursor: 'pointer' }}>
                    PubChem CID {getSortIcon('pubchem_cid')}
                  </th>
                  <th onClick={() => handleSort('molecular_formula')} style={{ cursor: 'pointer' }}>
                    Mol. Formula {getSortIcon('molecular_formula')}
                  </th>
                  <th onClick={() => handleSort('molecular_weight')} style={{ cursor: 'pointer' }}>
                    Mol. Weight {getSortIcon('molecular_weight')}
                  </th>
                  <th>SMILES</th>
                  <th>InChIKey</th>
                  <th onClick={() => handleSort('function')} style={{ cursor: 'pointer' }}>
                    Function {getSortIcon('function')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, idx) => {
                  const name = m['Search Name'] || m.compound_name || '—';
                  const cid = m['PubChem CID'] || m.pubchem_cid || '';
                  const formula = m['Molecular Formula'] || m.molecular_formula || '—';
                  const weight = m['Molecular Weight (g/mol)'] || m.molecular_weight || '—';
                  const smiles = m['SMILES'] || m.smiles || '';
                  const inchikey = m['InChIKey'] || m.inchikey || '';
                  const func = m.Function || m.function || '—';
                  
                  return (
                    <tr key={idx}>
                      <td className="metabolites-compound-name">{name}</td>
                      <td>
                        {cid && cid !== 'Not Found' && cid !== 'N/A' ? (
                          <a
                            href={`https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="metabolites-link"
                          >
                            {cid} <ExternalLink size={12} />
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="metabolites-formula">{formula !== 'N/A' ? formula : '—'}</td>
                      <td>{weight !== 'N/A' ? weight : '—'}</td>
                      <td className="metabolites-smiles" title={smiles}>
                        {smiles && smiles !== 'N/A'
                          ? smiles.length > 30
                            ? smiles.slice(0, 30) + '…'
                            : smiles
                          : '—'}
                      </td>
                      <td className="metabolites-inchikey" title={inchikey}>
                        {inchikey && inchikey !== 'N/A'
                          ? inchikey.length > 20
                            ? inchikey.slice(0, 20) + '…'
                            : inchikey
                          : '—'}
                      </td>
                      <td className="metabolites-function">{func}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Metabolites;
