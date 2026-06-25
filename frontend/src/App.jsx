import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Crop from './pages/Crop';
import DEGAnalysis from './pages/DEGAnalysis';
import Search from './pages/Search';
import Tools from './pages/Tools';
import ToolsJBrowse from './pages/ToolsJBrowse';
import ToolsBlast from './pages/ToolsBlast';
import Help from './pages/Help';
import About from './pages/About';
import Stresses from './pages/Stresses';
import Metabolites from './pages/Metabolites';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crop/:slug" element={<Crop />} />
            <Route path="/crop/:slug/metabolites" element={<Metabolites />} />
            <Route path="/crop/:cropSlug/stress/:stressType" element={<DEGAnalysis />} />
            <Route path="/search" element={<Search />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/jbrowse" element={<ToolsJBrowse />} />
            <Route path="/browse" element={<ToolsJBrowse />} />
            <Route path="/tools/blast" element={<ToolsBlast />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/stresses" element={<Stresses />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
