import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { ContractDashboard } from './pages/ContractDashboard';
import { EvaluationPage } from './pages/EvaluationPage';
import { ParticleBackground } from './components/common/ParticleBackground';

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-obsidian-950 text-obsidian-100 selection:bg-neutral-800 selection:text-white font-editorial relative overflow-x-hidden">
        {/* Subtle Canvas Particle Layer in Background */}
        <ParticleBackground />

        {/* Foreground Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/contracts/:id" element={<ContractDashboard />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
