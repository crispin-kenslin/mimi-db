import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import KronaChart from '../components/KronaChart';
import { ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

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
    metabolites_count: 0,
    genes_identified: 0,
  });
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cropResponse = await axios.get('/api/crops/');
        setCrops(cropResponse.data);

        const statsResponse = await axios.get('/api/stats/overview');
        setStats(statsResponse.data);

        try {
          const chartsResponse = await axios.get('/api/stats/charts');
          setChartData(chartsResponse.data);
        } catch (chartError) {
          console.error("Charts API failed:", chartError);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loader-wrapper"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      <section className="hero-section">
        <div className="hero-inner">
          <p className="hero-subtitle">Welcome to</p>
          <h1 className="hero-title">
            Minor Millets DataBase
          </h1>
          <p className="hero-subtitle">
            A comprehensive integrative database for the genomic, transcriptomic and metabolomic data for  minor millet species from public databases -
            accessible in a single platform.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <AnimatedCounter value={stats.num_crops || 0} label="Millet Species" />
            </div>
            <Link to="/stresses" style={{ textDecoration: 'none' }}>
              <div className="hero-stat" style={{ cursor: 'pointer' }}>
                <AnimatedCounter value={stats.num_stresses || 0} label="Stress Conditions" />
              </div>
            </Link>
            <div className="hero-stat">
              <AnimatedCounter value={stats.genes_identified || 0} label="Genes Identified" />
            </div>
            <div className="hero-stat">
              <AnimatedCounter value={stats.metabolites_count || 0} label="Metabolites" />
            </div>
          </div>

          {chartData && (
            <div className="stats-charts-section fade-in">
              <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="chart-title">Genes Identified per Species</h3>
                <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData.genes_per_crop.filter(crop => crop.genes > 0)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#000000ff', fontSize: 16 }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar dataKey="genes" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        {chartData.genes_per_crop.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={[
                              '#4E79A7',
                              '#F28E2B',
                              '#E15759',
                              '#76B7B2',
                              '#59A14F',
                              '#EDC948',
                              '#B07AA1',
                              '#FF9DA7',
                              '#9C755F',
                              '#BAB0AC',
                            ][index % 10]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="chart-card">
                <h3 className="chart-title">Gene distribution across species</h3>

                <div className="chart-inner">
                  <KronaChart data={chartData.krona} />
                </div>
              </div>
              <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 className="chart-title">Percentage of Differentially Expressed Genes by Stress</h3>
                <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData.deg_distribution}
                      margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e5e7eb"
                      />

                      <XAxis
                        dataKey="stress"
                        tick={{ fill: '#000000ff', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />

                      <Legend />

                      <Bar
                        dataKey="up_pct"
                        stackId="deg"
                        fill="#10b981"
                        name="Upregulated"
                      />

                      <Bar
                        dataKey="down_pct"
                        stackId="deg"
                        fill="#ef4444"
                        name="Downregulated"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="millets-section">
        <div className="millets-section-title">
          <h2>Explore Minor Millets</h2>
          <p>Click on a species to access its Omics data</p>
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
                    <i>{crop.scientific_name.split(' ').slice(0, 2).join(' ')}</i>
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
