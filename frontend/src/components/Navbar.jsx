import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Leaf, ChevronDown } from 'lucide-react';

const CROP_IMAGES = {
  'Finger Millet': '/images/finger_millet.png',
  'Foxtail Millet': '/images/foxtail_millet.png',
  'Proso Millet': '/images/proso_millet.png',
  'Pearl Millet': '/images/pearl_millet.png',
  'Little Millet': '/images/little_millet.png',
  'Barnyard Millet': '/images/barnyard_millet.png',
};

function Navbar() {
  const location = useLocation();
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get('http://localhost:8000/crops/');
        setCrops(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCrops();
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <span>Tamil Nadu Agricultural University — Bioinformatics Centre</span>
          <span>An Integrative Multi-Omics Resource for Minor Millets</span>
        </div>
      </div>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <div className="navbar-brand-icon">
              <Leaf size={22} />
            </div>
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">MIMI DB</span>
              <span className="navbar-brand-sub">Minor Millets Database</span>
            </div>
          </Link>
          <div className="navbar-links">
            <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>
              Home
            </Link>

            {/* Crops Dropdown */}
            <div className="nav-dropdown">
              <span className={`navbar-link ${location.pathname.startsWith('/crop') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Crops <ChevronDown size={14} />
              </span>
              <div className="nav-dropdown-menu">
                {crops.map((crop) => (
                  <Link to={`/crop/${crop.id}`} key={crop.id} className="nav-dropdown-item">
                    <img
                      src={CROP_IMAGES[crop.name] || '/images/finger_millet.png'}
                      alt={crop.name}
                      style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{crop.name}</div>
                      <div className="nav-dropdown-item-sci">{crop.scientific_name.split(' ').slice(0,2).join(' ')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/search" className={`navbar-link ${location.pathname === '/search' ? 'active' : ''}`}>
              Search
            </Link>

            <Link to="/tools" className={`navbar-link ${location.pathname === '/tools' ? 'active' : ''}`}>
              Tools
            </Link>

            <Link to="/help" className={`navbar-link ${location.pathname === '/help' ? 'active' : ''}`}>
              Help
            </Link>

            <Link to="/about" className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}>
              About
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
