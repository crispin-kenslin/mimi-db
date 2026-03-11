import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Database, Dna, FlaskConical, BarChart3 } from 'lucide-react';

const CROP_IMAGES = {
  'Finger Millet': '/images/finger_millet.png',
  'Foxtail Millet': '/images/foxtail_millet.png',
  'Proso Millet': '/images/proso_millet.png',
  'Pearl Millet': '/images/pearl_millet.png',
  'Little Millet': '/images/little_millet.png',
  'Barnyard Millet': '/images/barnyard_millet.png',
};

/* ---- Animated counter hook ---- */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function AnimatedCounter({ value, suffix = '', label }) {
  const { count, ref } = useCounter(value);
  return (
    <div className="hero-counter" ref={ref}>
      <div className="hero-counter-value">{count.toLocaleString()}{suffix}</div>
      <div className="hero-counter-label">{label}</div>
    </div>
  );
}

function Home() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get('/api/crops/');
        setCrops(response.data);
      } catch (error) {
        console.error("Error fetching crops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  if (loading) return <div className="loader-wrapper"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            MIMI DB — Open Access
          </div>
          <h1 className="hero-title">
            Minor Millets<br />Multi-Omics Database
          </h1>
          <p className="hero-subtitle">
            A comprehensive integrative resource bringing together genomic, transcriptomic,
            and metabolomic data for six minor millet species from all publicly available databases —
            accessible in a single platform.
          </p>
          <div className="hero-counters">
            <AnimatedCounter value={6} label="Millet Species" />
            <AnimatedCounter value={6} label="Reference Genomes" />
            <AnimatedCounter value={8} suffix="+" label="Transcriptome Studies" />
            <AnimatedCounter value={2800} suffix="+" label="Metabolites Catalogued" />
            <AnimatedCounter value={350000} suffix="+" label="Predicted Genes" />
          </div>
        </div>
      </section>

      {/* ===== 6 MILLETS HORIZONTAL ===== */}
      <section className="millets-section">
        <div className="millets-section-title">
          <h2>Explore Minor Millets</h2>
          <p>Click on a species to access its complete multi-omics data</p>
        </div>
        <div className="millets-row">
          {crops.map((crop) => (
            <Link to={`/crop/${crop.id}`} key={crop.id} className="millet-card">
              <div className="millet-card-img-wrap">
                <img
                  src={CROP_IMAGES[crop.name] || '/images/finger_millet.png'}
                  alt={crop.name}
                />
              </div>
              <div className="millet-card-body">
                <div className="millet-card-name">{crop.name}</div>
                <div className="millet-card-sci">
                  {crop.scientific_name.split(' ').slice(0, 2).join(' ')}
                </div>
                <div className="millet-card-arrow">
                  Explore <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <div className="features-grid">
        {[
          { icon: <Database size={22} />, title: 'Genome Assemblies', desc: 'Reference genome assemblies with gene annotations, repeat analysis, and ortholog comparisons from NCBI & Phytozome.' },
          { icon: <Dna size={22} />, title: 'Transcriptomics', desc: 'RNA-Seq experiments under multiple stress conditions with differential expression analysis and top gene tables.' },
          { icon: <FlaskConical size={22} />, title: 'Metabolomics', desc: 'LC-MS/MS and GC-MS metabolite profiling with class distributions, key bioactive compound data from open databases.' },
          { icon: <BarChart3 size={22} />, title: 'Analysis Reports', desc: 'GWAS, phylogenomics, comparative genomics, pangenome construction, and functional enrichment analyses.' },
        ].map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-card-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
