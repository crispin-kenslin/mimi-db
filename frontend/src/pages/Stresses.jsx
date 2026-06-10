import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

function Stresses() {
  const [stresses, setStresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const fetchStresses = async () => {
      try {
        const response = await fetch('/api/stats/stresses');
        if (response.ok) {
          const data = await response.json();
          setStresses(data);
        }
      } catch (error) {
        console.error('Error fetching stresses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStresses();
  }, []);

  const filteredStresses = stresses.filter(s => 
    s.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <div className="section-title-bar"></div>
            Available Stress Conditions
          </h2>
          <p className="section-subtitle">
            Explore all transcriptomics stress conditions available across different millet species.
          </p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: '2rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
        <input 
          type="text" 
          placeholder="Search stresses or crops..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-300)', fontSize: '0.9rem' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading stresses...</div>
      ) : (
        <div className="stresses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredStresses.length > 0 ? (
            filteredStresses.map((stress, idx) => {
              const cropSlug = stress.crop.toLowerCase().replace(/ /g, '-');
              const stressSlug = stress.condition.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
              
              // Generate dynamic colors based on condition name
              const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
              const colorCode = colors[stress.condition.length % colors.length];
              
              return (
                <div key={idx} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--gray-200)', borderTop: `4px solid ${colorCode}`, boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stress-card">
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{stress.condition}</h3>
                    <div style={{ display: 'inline-block', background: `${colorCode}15`, color: colorCode, padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      <i>{stress.crop}</i>
                    </div>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                    <Link 
                      to={`/crop/${cropSlug}/stress/${stressSlug}`}
                      style={{ background: colorCode, color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none' }}
                    >
                      View DEG Analysis
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', background: 'var(--white)', borderRadius: 'var(--radius-lg)' }}>
              No stress conditions found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Stresses;
