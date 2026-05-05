import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, Dna, ExternalLink, Info, Database, Droplets, Sun, Zap } from 'lucide-react';
import FileListModal from '../components/FileListModal';

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');

const STRESS_ICONS = {
  drought: <Droplets size={32} />,
  heat: <Sun size={32} />,
  salt: <Zap size={32} />,
  salty: <Zap size={32} />,
};

function Crop() {
  const { slug } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stresses, setStresses] = useState([]);
  const [stressesLoading, setStressesLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ cropName: '', dataType: '', title: '' });

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
    const fetchStresses = async () => {
      if (!crop) return;
      try {
        setStressesLoading(true);
        const cropSlug = toSlug(crop.name);
        const response = await axios.get(`/api/transcriptomics/stresses/${cropSlug}`);
        setStresses(response.data);
      } catch (error) {
        console.error('Error fetching stresses:', error);
        setStresses([]);
      } finally {
        setStressesLoading(false);
      }
    };
    fetchStresses();
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
    <div className="fade-in crop-page">
      <FileListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cropName={modalConfig.cropName}
        dataType={modalConfig.dataType}
        title={modalConfig.title}
      />

      {/* Header Section */}
      <section className="crop-header">
        <Link to="/" className="crop-back-link">
          <ArrowLeft size={18} /> Back to Millets
        </Link>
        <h1 className="crop-title">{crop.name}</h1>
        <p className="crop-scientific-name">{crop.scientific_name}</p>
        <p className="crop-description">{crop.description || 'No description available.'}</p>
      </section>

      {/* Quick Access Section */}
      <section className="crop-section quick-access">
        <div className="section-inner">
          <div className="quick-access-grid">
            <a href={cropFtpIndexUrl} className="quick-access-card">
              <div className="card-icon"><Download size={32} /></div>
              <div className="card-content">
                <h3>Download Files</h3>
                <p>Browse all crop data</p>
              </div>
            </a>
            <Link to={`/tools/jbrowse`} className="quick-access-card">
              <div className="card-icon"><Dna size={32} /></div>
              <div className="card-content">
                <h3>Genome Browser</h3>
                <p>Explore JBrowse</p>
              </div>
            </Link>
            <Link to={`/tools/blast`} className="quick-access-card">
              <div className="card-icon"><Database size={32} /></div>
              <div className="card-content">
                <h3>BLAST Search</h3>
                <p>Sequence similarity</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Genomics Section */}
      <section className="crop-section genomics-section">
        <div className="section-inner">
          <h2 className="section-title"><Dna size={24} /> Genomics Data</h2>
          <div className="data-subsection">
            <h3 className="subsection-title">Genome Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Chromosomes</span>
                <span className="info-value">{crop.chromosome_number || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Genome Size</span>
                <span className="info-value">{crop.genome_size_mb || '—'} Mb</span>
              </div>
              <div className="info-item">
                <span className="info-label">Family</span>
                <span className="info-value">{crop.family || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ploidy Level</span>
                <span className="info-value">{crop.ploidy_level || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transcriptomics Section */}
      <section className="crop-section transcriptomics-section">
        <div className="section-inner">
          <h2 className="section-title"><Dna size={24} /> Transcriptomics Data</h2>

          {stressesLoading ? (
            <div className="loader-wrapper"><div className="loader"></div></div>
          ) : stresses.length > 0 ? (
            <div className="stress-cards-grid">
              {stresses.map((stress) => (
                <Link
                  key={stress.type}
                  to={`/crop/${cropSlug}/stress/${stress.type}`}
                  className="stress-card"
                >
                  <div className="stress-icon">
                    {STRESS_ICONS[stress.type] || <Droplets size={32} />}
                  </div>
                  <div className="stress-content">
                    <h3>{stress.name}</h3>
                    <p>View DEG Analysis</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-data-message">No transcriptomics data available for this crop.</div>
          )}
        </div>
      </section>

      {/* Metabolomics Section */}
      <section className="crop-section metabolomics-section">
        <div className="section-inner">
          <div className="section-header">
            <h2 className="section-title">Metabolomics Data</h2>
            <button
              onClick={() => openFileModal('metabolomics', `${crop.name} - Metabolomics files`)}
              className="btn-primary btn-sm"
            >
              <Download size={14} /> Browse Files
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Crop;
