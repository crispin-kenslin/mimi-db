import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, ArrowRight } from 'lucide-react';

function Search() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('crops');
  const [crops, setCrops] = useState([]);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get('http://localhost:8000/crops/');
        setCrops(response.data);
      } catch (error) {
        console.error("Error fetching crops for search:", error);
      }
    };
    fetchCrops();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearched(true);
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
                  {['crops', 'genes', 'metabolites'].map(type => (
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

        {searched && searchType !== 'crops' && (
          <div className="info-panel" style={{ borderLeft: '4px solid var(--accent-amber)', marginBottom: '1.5rem' }}>
            <div className="info-panel-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                <strong>Note:</strong> Gene-level and metabolite-level search is under active development.
                Please browse individual crop pages to explore detailed genomics and metabolomics data.
              </p>
            </div>
          </div>
        )}

        {searched && query && results.length === 0 && searchType === 'crops' && (
          <div className="info-panel">
            <div className="info-panel-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
              No matching crops found for "{query}".
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Showing <strong>{results.length}</strong> result{results.length > 1 ? 's' : ''}
            </p>
            {results.map(crop => (
              <Link to={`/crop/${crop.id}`} key={crop.id} className="crop-card" style={{ marginBottom: '1rem', flexDirection: 'row' }}>
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
      </section>
    </div>
  );
}

export default Search;
