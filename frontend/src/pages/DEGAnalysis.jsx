import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import DEGTable from '../components/DEGTable';

function DEGAnalysis() {
  const { cropSlug, stressType } = useParams();
  const [degStats, setDegStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/transcriptomics/csv/${cropSlug}/${stressType}`);
        if (!response.ok) throw new Error('Failed to load data');
        const csvText = await response.text();
        const rows = csvText.trim().split('\n').slice(1);

        const parsed = rows.map(row => {
          const cols = row.split(',');
          return {
            log2FoldChange: parseFloat(cols[1]),
            padj: parseFloat(cols[3]),
          };
        }).filter(r => !isNaN(r.log2FoldChange));

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

  return (
    <div className="deg-analysis-page">
      {/* Header */}
      <section className="deg-header">
        <Link to={`/crop/${cropSlug}`} className="deg-back-link">
          <ArrowLeft size={18} /> Back to {cropName}
        </Link>
        <h1 className="deg-page-title">Differentially Expressed Genes - {stressName}</h1>
        <p className="deg-page-subtitle">Transcriptomics analysis under {stressName} stress</p>
      </section>

      {/* Statistics Section */}
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

      {/* DEG Table Section */}
      <section className="deg-table-section">
        <div className="section-inner">
          <h2 className="section-title">Gene Expression Data</h2>
          <DEGTable cropName={cropSlug} stressType={stressType} />
        </div>
      </section>
    </div>
  );
}

export default DEGAnalysis;
