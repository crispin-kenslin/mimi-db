import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, ArrowRight } from 'lucide-react';

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');

function Search() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('crops');
  const [crops, setCrops] = useState([]);
  const [results, setResults] = useState([]);
  const [geneResults, setGeneResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get('/api/crops/');
        setCrops(response.data);
      } catch (error) {
        console.error("Error fetching crops for search:", error);
      }
    };
    fetchCrops();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(true);
    setGeneResults([]);
    if (!query) {
      setResults([]);
      return;
    }

    if (searchType === 'crops') {
      const filtered = crops.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.scientific_name.toLowerCase().includes(query.toLowerCase()) ||
        (c.common_names && c.common_names.toLowerCase().includes(query.toLowerCase())) ||
        (c.family && c.family.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
    } else {
      setResults([]);
      try {
        setLoading(true);
        const response = await axios.get('/api/search/genes', {
          params: { q: query, limit: 200 },
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

  return (
    <div className="fade-in">
      <section className="section" style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="section-title" style={{ marginBottom: '0.5rem' }}>
            <span className="section-title-bar"></span>
            Database Search
          </div>
          <p className="section-subtitle">Query crops by name, scientific name, or common names</p>
        </div>

        <div className="info-panel" style={{ marginBottom: '2rem' }}>
          <div className="info-panel-body">
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <Filter size={18} color="var(--primary-600)" />
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['crops', 'genes'].map(type => (
                    <label key={type} style={{ display: 'flex', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--gray-700)' }}>
                      <input
                        type="radio"
                        value={type}
                        checked={searchType === type}
                        onChange={(e) => setSearchType(e.target.value)}
                        style={{ accentColor: 'var(--primary-600)' }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
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
                    placeholder={`Search ${searchType}...`}
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

        {searched && query && results.length === 0 && searchType === 'crops' && (
          <div className="info-panel">
            <div className="info-panel-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
              No matching crops found for "{query}".
            </div>
          </div>
        )}

        {searched && query && searchType === 'genes' && loading && (
          <div className="info-panel">
            <div className="info-panel-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
              Searching gene annotations...
            </div>
          </div>
        )}

        {searched && query && searchType === 'genes' && !loading && geneResults.length === 0 && (
          <div className="info-panel">
            <div className="info-panel-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
              No matching gene entries found for "{query}".
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Showing <strong>{results.length}</strong> result{results.length > 1 ? 's' : ''}
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

        {searchType === 'genes' && geneResults.length > 0 && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Showing <strong>{geneResults.length}</strong> gene hit{geneResults.length > 1 ? 's' : ''}
            </p>
            <div className="info-panel">
              <div className="info-panel-body" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Gene ID</th>
                      <th>Gene Name</th>
                      <th>Location</th>
                      <th>Strand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geneResults.map((gene, index) => (
                      <tr key={`${gene.crop}-${gene.gene_id || index}-${index}`}>
                        <td>
                          <Link to={`/crop/${gene.crop}`} className="btn-outline btn-sm" style={{ display: 'inline-flex' }}>
                            {gene.crop}
                          </Link>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{gene.gene_id || '—'}</td>
                        <td>{gene.gene_name || '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{gene.seqid}:{gene.start}-{gene.end}</td>
                        <td>{gene.strand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Search;
