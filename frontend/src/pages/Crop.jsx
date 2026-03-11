import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, RadialBarChart, RadialBar
} from 'recharts';
import {
  ArrowLeft, ExternalLink, Download, Dna, FlaskConical,
  BarChart3, FileText, Info, BookOpen
} from 'lucide-react';

const PIE_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#14b8a6', '#0d9488'];

function Crop() {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        const response = await axios.get(`/api/crops/${id}`);
        setCrop(response.data);
      } catch (error) {
        console.error("Error fetching crop data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCropData();
  }, [id]);

  if (loading) return <div className="loader-wrapper"><div className="loader"></div></div>;
  if (!crop) return <div className="section"><p>Crop not found.</p></div>;

  const tabs = [
    { key: 'Overview', icon: <Info size={16} /> },
    { key: 'Genomics', icon: <Dna size={16} /> },
    { key: 'Transcriptomics', icon: <BookOpen size={16} /> },
    { key: 'Metabolomics', icon: <FlaskConical size={16} /> },
    { key: 'Analyses', icon: <BarChart3 size={16} /> },
  ];

  const geno = crop.genomics?.[0];

  return (
    <div className="fade-in">
      {/* Crop Header */}
      <section className="hero-section" style={{ padding: '2.5rem 2rem 2rem' }}>
        <div className="hero-inner">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-200)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back to all millets
          </Link>
          <h1 className="hero-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
            {crop.name}
          </h1>
          <p style={{ fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--primary-300)', marginBottom: '1.5rem' }}>
            {crop.scientific_name}
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{crop.chromosome_number || '—'}</div>
              <div className="hero-stat-label">Chromosomes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{crop.genome_size_mb || '—'} <span style={{ fontSize: '0.9rem' }}>Mb</span></div>
              <div className="hero-stat-label">Genome Size</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{geno?.transcriptome_summary?.total_genes?.toLocaleString() || '—'}</div>
              <div className="hero-stat-label">Predicted Genes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{crop.protein_content_percent || '—'}%</div>
              <div className="hero-stat-label">Protein Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-inner">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {t.icon} {t.key}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="section fade-in" key={activeTab}>

        {/* =================== OVERVIEW =================== */}
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Description */}
            <div className="info-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="info-panel-header"><FileText size={16} /> Description</div>
              <div className="info-panel-body">
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--gray-700)' }}>{crop.description}</p>
              </div>
            </div>

            {/* Botanical Classification */}
            <div className="info-panel">
              <div className="info-panel-header"><Info size={16} /> Botanical & Genetic Profile</div>
              <div className="info-panel-body">
                <div className="info-row"><span className="info-label">Family</span><span className="info-value">{crop.family}</span></div>
                <div className="info-row"><span className="info-label">Scientific Name</span><span className="info-value" style={{ fontStyle: 'italic' }}>{crop.scientific_name}</span></div>
                <div className="info-row"><span className="info-label">Common Names</span><span className="info-value">{crop.common_names || '—'}</span></div>
                <div className="info-row"><span className="info-label">Growth Habit</span><span className="info-value">{crop.growth_habit || '—'}</span></div>
                <div className="info-row"><span className="info-label">Origin</span><span className="info-value">{crop.origin || '—'}</span></div>
                <div className="info-row"><span className="info-label">Chromosomes (2n)</span><span className="info-value">{crop.chromosome_number || '—'}</span></div>
                <div className="info-row"><span className="info-label">Ploidy Level</span><span className="info-value">{crop.ploidy_level || '—'}</span></div>
                <div className="info-row"><span className="info-label">Genome Size</span><span className="info-value">{crop.genome_size_mb ? `${crop.genome_size_mb} Mb` : '—'}</span></div>
                <div className="info-row"><span className="info-label">Maturation</span><span className="info-value">{crop.maturation_days ? `${crop.maturation_days} days` : '—'}</span></div>
                <div className="info-row"><span className="info-label">Drought Tolerance</span><span className="info-value"><span className="badge badge-green">{crop.drought_tolerance || '—'}</span></span></div>
              </div>
            </div>

            {/* Nutritional Profile */}
            <div className="info-panel">
              <div className="info-panel-header"><FlaskConical size={16} /> Nutritional Profile (per 100 g grain)</div>
              <div className="info-panel-body">
                <div className="info-row"><span className="info-label">Protein</span><span className="info-value">{crop.protein_content_percent ? `${crop.protein_content_percent} g` : '—'}</span></div>
                <div className="info-row"><span className="info-label">Dietary Fiber</span><span className="info-value">{crop.fiber_content_percent ? `${crop.fiber_content_percent} g` : '—'}</span></div>
                <div className="info-row"><span className="info-label">Calcium</span><span className="info-value">{crop.calcium_mg_per_100g ? `${crop.calcium_mg_per_100g} mg` : '—'}</span></div>
                <div className="info-row"><span className="info-label">Iron</span><span className="info-value">{crop.iron_mg_per_100g ? `${crop.iron_mg_per_100g} mg` : '—'}</span></div>
                <div className="info-row"><span className="info-label">Key Highlights</span><span className="info-value">{crop.nutritional_highlights || '—'}</span></div>
                {crop.reference_link && (
                  <div className="info-row">
                    <span className="info-label">External Reference</span>
                    <span className="info-value">
                      <a href={crop.reference_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                        <ExternalLink size={14} /> NCBI Genome
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Nutritional Bar Chart */}
            <div className="chart-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="chart-panel-header">
                <span className="chart-panel-title">Nutritional Composition (per 100 g)</span>
              </div>
              <div className="chart-panel-body" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Protein (g)', value: crop.protein_content_percent || 0, fill: '#059669' },
                    { name: 'Fiber (g)', value: crop.fiber_content_percent || 0, fill: '#10b981' },
                    { name: 'Calcium (mg/10)', value: (crop.calcium_mg_per_100g || 0) / 10, fill: '#34d399' },
                    { name: 'Iron (mg)', value: crop.iron_mg_per_100g || 0, fill: '#6ee7b7' },
                  ]} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.85rem' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {[0,1,2,3].map(i => <Cell key={i} fill={['#059669','#10b981','#34d399','#6ee7b7'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* =================== GENOMICS =================== */}
        {activeTab === 'Genomics' && (
          <div>
            {crop.genomics.length > 0 ? crop.genomics.map((g, idx) => (
              <div key={idx}>
                {/* Assembly Info */}
                <div className="info-panel" style={{ marginBottom: '1.5rem' }}>
                  <div className="info-panel-header"><Dna size={16} /> Genome Assembly — {g.genome_version}</div>
                  <div className="info-panel-body">
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                      {g.assembly_link && <a href={g.assembly_link} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm"><Download size={14} /> Assembly</a>}
                      {g.annotation_link && <a href={g.annotation_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm"><ExternalLink size={14} /> Annotation</a>}
                      {g.fasta_link && <a href={g.fasta_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm"><Download size={14} /> FASTA</a>}
                      {g.gff_link && <a href={g.gff_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm"><Download size={14} /> GFF</a>}
                    </div>
                  </div>
                </div>

                {/* Genome Stats */}
                {g.stats && (
                  <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                    {Object.entries(g.stats).map(([k, v]) => (
                      <div className="stat-card" key={k}>
                        <div className="stat-card-label">{k.replace(/_/g, ' ')}</div>
                        <div className="stat-card-value">{typeof v === 'number' ? v.toLocaleString() : v}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gene Summary Chart */}
                {g.transcriptome_summary && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="chart-panel">
                      <div className="chart-panel-header">
                        <span className="chart-panel-title">Gene Summary</span>
                      </div>
                      <div className="chart-panel-body" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(g.transcriptome_summary).map(([k, v]) => ({
                            name: k.replace(/_/g, ' '),
                            value: v
                          }))} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} angle={-20} textAnchor="end" height={60} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.85rem' }} />
                            <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Repeat Content Pie */}
                    {g.repeat_content && (
                      <div className="chart-panel">
                        <div className="chart-panel-header">
                          <span className="chart-panel-title">Repeat Element Composition</span>
                        </div>
                        <div className="chart-panel-body" style={{ height: 300 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={Object.entries(g.repeat_content).map(([k, v]) => ({
                                  name: k.replace(/_pct/g, '').replace(/_/g, ' '),
                                  value: v
                                }))}
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {Object.keys(g.repeat_content).map((_, i) => (
                                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: '0.85rem' }} />
                              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Gene Families */}
                {g.gene_families && (
                  <div className="chart-panel" style={{ marginBottom: '1.5rem' }}>
                    <div className="chart-panel-header">
                      <span className="chart-panel-title">Gene Family Distribution</span>
                    </div>
                    <div className="chart-panel-body" style={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(g.gene_families).map(([k, v]) => ({
                          name: k.replace(/_/g, ' '),
                          count: v
                        }))} layout="vertical" barSize={20}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={160} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.85rem' }} />
                          <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Ortholog Stats */}
                {g.ortholog_stats && (
                  <div className="chart-panel">
                    <div className="chart-panel-header">
                      <span className="chart-panel-title">Orthologous Gene Clusters (shared genes with other cereals)</span>
                    </div>
                    <div className="chart-panel-body" style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(g.ortholog_stats).map(([k, v]) => ({
                          name: k.replace('shared_with_', '').replace('unique_to_', 'Unique (').replace(/_/g, ' '),
                          value: v
                        }))} barSize={45}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.85rem' }} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {Object.keys(g.ortholog_stats).map((k, i) => (
                              <Cell key={i} fill={k.startsWith('unique') ? '#d97706' : PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )) : <p>No genomics data available for this species.</p>}
          </div>
        )}

        {/* =================== TRANSCRIPTOMICS =================== */}
        {activeTab === 'Transcriptomics' && (
          <div>
            {crop.transcriptomics.length > 0 ? (
              <>
                {/* DEG Summary Chart */}
                <div className="chart-panel" style={{ marginBottom: '1.5rem' }}>
                  <div className="chart-panel-header">
                    <span className="chart-panel-title">Differentially Expressed Genes — All Experiments</span>
                  </div>
                  <div className="chart-panel-body" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={crop.transcriptomics.map(t => ({
                        name: `${t.experiment_id} (${t.tissue})`,
                        upregulated: t.stats?.upregulated || 0,
                        downregulated: t.stats?.downregulated || 0,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '0.85rem' }} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Bar dataKey="upregulated" fill="#059669" name="Upregulated" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="downregulated" fill="#dc2626" name="Downregulated" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Individual Experiments */}
                {crop.transcriptomics.map((trx, idx) => (
                  <div className="experiment-card" key={idx}>
                    <div className="experiment-card-header">
                      <span className="experiment-card-title">{trx.experiment_id}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="badge badge-green">{trx.tissue}</span>
                        <span className="badge badge-amber">{trx.condition}</span>
                      </div>
                    </div>
                    <div className="experiment-card-body">
                      <div className="experiment-meta">
                        <div className="experiment-meta-item">Platform: <strong>{trx.platform || '—'}</strong></div>
                        <div className="experiment-meta-item">Replicates: <strong>{trx.replicate_count || '—'}</strong></div>
                        <div className="experiment-meta-item">Total Reads: <strong>{trx.stats?.total_reads_million ? `${trx.stats.total_reads_million}M` : '—'}</strong></div>
                        <div className="experiment-meta-item">Mapped: <strong>{trx.stats?.mapped_pct ? `${trx.stats.mapped_pct}%` : '—'}</strong></div>
                        <div className="experiment-meta-item">Total DEGs: <strong>{trx.stats?.degs_total?.toLocaleString() || '—'}</strong></div>
                      </div>

                      {trx.data_link && (
                        <a href={trx.data_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                          <ExternalLink size={14} /> View on NCBI SRA
                        </a>
                      )}

                      {/* Top DEGs Table */}
                      {trx.top_genes && Array.isArray(trx.top_genes) && trx.top_genes.length > 0 && (
                        <>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                            Top Differentially Expressed Genes
                          </h4>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Gene ID</th>
                                <th>Gene Name</th>
                                <th>Log₂FC</th>
                                <th>Function</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trx.top_genes.map((gene, gi) => (
                                <tr key={gi}>
                                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{gene.gene_id}</td>
                                  <td><strong>{gene.name}</strong></td>
                                  <td>
                                    <span className={`badge ${gene.log2fc > 0 ? 'badge-green' : 'badge-red'}`}>
                                      {gene.log2fc > 0 ? '↑' : '↓'} {gene.log2fc}
                                    </span>
                                  </td>
                                  <td>{gene.function}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : <p>No transcriptomics data available for this species.</p>}
          </div>
        )}

        {/* =================== METABOLOMICS =================== */}
        {activeTab === 'Metabolomics' && (
          <div>
            {crop.metabolomics.length > 0 ? (
              <>
                {/* Metabolite Class Distribution Chart */}
                {crop.metabolomics[0].stats && (
                  <div className="chart-panel" style={{ marginBottom: '1.5rem' }}>
                    <div className="chart-panel-header">
                      <span className="chart-panel-title">Metabolite Class Distribution ({crop.metabolomics[0].tissue} tissue)</span>
                    </div>
                    <div className="chart-panel-body" style={{ height: 360 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(crop.metabolomics[0].stats).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v }))}
                            innerRadius={70}
                            outerRadius={130}
                            paddingAngle={2}
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {Object.keys(crop.metabolomics[0].stats).map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: '0.85rem' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Individual Experiments */}
                {crop.metabolomics.map((met, idx) => (
                  <div className="experiment-card" key={idx}>
                    <div className="experiment-card-header">
                      <span className="experiment-card-title">{met.experiment_id}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-green">{met.tissue}</span>
                        <span className="badge badge-blue">{met.metabolites_count} metabolites</span>
                      </div>
                    </div>
                    <div className="experiment-card-body">
                      <div className="experiment-meta">
                        <div className="experiment-meta-item">Platform: <strong>{met.platform || '—'}</strong></div>
                        <div className="experiment-meta-item">Total Metabolites: <strong>{met.metabolites_count}</strong></div>
                      </div>

                      {met.data_link && (
                        <a href={met.data_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                          <ExternalLink size={14} /> View on MetaboLights
                        </a>
                      )}

                      {met.top_metabolites && Array.isArray(met.top_metabolites) && met.top_metabolites.length > 0 && (
                        <>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                            Key Metabolites Identified
                          </h4>
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Metabolite</th>
                                <th>Class</th>
                                <th>Abundance</th>
                                <th>Bioactivity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {met.top_metabolites.map((m, mi) => (
                                <tr key={mi}>
                                  <td><strong>{m.name}</strong></td>
                                  <td><span className="badge badge-green">{m.class}</span></td>
                                  <td>{m.abundance}</td>
                                  <td style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{m.bioactivity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : <p>No metabolomics data available for this species.</p>}
          </div>
        )}

        {/* =================== ANALYSES =================== */}
        {activeTab === 'Analyses' && (
          <div>
            {crop.analyses.length > 0 ? crop.analyses.map((ana, idx) => (
              <div className="experiment-card" key={idx}>
                <div className="experiment-card-header">
                  <span className="experiment-card-title">{ana.analysis_type}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {ana.method && <span className="badge badge-blue">{ana.method}</span>}
                    {ana.date_performed && <span className="badge badge-amber">{ana.date_performed}</span>}
                  </div>
                </div>
                <div className="experiment-card-body">
                  <p style={{ color: 'var(--gray-700)', lineHeight: 1.7, marginBottom: '1rem' }}>{ana.result_summary}</p>
                  {ana.result_link && (
                    <a href={ana.result_link} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                      <ExternalLink size={14} /> View Publication / Resource
                    </a>
                  )}
                </div>
              </div>
            )) : <p>No analysis reports available for this species.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Crop;
