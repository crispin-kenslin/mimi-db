import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Dna, ExternalLink } from 'lucide-react';

function ToolsJBrowse() {
  const [searchParams] = useSearchParams();
  const [genomes, setGenomes] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(searchParams.get('crop') || '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genomeRes] = await Promise.all([
          axios.get('/api/tools/genomes'),
        ]);
        setGenomes(genomeRes.data.genomes || []);
      } catch (error) {
        console.error('Error fetching JBrowse data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedCrop && genomes.length > 0) {
      const firstWithFasta = genomes.find((g) => g.has_fasta);
      if (firstWithFasta) setSelectedCrop(firstWithFasta.crop);
    }
  }, [genomes, selectedCrop]);

  const jbrowseUrl = useMemo(() => {
    if (!selectedCrop) return '';
    const backendBase = `${window.location.protocol}//${window.location.hostname}:8000`;
    const configUrl = `${backendBase}/tools/jbrowse/${selectedCrop}/config.json`;
    return `${backendBase}/jbrowse/index.html?config=${encodeURIComponent(configUrl)}`;
  }, [selectedCrop]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>JBrowse Genome Browser</h1>
        <p>Powered by your local JBrowse web build and configured dynamically from crop FASTA/GFF files.</p>
      </div>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/tools" className="btn-outline btn-sm">
            <ArrowLeft size={14} /> Back to Tools
          </Link>
        </div>

        <div className="info-panel" style={{ marginBottom: '1rem' }}>
          <div className="info-panel-header"><Dna size={16} /> JBrowse Setup</div>
          <div className="info-panel-body">
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Crop</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}
              >
                {genomes.filter((g) => g.has_fasta).map((g) => (
                  <option key={g.crop} value={g.crop}>{g.crop}</option>
                ))}
              </select>
              {selectedCrop && (
                <a href={jbrowseUrl} target="_blank" rel="noreferrer" className="btn-outline btn-sm">
                  <ExternalLink size={14} /> Open in New Tab
                </a>
              )}
            </div>
          </div>
        </div>

        {selectedCrop && (
          <iframe
            title="JBrowse"
            src={jbrowseUrl}
            style={{ width: '100%', height: 620, border: '1px solid var(--gray-200)', borderRadius: 10, background: '#fff' }}
          />
        )}
      </section>
    </div>
  );
}

export default ToolsJBrowse;
