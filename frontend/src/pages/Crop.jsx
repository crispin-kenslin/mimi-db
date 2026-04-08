import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Dna, ExternalLink, Info } from 'lucide-react';
import FileListModal from '../components/FileListModal';

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');

function Crop() {
  const { slug } = useParams();
  const [crop, setCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [genomicsTab, setGenomicsTab] = useState('genomics');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ cropName: '', dataType: '', title: '' });
  const [genomeInfo, setGenomeInfo] = useState(null);

  useEffect(() => {
    const fetchCropData = async () => {
      try {
        const response = await axios.get(`/api/crops/slug/${slug}`);
        setCrop(response.data);
      } catch (error) {
        console.error('Error fetching crop data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCropData();
  }, [slug]);

  useEffect(() => {
    const fetchGenomeInfo = async () => {
      if (!crop?.name) return;
      try {
        const cropSlug = toSlug(crop.name);
        const response = await axios.get(`/api/tools/jbrowse/${cropSlug}`);
        setGenomeInfo(response.data);
      } catch {
        setGenomeInfo(null);
      }
    };
    fetchGenomeInfo();
  }, [crop]);

  const openFileModal = (dataType, title) => {
    const cropSlug = toSlug(crop.name);
    setModalConfig({ cropName: cropSlug, dataType, title });
    setModalOpen(true);
  };

  if (loading) return <div className="loader-wrapper"><div className="loader"></div></div>;
  if (!crop) return <div className="section"><p>Crop not found.</p></div>;

  const cropSlug = toSlug(crop.name);
  const cropFtpIndexUrl = `/api/files/ftp/${cropSlug}`;

  return (
    <div className="fade-in">
      <FileListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cropName={modalConfig.cropName}
        dataType={modalConfig.dataType}
        title={modalConfig.title}
      />

      <section className="hero-section" style={{ padding: '2.5rem 2rem 2rem' }}>
        <div className="hero-inner">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-200)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} /> Back to all millets
          </Link>
          <h1 className="hero-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{crop.name}</h1>
          <p style={{ fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--primary-300)', marginBottom: '1.5rem' }}>{crop.scientific_name}</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{crop.chromosome_number || '—'}</div>
              <div className="hero-stat-label">Chromosomes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{crop.genome_size_mb || '—'}</div>
              <div className="hero-stat-label">Genome Size (Mb)</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">{genomeInfo?.tracks?.length || 0}</div>
              <div className="hero-stat-label">Annotation Tracks</div>
            </div>
          </div>
        </div>
      </section>

      <div className="tabs-container">
        <div className="tabs-inner">
          {['Overview', 'Genomics'].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="section fade-in" key={activeTab}>
        {activeTab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            <div className="info-panel">
              <div className="info-panel-header"><Info size={16} /> Description</div>
              <div className="info-panel-body">
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--gray-700)' }}>{crop.description || 'No description available.'}</p>
              </div>
            </div>

            <div className="info-panel">
              <div className="info-panel-header"><Dna size={16} /> Botanical and Genome Profile</div>
              <div className="info-panel-body">
                <div className="info-row"><span className="info-label">Family</span><span className="info-value">{crop.family || '—'}</span></div>
                <div className="info-row"><span className="info-label">Ploidy</span><span className="info-value">{crop.ploidy_level || '—'}</span></div>
                <div className="info-row"><span className="info-label">Common Names</span><span className="info-value">{crop.common_names || '—'}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Genomics' && (
          <div>
            <div className="info-panel" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', border: '2px solid var(--primary-200)' }}>
              <div className="info-panel-header" style={{ background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} /> Downloads and Genome Browser
              </div>
              <div className="info-panel-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href={cropFtpIndexUrl} className="btn-outline btn-sm"><ExternalLink size={14} /> Open Crop File Index</a>
                <Link to={`/tools/jbrowse?crop=${cropSlug}`} className="btn-primary btn-sm"><Dna size={14} /> Open JBrowse</Link>
                <Link to={`/tools/blast?crop=${cropSlug}`} className="btn-outline btn-sm"><Dna size={14} /> Open BLAST</Link>
              </div>
            </div>

            <div className="tabs-inner" style={{ marginBottom: '1rem' }}>
              {['genomics', 'transcriptomics', 'metabolomics', 'other'].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${genomicsTab === tab ? 'active' : ''}`}
                  onClick={() => setGenomicsTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="info-panel">
              <div className="info-panel-header"><Download size={16} /> {genomicsTab.charAt(0).toUpperCase() + genomicsTab.slice(1)} Files</div>
              <div className="info-panel-body">
                <p style={{ marginBottom: '1rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                  Browse and download all files from the {genomicsTab} directory for {crop.name}.
                </p>
                <button
                  onClick={() => openFileModal(genomicsTab, `${crop.name} - ${genomicsTab} files`)}
                  className="btn-primary btn-sm"
                >
                  <Download size={14} /> Browse {genomicsTab} files
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Crop;
