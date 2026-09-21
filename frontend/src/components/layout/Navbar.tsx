import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, UploadCloud, PlayCircle, BarChart3, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleTryDemo = async () => {
    try {
      setLoadingDemo(true);
      const contract = await api.loadDemoContract();
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      console.error('Failed to load demo contract', err);
      alert('Error loading demo agreement. Please check backend server.');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-obsidian-950/85 backdrop-blur-md border-b border-obsidian-750/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-obsidian-100 group-hover:border-obsidian-600 transition-colors shadow-sm">
              <Compass className="w-4 h-4 text-obsidian-200 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold tracking-tight text-white">
                ClausePilot
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-obsidian-850 border border-obsidian-750 text-[11px] font-medium text-obsidian-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                v1.0 IDP
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            <Link
              to="/upload"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                location.pathname === '/upload'
                  ? 'bg-obsidian-850 text-white border border-obsidian-700'
                  : 'text-obsidian-400 hover:text-white hover:bg-obsidian-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload</span>
            </Link>

            <Link
              to="/evaluation"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                location.pathname === '/evaluation'
                  ? 'bg-obsidian-850 text-white border border-obsidian-700'
                  : 'text-obsidian-400 hover:text-white hover:bg-obsidian-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Benchmark</span>
            </Link>

            {/* Solid White Primary Button */}
            <button
              id="try-demo-nav-btn"
              onClick={handleTryDemo}
              disabled={loadingDemo}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-neutral-200 text-obsidian-950 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ml-1"
            >
              {loadingDemo ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading Demo...</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-3.5 h-3.5 text-obsidian-950" />
                  <span>Try Demo Agreement</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
