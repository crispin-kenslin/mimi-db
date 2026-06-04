import React, { useState, useEffect } from 'react';
import './DEGTable.css';

function DEGTable({ cropName, stressType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'log2FoldChange', direction: 'desc' });
  const [searchText, setSearchText] = useState('');

  const [showFilters, setShowFilters] = useState(true);
  const [log2FCThreshold, setLog2FCThreshold] = useState(0);
  const [regulation, setRegulation] = useState('all'); // all, up, down
  const [pValueThreshold, setPValueThreshold] = useState(0.05);
  const [padjThreshold, setPadjThreshold] = useState(1);
  const [sequenceModalOpen, setSequenceModalOpen] = useState(false);
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [sequenceError, setSequenceError] = useState('');
  const [selectedGene, setSelectedGene] = useState(null);
  const [sequenceResult, setSequenceResult] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  const sortFields = [
    { key: 'gene', label: 'Gene' },
    { key: 'log2FoldChange', label: 'log2 Fold Change' },
    { key: 'pvalue', label: 'P-value' },
    { key: 'padj', label: 'Adjusted P-value' },
    { key: 'chr', label: 'Chromosome' },
    { key: 'start', label: 'Start Position' },
    { key: 'strand', label: 'Strand' },
    { key: 'product', label: 'Protein' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `/api/transcriptomics/csv/${cropName}/${stressType}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const csvText = await response.text();
        // Safe CSV parser that supports quoted commas without regex backtracking loops.
        const splitCSV = (line) => {
          const cols = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i += 1) {
            const ch = line[i];

            if (ch === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
              } else {
                inQuotes = !inQuotes;
              }
              continue;
            }

            if (ch === ',' && !inQuotes) {
              cols.push(current.trim());
              current = '';
              continue;
            }

            current += ch;
          }

          cols.push(current.trim());
          return cols;
        };

        const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) {
          setData([]);
          return;
        }

        const headerCols = splitCSV(lines[0]).map(h => h.trim().toLowerCase());
        const headerIndex = {};
        headerCols.forEach((h, idx) => { headerIndex[h] = idx; });

        const findIndex = (candidates) => {
          for (const cand of candidates) {
            const key = cand.toLowerCase();
            if (key in headerIndex) return headerIndex[key];
          }
          return -1;
        };

        const idxGene = findIndex(['gene', 'gene_id', 'id', 'name']);
        const idxLog2 = findIndex(['log2foldchange', 'log2 fold change', 'log2fc', 'log2_fold_change']);
        const idxP = findIndex(['pvalue', 'p-value', 'p_value', 'p']);
        const idxPadj = findIndex(['padj', 'adjusted p-value', 'adj p-value', 'padj']);
        const idxChr = findIndex(['chr', 'chromosome', 'seqid']);
        const idxStart = findIndex(['start', 'position_start', 'pos_start']);
        const idxEnd = findIndex(['end', 'position_end', 'pos_end']);
        const idxStrand = findIndex(['strand']);
        const idxProduct = findIndex(['product', 'annotation', 'description']);

        const dataRows = lines.slice(1);
        const parsed = dataRows.map(row => {
          const cols = splitCSV(row);
          const get = (i) => (i >= 0 && i < cols.length ? cols[i].trim() : '');
          return {
            gene: get(idxGene),
            log2FoldChange: parseFloat(get(idxLog2)) || 0,
            pvalue: parseFloat(get(idxP)) || 1,
            padj: parseFloat(get(idxPadj)) || 1,
            chr: get(idxChr),
            start: parseInt(get(idxStart)) || 0,
            end: parseInt(get(idxEnd)) || 0,
            strand: get(idxStrand),
            product: get(idxProduct),
          };
        }).filter(r => r.gene && r.gene.toLowerCase() !== 'gene');
        setData(parsed);
      } catch (err) {
        console.error('Error fetching DEG data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cropName, stressType]);

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const openGeneSequenceModal = async (row) => {
    setSelectedGene(row);
    setSequenceModalOpen(true);
    setSequenceLoading(true);
    setSequenceError('');
    setSequenceResult(null);

    try {
      try {
        const genomesResp = await fetch('/api/tools/genomes');
        if (genomesResp.ok) {
          const json = await genomesResp.json();
          const matching = (json.genomes || []).find(
            (g) => g.crop === cropName || g.crop === cropName.toLowerCase()
          );
          if (!matching || !matching.has_fasta) {
            setSequenceError('No genome FASTA available for this crop; cannot retrieve sequence.');
            setSequenceLoading(false);
            return;
          }
        }
      } catch (precheckErr) {
      }

      const params = new URLSearchParams({
        crop: cropName,
        seqid: row.chr,
        start: String(row.start),
        end: String(row.end),
        strand: row.strand || '+',
        gene: row.gene,
      });

      const response = await fetch(`/api/tools/gene-sequence?${params.toString()}`);
      if (!response.ok) {
        let errMsg = `HTTP ${response.status}`;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await response.json();
            errMsg = j.detail || JSON.stringify(j);
          } else {
            const t = await response.text();
            if (t) errMsg = t;
          }
        } catch (parseErr) {
        }
        throw new Error(errMsg);
      }
      const payload = await response.json();
      setSequenceResult(payload);
    } catch (err) {
      console.error('Error fetching gene sequence:', err);
      setSequenceError(String(err.message || err));
    } finally {
      setSequenceLoading(false);
    }
  };

  const normalizeSequence = (sequence) => (sequence ? sequence.replace(/\s+/g, '') : '');

  const buildFastaText = () => {
    if (!sequenceResult || !selectedGene) return '';
    const header = `>${selectedGene.gene} ${sequenceResult.seqid}:${sequenceResult.start}-${sequenceResult.end}(${sequenceResult.strand})`;
    const seq = normalizeSequence(sequenceResult.sequence || '');
    return `${header}\n${seq}`;
  };

  const copyToClipboard = async (text, label) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${label} copied`);
      setTimeout(() => setCopyStatus(''), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus(''), 1500);
    }
  };

  const filteredData = data.filter(row => {
    // Search filter
    if (searchText && !row.gene.toLowerCase().includes(searchText.toLowerCase()) &&
        !row.product.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    // Log2 fold change filter
    const absLog2FC = Math.abs(row.log2FoldChange);
    if (absLog2FC < log2FCThreshold) {
      return false;
    }

    // Regulation filter
    if (regulation === 'up' && row.log2FoldChange <= 0) {
      return false;
    }
    if (regulation === 'down' && row.log2FoldChange >= 0) {
      return false;
    }

    // P-value filter
    if (row.pvalue > pValueThreshold) {
      return false;
    }

    // Adjusted p-value filter
    if (row.padj > padjThreshold) {
      return false;
    }

    return true;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    const numericKeys = new Set(['log2FoldChange', 'pvalue', 'padj', 'start', 'end']);

    if (numericKeys.has(sortConfig.key)) {
      const aNum = Number(aVal) || 0;
      const bNum = Number(bVal) || 0;
      return sortConfig.direction === 'desc' ? bNum - aNum : aNum - bNum;
    }

    if (typeof aVal === 'number' || typeof bVal === 'number') {
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    }
    return sortConfig.direction === 'desc'
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal));
  });

  if (loading) return <div className="deg-loading">Loading data...</div>;
  if (error) return <div className="deg-error">Error: {error}</div>;

  return (
    <div className="deg-container">
      <div className="deg-controls">
        <div className="deg-search-bar">
          <input
            type="text"
            placeholder="Search gene name or product..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="deg-search"
          />

          <div className="deg-sort-row">
            <div className="sort-group">
              <label htmlFor="deg-sort-key">Sort by</label>
              <select
                id="deg-sort-key"
                value={sortConfig.key}
                onChange={(e) => setSortConfig((prev) => ({ ...prev, key: e.target.value }))}
                className="deg-sort-select"
              >
                {sortFields.map((field) => (
                  <option key={field.key} value={field.key}>{field.label}</option>
                ))}
              </select>
            </div>

            <div className="sort-group">
              <label htmlFor="deg-sort-direction">Order</label>
              <select
                id="deg-sort-direction"
                value={sortConfig.direction}
                onChange={(e) => setSortConfig((prev) => ({ ...prev, direction: e.target.value }))}
                className="deg-sort-select"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="deg-filters">
            <div className="filter-group">
              <label>Regulation Type:</label>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${regulation === 'all' ? 'active' : ''}`}
                  onClick={() => setRegulation('all')}
                >
                  All Genes
                </button>
                <button
                  className={`filter-btn upregulated ${regulation === 'up' ? 'active' : ''}`}
                  onClick={() => setRegulation('up')}
                >
                  ↑ Upregulated
                </button>
                <button
                  className={`filter-btn downregulated ${regulation === 'down' ? 'active' : ''}`}
                  onClick={() => setRegulation('down')}
                >
                  ↓ Downregulated
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>log2 Fold Change ≥ {log2FCThreshold.toFixed(1)}</label>
              <div className="filter-input-row">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={log2FCThreshold}
                  onChange={(e) => setLog2FCThreshold(parseFloat(e.target.value))}
                  className="filter-slider"
                />
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={log2FCThreshold}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!Number.isNaN(value)) {
                      setLog2FCThreshold(clamp(value, 0, 10));
                    }
                  }}
                  className="filter-number-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>P-value ≤ {pValueThreshold.toFixed(4)}</label>
              <div className="filter-input-row">
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.01"
                  value={pValueThreshold}
                  onChange={(e) => setPValueThreshold(parseFloat(e.target.value))}
                  className="filter-slider"
                />
                <input
                  type="number"
                  min="0"
                  max="0.1"
                  step="0.0001"
                  value={pValueThreshold}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!Number.isNaN(value)) {
                      setPValueThreshold(clamp(value, 0, 0.1));
                    }
                  }}
                  className="filter-number-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Adjusted P-value ≤ {padjThreshold.toFixed(4)}</label>
              <div className="filter-input-row">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={padjThreshold}
                  onChange={(e) => setPadjThreshold(parseFloat(e.target.value))}
                  className="filter-slider"
                />
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.0001"
                  value={padjThreshold}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!Number.isNaN(value)) {
                      setPadjThreshold(clamp(value, 0, 1));
                    }
                  }}
                  className="filter-number-input"
                />
              </div>
            </div>

            <button
              className="reset-filters-btn"
              onClick={() => {
                setLog2FCThreshold(0);
                setRegulation('all');
                setPValueThreshold(0.05);
                setPadjThreshold(1);
                setSearchText('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <div className="deg-table-wrapper">
        <table className="deg-table">
          <thead>
            <tr>
              <th>Gene</th>
              <th>log2FC</th>
              <th>p-value</th>
              <th>Adj p-value</th>
              <th>Chromosome Accession</th>
              <th>Position</th>
              <th>Strand</th>
              <th>Product</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} className={row.log2FoldChange > 0 ? 'upregulated' : 'downregulated'}>
                <td className="gene-name">
                  <button
                    type="button"
                    className="gene-link-btn"
                    onClick={() => openGeneSequenceModal(row)}
                    title="Click to view sequence"
                  >
                    {row.gene}
                  </button>
                </td>
                <td className={`fold-change ${row.log2FoldChange > 0 ? 'positive' : 'negative'}`}>
                  {row.log2FoldChange.toFixed(2)}
                </td>
                <td>{row.pvalue < 0.0001 ? row.pvalue.toExponential(2) : row.pvalue.toFixed(4)}</td>
                <td>{row.padj < 0.0001 ? row.padj.toExponential(2) : row.padj.toFixed(4)}</td>
                <td className="chr-col">{row.chr}</td>
                <td className="pos-col">{row.start}-{row.end}</td>
                <td className="strand-col">{row.strand}</td>
                <td className="product-col" title={row.product}>{row.product}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="deg-no-results">No genes match the current filters</div>
      )}

      <div className="deg-footer">
        Showing {sortedData.length} of {data.length} genes
      </div>

      {sequenceModalOpen && (
        <div className="modal-overlay" onClick={() => setSequenceModalOpen(false)}>
          <div className="modal-content gene-seq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Gene Sequence</h2>
              <button className="modal-close" onClick={() => setSequenceModalOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              {selectedGene && (
                <div className="gene-seq-meta">
                  <div><strong>Gene:</strong> {selectedGene.gene}</div>
                  <div><strong>Region:</strong> {selectedGene.chr}:{selectedGene.start}-{selectedGene.end} ({selectedGene.strand})</div>
                </div>
              )}

              {sequenceLoading && <div className="deg-loading">Retrieving sequence...</div>}
              {sequenceError && <div className="deg-error">{sequenceError}</div>}

              {!sequenceLoading && !sequenceError && sequenceResult && (
                <>
                  <div className="gene-seq-meta">
                    <div><strong>Length:</strong> {sequenceResult.length} bp</div>
                  </div>
                  <div className="gene-seq-actions">
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      onClick={() => copyToClipboard(normalizeSequence(sequenceResult.sequence), 'Sequence')}
                    >
                      Copy Sequence
                    </button>
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      onClick={() => copyToClipboard(buildFastaText(), 'FASTA')}
                    >
                      Copy FASTA
                    </button>
                    {copyStatus && <span className="copy-status-text">{copyStatus}</span>}
                  </div>
                  <textarea
                    className="gene-seq-textarea"
                    readOnly
                    value={normalizeSequence(sequenceResult.sequence)}
                    rows={12}
                  />
                  <div className="gene-seq-fasta-title">FASTA Format</div>
                  <textarea
                    className="gene-seq-textarea"
                    readOnly
                    value={buildFastaText()}
                    rows={8}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DEGTable;
