import React from 'react';
import { ShieldCheck, BookOpen, GitBranch, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-obsidian-750/70 bg-obsidian-950 py-10 text-obsidian-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Subtle Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-obsidian-900 border border-obsidian-750 flex items-start gap-3.5">
          <ShieldCheck className="w-4 h-4 text-obsidian-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1">
            <span className="font-semibold text-obsidian-200">Legal Information Notice</span>
            <p className="text-obsidian-400 leading-relaxed">
              ClausePilot is an information-extraction and document-intelligence system developed for an academic university Innovative Design Project. It converts contractual text into structured representations with explainable source attribution. It does not provide legal counsel, legal advice, or court outcome predictions.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-obsidian-500 pt-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-obsidian-300">ClausePilot</span>
            <span>—</span>
            <span>Intelligent Contract Obligation Extraction and Tracking System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/evaluation" className="hover:text-obsidian-200 transition-colors flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Benchmark Evaluation</span>
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-obsidian-200 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>API Specification</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
