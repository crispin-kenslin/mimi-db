import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, '-');
const IMAGE_BASE = `${import.meta.env.BASE_URL}images`;

const CROP_IMAGES = {
  'Finger Millet': `${IMAGE_BASE}/finger_millet.png`,
  'Foxtail Millet': `${IMAGE_BASE}/foxtail_millet.png`,
  'Proso Millet': `${IMAGE_BASE}/proso_millet.png`,
  'Little Millet': `${IMAGE_BASE}/little_millet.png`,
  'Barnyard Millet': `${IMAGE_BASE}/barnyard_millet.png`,
};

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

function AnimatedCounter({ value, label }) {
  const { count, ref } = useCounter(value);
  return (
    <div className="hero-counter" ref={ref}>
      <div className="hero-counter-value">{count.toLocaleString()}</div>
      <div className="hero-counter-label">{label}</div>
    </div>
  );
}

function Home() {
  const [crops, setCrops] = useState([]);
  const [stats, setStats] = useState({
    millet_species: 0,
    reference_genomes: 0,
    transcriptome_studies: 0,
    metabolites_catalogued: 0,
    predicted_genes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const [cropResponse, statsResponse] = await Promise.all([
          axios.get('/api/crops/'),
          axios.get('/api/stats/overview'),
        ]);
        setCrops(cropResponse.data);
        setStats(statsResponse.data);
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
      <section className="hero-section">
        <div className="hero-inner">
          <h1 className="hero-title">
            Minor Millets<br />Multi-Omics Database
          </h1>
          <p className="hero-subtitle">
            A comprehensive integrative database for the genomic and transcriptomic data for  minor millet species from all publicly available databases —
            accessible in a single platform.
          </p> 
        </div>
      </section>

      <section className="millets-section">
        <div className="millets-section-title">
          <h2>Explore Minor Millets</h2>
          <p>Click on a species to access its genomic and transcriptomic data</p>
        </div>
        <div className="millets-row">
          {crops
            .filter((crop) => crop.name !== 'Pearl Millet')
            .map((crop) => (
              <Link to={`/crop/${toSlug(crop.name)}`} key={crop.id} className="millet-card">
              <div className="millet-card-img-wrap">
                <img
                  src={CROP_IMAGES[crop.name] || `${IMAGE_BASE}/finger_millet.png`}
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

    </div>
  );
}

export default Home;
