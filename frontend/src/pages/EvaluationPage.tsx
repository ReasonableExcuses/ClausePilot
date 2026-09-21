import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Cpu,
  Target,
  FileCheck,
  Search,
  Users,
  ShieldCheck,
  BookOpen,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { EvaluationMetrics } from '../types';
import { api } from '../services/api';

export const EvaluationPage: React.FC = () => {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchEvaluationMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-editorial">
        <Loader2 className="w-7 h-7 text-obsidian-300 animate-spin mb-3" />
        <p className="text-xs text-obsidian-400 font-mono">Computing benchmark evaluation metrics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12 text-obsidian-400 text-sm font-editorial">
        Failed to load evaluation dataset metrics.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-editorial">
      {/* Page Header */}
      <div className="editorial-panel p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-obsidian-800 border border-obsidian-750 text-obsidian-300 text-xs font-mono mb-2.5">
            <Cpu className="w-3.5 h-3.5 text-obsidian-300" />
            <span>Academic IDP Benchmark Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-[-0.03em]">
            Prototype Evaluation & Empirical Metrics
          </h1>
          <p className="text-xs sm:text-sm text-obsidian-400 mt-1">
            Standardized evaluation against the curated <strong>{metrics.dataset_name}</strong> ({metrics.total_samples} annotated samples).
          </p>
        </div>

        <div className="text-right text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-800 border border-obsidian-750 text-obsidian-200 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Benchmark Status: Verified
          </span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Clause Detection */}
        <div className="editorial-card p-5 rounded-2xl border border-obsidian-750 space-y-3">
          <div className="flex items-center justify-between text-xs text-obsidian-400">
            <span className="font-mono uppercase tracking-wider text-[10px]">Clause Detection</span>
            <FileCheck className="w-4 h-4 text-obsidian-300" />
          </div>
          <div className="text-3xl font-semibold text-white font-mono tracking-tight">
            {Math.round(metrics.clause_detection.f1_score * 100)}%
          </div>
          <div className="space-y-1.5 text-xs text-obsidian-400 pt-2 border-t border-obsidian-750 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Precision:</span>
              <strong className="text-obsidian-200">{(metrics.clause_detection.precision * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Recall:</span>
              <strong className="text-obsidian-200">{(metrics.clause_detection.recall * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Detected / Target:</span>
              <strong className="text-obsidian-200">
                {metrics.clause_detection.detected_count} / {metrics.clause_detection.ground_truth_count}
              </strong>
            </div>
          </div>
        </div>

        {/* Metric 2: Obligation Extraction */}
        <div className="editorial-card p-5 rounded-2xl border border-obsidian-750 space-y-3">
          <div className="flex items-center justify-between text-xs text-obsidian-400">
            <span className="font-mono uppercase tracking-wider text-[10px]">Field Extraction</span>
            <Target className="w-4 h-4 text-obsidian-300" />
          </div>
          <div className="text-3xl font-semibold text-white font-mono tracking-tight">
            {Math.round(metrics.obligation_extraction.overall_f1 * 100)}%
          </div>
          <div className="space-y-1.5 text-xs text-obsidian-400 pt-2 border-t border-obsidian-750 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Actor Accuracy:</span>
              <strong className="text-obsidian-200">{(metrics.obligation_extraction.actor_accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Action Accuracy:</span>
              <strong className="text-obsidian-200">{(metrics.obligation_extraction.action_accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Deadline Extraction:</span>
              <strong className="text-obsidian-200">{(metrics.obligation_extraction.deadline_accuracy * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        {/* Metric 3: Evidence Retrieval */}
        <div className="editorial-card p-5 rounded-2xl border border-obsidian-750 space-y-3">
          <div className="flex items-center justify-between text-xs text-obsidian-400">
            <span className="font-mono uppercase tracking-wider text-[10px]">Evidence Retrieval</span>
            <Search className="w-4 h-4 text-obsidian-300" />
          </div>
          <div className="text-3xl font-semibold text-white font-mono tracking-tight">
            {Math.round(metrics.evidence_retrieval.precision_at_1 * 100)}%
          </div>
          <div className="space-y-1.5 text-xs text-obsidian-400 pt-2 border-t border-obsidian-750 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Precision @ 1:</span>
              <strong className="text-obsidian-200">{(metrics.evidence_retrieval.precision_at_1 * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Precision @ 3:</span>
              <strong className="text-obsidian-200">{(metrics.evidence_retrieval.precision_at_3 * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>MRR:</span>
              <strong className="text-obsidian-200">{(metrics.evidence_retrieval.mean_reciprocal_rank * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        {/* Metric 4: Human-in-the-Loop & QA */}
        <div className="editorial-card p-5 rounded-2xl border border-obsidian-750 space-y-3">
          <div className="flex items-center justify-between text-xs text-obsidian-400">
            <span className="font-mono uppercase tracking-wider text-[10px]">Correction & QA</span>
            <ShieldCheck className="w-4 h-4 text-obsidian-300" />
          </div>
          <div className="text-3xl font-semibold text-emerald-400 font-mono tracking-tight">
            {(metrics.human_correction_rate * 100).toFixed(1)}%
          </div>
          <div className="space-y-1.5 text-xs text-obsidian-400 pt-2 border-t border-obsidian-750 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Correction Rate:</span>
              <strong className="text-emerald-400">{(metrics.human_correction_rate * 100).toFixed(1)}% (Low)</strong>
            </div>
            <div className="flex justify-between">
              <span>QA Accuracy:</span>
              <strong className="text-obsidian-200">{(metrics.qa_performance.answer_correctness * 100).toFixed(1)}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Attribution Accuracy:</span>
              <strong className="text-obsidian-200">{(metrics.qa_performance.evidence_attribution_accuracy * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Inspection Table */}
      <div className="editorial-panel p-6 rounded-2xl border border-obsidian-750 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-obsidian-300" />
              <span>Annotated Benchmark Dataset Samples</span>
            </h3>
            <p className="text-xs text-obsidian-400 mt-0.5">
              Ground-truth representations utilized for measuring system accuracy and generalization.
            </p>
          </div>
          <span className="text-xs text-obsidian-400 font-mono">
            Displaying {metrics.benchmark_samples.length} of {metrics.total_samples}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-obsidian-750 bg-obsidian-950/60 text-obsidian-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Clause</th>
                <th className="py-3 px-3">Party (Actor)</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Normalized Deadline</th>
                <th className="py-3 px-3">Trigger</th>
                <th className="py-3 px-3">Evidence Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-750/60 font-editorial">
              {metrics.benchmark_samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-obsidian-850/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-obsidian-300 text-[11px] whitespace-nowrap">
                    {sample.id}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-obsidian-200 whitespace-nowrap">
                    Clause {sample.clause_number}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-obsidian-800 border border-obsidian-750 text-obsidian-200 text-[11px] font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      {sample.actor}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-white">
                    {sample.action}
                    {sample.amount && (
                      <span className="ml-1.5 text-[10px] font-mono text-emerald-400">
                        ({sample.amount})
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-300 text-[11px] whitespace-nowrap">
                    {sample.normalized_deadline}
                  </td>
                  <td className="py-2.5 px-3 text-obsidian-300 text-[11px]">
                    {sample.trigger || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-obsidian-400 italic text-[11px] max-w-xs truncate font-mono-code">
                    "{sample.evidence_text}"
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
