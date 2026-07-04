import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, ArrowRight, ExternalLink } from 'lucide-react';

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');

function fmt(val, decimals = 3) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(decimals);
}

function fmtPval(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const n = Number(val);
  return n < 0.001 ? n.toExponential(2) : n.toFixed(4);
}

function Search() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('genes');
  const [crops, setCrops] = useState([]);
  const [results, setResults] = useState([]);
  const [geneResults, setGeneResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/crops/').then(r => setCrops(r.data)).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setGeneResults([]);
    setResults([]);
    if (!query.trim()) return;

    if (searchType === 'crops') {
      const q = query.toLowerCase();
      const filtered = crops.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.scientific_name.toLowerCase().includes(q) ||
        (c.common_names && c.common_names.toLowerCase().includes(q)) ||
        (c.family && c.family.toLowerCase().includes(q))
      );
      setResults(filtered);
    } else {
      try {
        setLoading(true);
        const response = await axios.get('/api/search/genes', {
          params: { q: query.trim(), limit: 500 },
        });
        setGeneResults(response.data.results || []);
      } catch (error) {
        console.error('Error searching genes:', error);
        setGeneResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const noResults =
    searched && query &&
    ((searchType === 'crops' && results.length === 0) ||
     (searchType === 'genes' && !loading && geneResults.length === 0));

  return (
    <div className="fade-in">
      {/* Full-width wrapper — no max-width constraint */}
      <div style={{ padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>
            <span className="section-title-bar"></span>
            Database Search
          </div>
          <p className="section-subtitle">
            Search crops by name · Search genes / proteins across all stress experiments
          </p>
        </div>

        <div className="info-panel" style={{ marginBottom: '2rem' }}>
          <div className="info-panel-body">
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <Filter size={18} color="var(--primary-600)" />
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['crops', 'genes'].map(type => (
                    <label key={type} style={{ display: 'flex', gap: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500, color: '#111' }}>
                      <input
                        type="radio"
                        value={type}
                        checked={searchType === type}
                        onChange={(e) => setSearchType(e.target.value)}
                        style={{ accentColor: 'var(--primary-600)' }}
                      />
                      {type === 'crops' ? 'Crops' : 'Genes / Proteins'}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="search-wrap" style={{ flex: 1 }}>
                  <SearchIcon size={18} className="search-wrap-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={
                      searchType === 'crops'
                        ? 'Search crop name, scientific name…'
                        : 'Search gene ID or protein name…'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="info-panel">
            <div className="info-panel-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)', fontSize: '1rem' }}>
              Searching across all stress experiments…
            </div>
          </div>
        )}

        {/* No results */}
        {noResults && !loading && (
          <div className="info-panel">
            <div className="info-panel-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)', fontSize: '1rem' }}>
              No results found for "<strong>{query}</strong>".
            </div>
          </div>
        )}

        {/* Crop results */}
        {searchType === 'crops' && results.length > 0 && (
          <div>
            <p style={{ fontSize: '1rem', color: '#111', marginBottom: '1rem' }}>
              Showing <strong>{results.length}</strong> crop{results.length > 1 ? 's' : ''}
            </p>
            {results.map(crop => (
              <Link to={`/crop/${toSlug(crop.name)}`} key={crop.id} className="crop-card" style={{ marginBottom: '1rem', flexDirection: 'row' }}>
                <div className="crop-card-header" style={{ flex: 1 }}>
                  <div className="crop-card-name">{crop.name}</div>
                  <div className="crop-card-sci">{crop.scientific_name}</div>
                </div>
                <div className="crop-card-footer" style={{ borderTop: 'none', borderLeft: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center' }}>
                  <span className="crop-card-btn">View <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Gene / Protein results */}
        {searchType === 'genes' && geneResults.length > 0 && (
          <div>
            <p style={{ fontSize: '1rem', color: '#111', marginBottom: '1rem' }}>
              Showing <strong>{geneResults.length}</strong> result{geneResults.length > 1 ? 's' : ''}
              {geneResults.length === 500 && <span style={{ color: 'var(--accent-amber)', marginLeft: '0.5rem' }}>(limit reached — refine your query)</span>}
            </p>
            <div className="info-panel">
              <div className="info-panel-body" style={{ overflowX: 'auto', padding: 0 }}>
                <table className="data-table" style={{ fontSize: '1rem', color: '#111', tableLayout: 'auto', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ color: '#111', fontSize: '1rem' }}>Crop</th>
                      <th style={{ color: '#111', fontSize: '1rem' }}>Stress</th>
                      <th style={{ color: '#111', fontSize: '1rem' }}>Gene ID</th>
                      <th style={{ color: '#111', fontSize: '1rem' }}>Log2FC</th>
                      <th style={{ color: '#111', fontSize: '1rem' }}>P-value</th>
                      <th style={{ color: '#111', fontSize: '1rem' }}>Protein</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geneResults.map((row, idx) => {
                      const cropLabel = row.crop
                        .split('-')
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ');
                      const stressLabel = row.stress.charAt(0).toUpperCase() + row.stress.slice(1);
                      const degUrl = `/crop/${row.crop}/stress/${row.stress}`;

                      return (
                        <tr key={idx}>
                          <td style={{ color: '#111', whiteSpace: 'nowrap' }}>
                            <Link to={`/crop/${row.crop}`} className="btn-outline btn-sm" style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}>
                              {cropLabel}
                            </Link>
                          </td>
                          <td style={{ color: '#111', whiteSpace: 'nowrap' }}>
                            <Link to={degUrl} style={{ color: 'var(--primary-600)', fontWeight: 500, textDecoration: 'underline' }}>
                              {stressLabel}
                            </Link>
                          </td>
                          <td style={{ fontFamily: 'monospace', color: '#111', whiteSpace: 'nowrap' }}>
                            <Link
                              to={degUrl}
                              title={`Open ${stressLabel} DEG page`}
                              style={{ color: 'var(--primary-700)', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              {row.gene_id || '—'}
                              <ExternalLink size={11} />
                            </Link>
                          </td>
                          <td style={{
                            color: row.log2fc > 1 ? '#10b981' : row.log2fc < -1 ? '#ef4444' : '#111',
                            fontWeight: (row.log2fc > 1 || row.log2fc < -1) ? 600 : 400,
                            whiteSpace: 'nowrap'
                          }}>
                            {fmt(row.log2fc)}
                          </td>
                          <td style={{ color: '#111', whiteSpace: 'nowrap' }}>{fmtPval(row.pvalue)}</td>
                          {/* Protein: full text, wraps naturally */}
                          <td style={{ color: '#111', wordBreak: 'break-word', minWidth: 260 }}>
                            {row.protein || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
