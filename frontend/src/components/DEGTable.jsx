import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import './DEGTable.css';

function DEGTable({ cropName, stressType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'log2FoldChange', direction: 'desc' });
  const [searchText, setSearchText] = useState('');

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [log2FCThreshold, setLog2FCThreshold] = useState(0);
  const [regulation, setRegulation] = useState('all'); // all, up, down
  const [pValueThreshold, setPValueThreshold] = useState(0.05);
  const [padjThreshold, setPadjThreshold] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `/api/transcriptomics/csv/${cropName}/${stressType}`;
        console.log('Fetching from:', url);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').slice(1);
        const parsed = rows.map(row => {
          const cols = row.split(',');
          return {
            gene: cols[0],
            log2FoldChange: parseFloat(cols[1]),
            pvalue: parseFloat(cols[2]),
            padj: parseFloat(cols[3]),
            chr: cols[4],
            start: cols[5],
            end: cols[6],
            strand: cols[7],
            product: cols[8] || '',
          };
        }).filter(r => r.gene && r.gene !== 'gene');
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Apply all filters
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
    if (typeof aVal === 'number') {
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    }
    return sortConfig.direction === 'desc'
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal));
  });

  const downregulated = data.filter(r => r.log2FoldChange < -1).length;
  const upregulated = data.filter(r => r.log2FoldChange > 1).length;

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
          <button
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            ⚙️ {showFilters ? 'Hide' : 'Show'} Filters
          </button>
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
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={log2FCThreshold}
                onChange={(e) => setLog2FCThreshold(parseFloat(e.target.value))}
                className="filter-slider"
              />
            </div>

            <div className="filter-group">
              <label>P-value ≤ {pValueThreshold.toFixed(4)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pValueThreshold}
                onChange={(e) => setPValueThreshold(parseFloat(e.target.value))}
                className="filter-slider"
              />
            </div>

            <div className="filter-group">
              <label>Adjusted P-value ≤ {padjThreshold.toFixed(4)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={padjThreshold}
                onChange={(e) => setPadjThreshold(parseFloat(e.target.value))}
                className="filter-slider"
              />
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
              <th className="sortable" onClick={() => handleSort('gene')}>
                Gene {sortConfig.key === 'gene' && (sortConfig.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </th>
              <th className="sortable" onClick={() => handleSort('log2FoldChange')}>
                log2FC {sortConfig.key === 'log2FoldChange' && (sortConfig.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </th>
              <th className="sortable" onClick={() => handleSort('pvalue')}>
                p-value {sortConfig.key === 'pvalue' && (sortConfig.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </th>
              <th className="sortable" onClick={() => handleSort('padj')}>
                Adj p-value {sortConfig.key === 'padj' && (sortConfig.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </th>
              <th className="sortable" onClick={() => handleSort('chr')}>
                Chromosome {sortConfig.key === 'chr' && (sortConfig.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </th>
              <th>Position</th>
              <th className="sortable" onClick={() => handleSort('strand')}>
                Strand {sortConfig.key === 'strand' && (sortConfig.direction === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
              </th>
              <th>Product</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} className={row.log2FoldChange > 0 ? 'upregulated' : 'downregulated'}>
                <td className="gene-name">{row.gene}</td>
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
    </div>
  );
}

export default DEGTable;
