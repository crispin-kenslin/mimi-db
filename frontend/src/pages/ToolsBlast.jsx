import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

function ToolsBlast() {
  const [searchParams] = useSearchParams();
  const [genomes, setGenomes] = useState([]);
  const initialCrop = searchParams.get('crop');
  const [selectedCrops, setSelectedCrops] = useState(initialCrop ? [initialCrop] : []);
  const [sequence, setSequence] = useState('');
  const [blastLoading, setBlastLoading] = useState(false);
  const [blastError, setBlastError] = useState('');
  const [blastResult, setBlastResult] = useState(null);

  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        const response = await axios.get('/api/tools/genomes');
        setGenomes(response.data.genomes || []);
      } catch (error) {
        console.error('Error fetching genomes:', error);
      }
    };
    fetchGenomes();
  }, []);

  const runBlast = async (e) => {
    e.preventDefault();
    setBlastLoading(true);
    setBlastError('');
    setBlastResult(null);

    try {
      const response = await axios.post('/api/tools/blast', {
        sequence,
        max_target_seqs: 25,
        evalue: 1e-3,
        crops: selectedCrops.length > 0 ? selectedCrops : null,
      });
      setBlastResult(response.data);
    } catch (error) {
      const message = error?.response?.data?.detail || 'BLAST failed.';
      setBlastError(message);
    } finally {
      setBlastLoading(false);
    }
  };

  const toggleCrop = (crop) => {
    setSelectedCrops((prev) => {
      if (prev.includes(crop)) {
        return prev.filter((c) => c !== crop);
      }
      return [...prev, crop];
    });
  };

  const fastaCrops = genomes.filter((g) => g.has_fasta).map((g) => g.crop);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>BLAST Search</h1>
        <p>Run BLASTn against one crop genome or all available crop genomes.</p>
      </div>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/tools" className="btn-outline btn-sm">
            <ArrowLeft size={14} /> Back to Tools
          </Link>
        </div>

        <div className="info-panel">
          <div className="info-panel-header"><Search size={16} /> BLAST Query</div>
          <div className="info-panel-body">
            <form onSubmit={runBlast}>
              <div style={{ marginBottom: '0.7rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Search scope
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--gray-300)', borderRadius: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedCrops.length === 0}
                      onChange={() => setSelectedCrops([])}
                    />
                    All crops
                  </label>
                  {fastaCrops.map((crop) => (
                    <label key={crop} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={selectedCrops.includes(crop)}
                        onChange={() => toggleCrop(crop)}
                      />
                      {crop}
                    </label>
                  ))}
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Query sequence (FASTA or raw nucleotide sequence)
              </label>
              <textarea
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                rows={8}
                required
                style={{ width: '100%', border: '1px solid var(--gray-300)', borderRadius: 10, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}
                placeholder=">query\nATGCT..."
              />
              <div style={{ marginTop: '0.75rem' }}>
                <button className="btn-primary" type="submit" disabled={blastLoading}>
                  {blastLoading ? 'Running BLAST...' : 'Run BLAST'}
                </button>
              </div>
            </form>

            {blastError && (
              <div className="info-panel" style={{ marginTop: '1rem', borderLeft: '4px solid var(--accent-red)' }}>
                <div className="info-panel-body" style={{ color: 'var(--accent-red)' }}>{blastError}</div>
              </div>
            )}

            {blastResult && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.6rem' }}>
                  Scope: <strong>{Array.isArray(blastResult.scope) ? blastResult.scope.join(', ') : blastResult.scope}</strong> | Task: <strong>{blastResult.task}</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.75rem' }}>
                  Query length: <strong>{blastResult.query_length}</strong> bp | Total hits: <strong>{blastResult.total_hits}</strong>
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Subject</th>
                        <th>Gene ID</th>
                        <th>Gene Name</th>
                        <th>Function</th>
                        <th>% Identity</th>
                        <th>Align Len</th>
                        <th>E-value</th>
                        <th>Bit score</th>
                        <th>Subject Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blastResult.results.map((row, idx) => (
                        <tr key={`${row.crop}-${row.sseqid}-${idx}`}>
                          <td>{row.crop}</td>
                          <td style={{ fontFamily: 'monospace' }}>{row.sseqid}</td>
                          <td style={{ fontFamily: 'monospace' }}>{row.gene_id || '-'}</td>
                          <td>{row.gene_name || '-'}</td>
                          <td>{row.function || '-'}</td>
                          <td>{row.pident.toFixed(2)}</td>
                          <td>{row.length}</td>
                          <td>{row.evalue.toExponential(2)}</td>
                          <td>{row.bitscore.toFixed(2)}</td>
                          <td style={{ fontFamily: 'monospace' }}>{row.sstart}-{row.send}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ToolsBlast;
