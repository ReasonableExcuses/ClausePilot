import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  PlayCircle,
  UploadCloud,
  Network,
  Clock,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Layers,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { ContractSummary } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [recentContracts, setRecentContracts] = useState<ContractSummary[]>([]);

  useEffect(() => {
    api.fetchContracts().then(setRecentContracts).catch(() => {});
  }, []);

  const handleTryDemo = async () => {
    try {
      setLoadingDemo(true);
      const contract = await api.loadDemoContract();
      navigate(`/contracts/${contract.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to load demo agreement. Ensure backend is running.');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-6 pb-4">
        {/* Subtle Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-900 border border-obsidian-750 text-obsidian-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Innovative Design Project • LegalTech Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter text-white mb-5 leading-[1.08]">
          Turn legal agreements into machine-readable obligations.
        </h1>

        <p className="text-base sm:text-lg text-obsidian-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          ClausePilot parses static contract documents into an actionable obligation graph — identifying who must act, when deadlines occur, what triggers them, and the exact evidence that supports every finding.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6">
          <button
            id="hero-try-demo-btn"
            onClick={handleTryDemo}
            disabled={loadingDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-obsidian-950 font-semibold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {loadingDemo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Demo Agreement...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-obsidian-950" />
                <span>Try Demo Agreement</span>
              </>
            )}
          </button>

          <Link
            id="hero-upload-btn"
            to="/upload"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 hover:border-obsidian-650 text-obsidian-200 font-medium text-sm transition-all"
          >
            <UploadCloud className="w-4 h-4 text-obsidian-400" />
            <span>Upload Agreement (PDF)</span>
          </Link>
        </div>

        <p className="text-[11px] text-obsidian-500">
          ClausePilot is an information-extraction tool and does not provide legal advice.
        </p>
      </div>

      {/* Interactive Gallery Frame Showcase: Static PDF to Structured Obligation */}
      <div className="editorial-card p-6 sm:p-8 bg-obsidian-900 border border-obsidian-750">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-obsidian-750">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-obsidian-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-obsidian-700"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-obsidian-700"></span>
            <span className="text-xs text-obsidian-400 font-mono ml-2">contract_pipeline_preview.json</span>
          </div>
          <span className="text-xs text-obsidian-400 font-mono">100% Explainable Attribution</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Source Contract Excerpt */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 font-medium">
              Source Clause (Raw PDF Text)
            </span>
            <div className="p-5 rounded-xl bg-obsidian-950 border border-obsidian-750 text-xs font-mono leading-relaxed text-obsidian-300">
              <span className="text-obsidian-500 block mb-2">/* Clause 3 — Page 1 */</span>
              "The <strong className="text-sky-300 font-semibold underline decoration-sky-500/40">Tenant</strong> shall pay to the Landlord a monthly rent of <strong className="text-emerald-300 font-semibold underline decoration-emerald-500/40">₹20,000</strong> on or before the <strong className="text-rose-300 font-semibold underline decoration-rose-500/40">5th day of each calendar month</strong> in advance. In the event of default, the Tenant agrees to pay a late payment fee of <strong className="text-amber-300 font-semibold underline decoration-amber-500/40">₹500 per day</strong>."
            </div>
          </div>

          {/* Right: Extracted Structured Obligation Representation */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 font-medium">
              Structured Entity Representation
            </span>
            <div className="p-5 rounded-xl bg-obsidian-850 border border-obsidian-750 text-xs space-y-2 font-mono">
              <div className="flex justify-between py-1 border-b border-obsidian-750/70">
                <span className="text-obsidian-400">Actor (Bound Party):</span>
                <span className="font-semibold text-sky-300">Tenant</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-750/70">
                <span className="text-obsidian-400">Action:</span>
                <span className="font-semibold text-obsidian-100">Pay monthly rent</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-750/70">
                <span className="text-obsidian-400">Amount:</span>
                <span className="font-semibold text-emerald-300">₹20,000 (Monthly)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-obsidian-750/70">
                <span className="text-obsidian-400">Normalized Deadline:</span>
                <span className="font-semibold text-rose-300">Day 5 of every month</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-obsidian-400">Breach Consequence:</span>
                <span className="font-semibold text-amber-300">₹500/day late fee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Editorial Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="editorial-card p-6 bg-obsidian-850 border border-obsidian-750 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-obsidian-900 border border-obsidian-700 flex items-center justify-center text-obsidian-200 mb-4">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Structured Extraction
            </h3>
            <p className="text-xs text-obsidian-400 leading-relaxed">
              Converts unstructured legal language into standardized schemas: Actor, Action, Trigger, Condition, Deadline, and Consequence with transparent confidence metrics.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-obsidian-750 text-[11px] font-mono text-obsidian-400">
            Schema-enforced NLP
          </div>
        </div>

        {/* Card 2 */}
        <div className="editorial-card p-6 bg-obsidian-850 border border-obsidian-750 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-obsidian-900 border border-obsidian-700 flex items-center justify-center text-obsidian-200 mb-4">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Timeline & Reminders
            </h3>
            <p className="text-xs text-obsidian-400 leading-relaxed">
              Distinguishes between monthly recurring schedules, event-driven triggers, and milestone deadlines with proactive notification tracking.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-obsidian-750 text-[11px] font-mono text-obsidian-400">
            Lifecycle tracking
          </div>
        </div>

        {/* Card 3 */}
        <div className="editorial-card p-6 bg-obsidian-850 border border-obsidian-750 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-obsidian-900 border border-obsidian-700 flex items-center justify-center text-obsidian-200 mb-4">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Evidence-Backed Q&A
            </h3>
            <p className="text-xs text-obsidian-400 leading-relaxed">
              Ask natural language questions. Answers are retrieved with strict zero-hallucination verification and cited verbatim with page numbers and clause titles.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-obsidian-750 text-[11px] font-mono text-obsidian-400">
            Transparent citations
          </div>
        </div>
      </div>

      {/* Available Contracts in Workspace (if any) */}
      {recentContracts.length > 0 && (
        <div className="editorial-card p-6 bg-obsidian-900 border border-obsidian-750">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-obsidian-400" />
              <span>Existing Agreements in Workspace</span>
            </h3>
            <span className="text-xs text-obsidian-500 font-mono">{recentContracts.length} document(s)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentContracts.map((c) => (
              <Link
                key={c.id}
                to={`/contracts/${c.id}`}
                className="p-3.5 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-obsidian-750 hover:border-obsidian-650 transition-all flex items-center justify-between group"
              >
                <div className="truncate">
                  <p className="text-xs font-semibold text-obsidian-200 group-hover:text-white truncate">
                    {c.title}
                  </p>
                  <p className="text-[11px] text-obsidian-400 font-mono mt-0.5">
                    {c.clause_count} clauses • {c.obligation_count} obligations
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-obsidian-500 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
