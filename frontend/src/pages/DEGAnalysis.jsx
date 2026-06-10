import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Plot from 'react-plotly.js';
import DEGTable from '../components/DEGTable';
import SequenceModal from '../components/SequenceModal';

function DEGAnalysis() {
  const { cropSlug, stressType } = useParams();
  const [degStats, setDegStats] = useState(null);
  const [plotData, setPlotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sequenceModalOpen, setSequenceModalOpen] = useState(false);
  const [selectedGene, setSelectedGene] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [cropSlug, stressType]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/transcriptomics/csv/${cropSlug}/${stressType}`);
        if (!response.ok) throw new Error('Failed to load data');
        const csvText = await response.text();
        const splitCSV = (line) => {
          const cols = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
              else { inQuotes = !inQuotes; }
              continue;
            }
            if (ch === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
            current += ch;
          }
          cols.push(current.trim());
          return cols;
        };

        const lines = csvText.trim().split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) return;

        const headerCols = splitCSV(lines[0]).map(h => h.trim().toLowerCase());
        const headerIndex = {};
        headerCols.forEach((h, idx) => { headerIndex[h] = idx; });
        const findIndex = (cands) => {
          for (const cand of cands) { if (cand.toLowerCase() in headerIndex) return headerIndex[cand.toLowerCase()]; }
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
          const get = (i) => (i >= 0 && i < cols.length ? cols[i] : '');
          
          const log2FoldChange = parseFloat(get(idxLog2));
          const pvalue = parseFloat(get(idxP));
          const padj = parseFloat(get(idxPadj));
          
          let status = 'Not Significant';
          let color = '#9ca3af'; // gray
          
          if (padj < 0.05) {
            if (log2FoldChange > 1) {
              status = 'Upregulated';
              color = '#10b981'; // green
            } else if (log2FoldChange < -1) {
              status = 'Downregulated';
              color = '#ef4444'; // red
            }
          }
          
          return {
            geneId: get(idxGene),
            log2FoldChange,
            pvalue,
            padj,
            negLog10Padj: padj > 0 ? -Math.log10(padj) : 0,
            status,
            color,
            chr: get(idxChr),
            start: parseInt(get(idxStart)) || 0,
            end: parseInt(get(idxEnd)) || 0,
            strand: get(idxStrand) || '+',
            product: get(idxProduct)
          };
        }).filter(r => !isNaN(r.log2FoldChange));
        
        setPlotData(parsed);

        const totalGenes = parsed.length;
        const upregulated = parsed.filter(r => r.log2FoldChange > 1).length;
        const downregulated = parsed.filter(r => r.log2FoldChange < -1).length;
        const significant = parsed.filter(r => r.padj < 0.05).length;

        setDegStats({
          total: totalGenes,
          upregulated,
          downregulated,
          significant,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [cropSlug, stressType]);

  const cropName = cropSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const stressName = stressType.charAt(0).toUpperCase() + stressType.slice(1);
  const pct = (value, total) => (total > 0 ? ((value / total) * 100).toFixed(1) : '0.0');

  const handlePlotClick = (data) => {
    if (data && data.points && data.points.length > 0) {
      const pointIndex = data.points[0].pointIndex;
      const clickedGene = plotData[pointIndex];
      if (clickedGene) {
        setSelectedGene({
          gene: clickedGene.geneId,
          chr: clickedGene.chr,
          start: clickedGene.start,
          end: clickedGene.end,
          strand: clickedGene.strand
        });
        setSequenceModalOpen(true);
      }
    }
  };

  return (
    <div className="deg-analysis-page">
      <section className="deg-header">
        <Link to={`/crop/${cropSlug}`} className="deg-back-link">
          <ArrowLeft size={18} /> Back to {cropName}
        </Link>
        <h1 className="deg-page-title">Differentially Expressed Genes - {stressName}</h1>
        <p className="deg-page-subtitle">Transcriptomics analysis under {stressName} stress</p>
      </section>

      <section className="deg-stats-section">
        <div className="section-inner">
          {loading ? (
            <div className="loader-wrapper"><div className="loader"></div></div>
          ) : degStats ? (
            <div className="deg-stats-grid">
              <div className="deg-stat-card">
                <div className="stat-content">
                  <div className="stat-value">{degStats.total}</div>
                  <div className="stat-label">Total Genes</div>
                </div>
              </div>

              <div className="deg-stat-card upregulated">
                <div className="stat-content">
                  <div className="stat-value">{degStats.upregulated}</div>
                  <div className="stat-label">Upregulated</div>
                  <div className="stat-percent">
                    {pct(degStats.upregulated, degStats.total)}%
                  </div>
                </div>
              </div>

              <div className="deg-stat-card downregulated">
                <div className="stat-content">
                  <div className="stat-value">{degStats.downregulated}</div>
                  <div className="stat-label">Downregulated</div>
                  <div className="stat-percent">
                    {pct(degStats.downregulated, degStats.total)}%
                  </div>
                </div>
              </div>

              <div className="deg-stat-card significant">
                <div className="stat-content">
                  <div className="stat-value">{degStats.significant}</div>
                  <div className="stat-label">Significant (padj &lt; 0.05)</div>
                  <div className="stat-percent">
                    {pct(degStats.significant, degStats.total)}%
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {!loading && plotData.length > 0 && (
        <section className="deg-volcano-section">
          <div className="section-inner">
            <h2 className="section-title">Volcano Plot (Click genes on the plot to view their sequence)</h2>
            <div className="volcano-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Plot
                data={[
                  {
                    x: plotData.map(d => d.log2FoldChange),
                    y: plotData.map(d => d.negLog10Padj),
                    text: plotData.map(d => `<b>${d.geneId}</b><br>Product: ${d.product}<br>Log2FC: ${d.log2FoldChange.toFixed(2)}<br>padj: ${d.padj.toExponential(2)}<br>Status: ${d.status}`),
                    mode: 'markers',
                    type: 'scatter',
                    hoverinfo: 'text',
                    marker: {
                      color: plotData.map(d => d.color),
                      size: 7,
                      opacity: 0.85
                    }
                  }
                ]}
                layout={{
                  autosize: true,
                  hovermode: 'closest',
                  xaxis: {
                    title: 'Log2 Fold Change',
                    zeroline: true,
                    zerolinecolor: '#e5e7eb',
                    zerolinewidth: 2,
                    gridcolor: '#f3f4f6'
                  },
                  yaxis: {
                    title: '-Log10(padj)',
                    zeroline: true,
                    zerolinecolor: '#e5e7eb',
                    zerolinewidth: 2,
                    gridcolor: '#f3f4f6'
                  },
                  margin: { t: 40, r: 40, b: 60, l: 60 },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                  showlegend: false
                }}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true, displayModeBar: true }}
                onClick={handlePlotClick}
              />
            </div>
            <div className="volcano-legend" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></span> Upregulated</div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></span> Downregulated</div>
              <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#9ca3af' }}></span> Not Significant</div>
            </div>
          </div>
        </section>
      )}

      <section className="deg-table-section">
        <div className="section-inner">
          <h2 className="section-title">Gene Expression Data</h2>
          <DEGTable cropName={cropSlug} stressType={stressType} />
        </div>
      </section>

      <SequenceModal
        isOpen={sequenceModalOpen}
        onClose={() => setSequenceModalOpen(false)}
        selectedGene={selectedGene}
        cropName={cropSlug}
      />
    </div>
  );
}

export default DEGAnalysis;
