import React from 'react';
import { Obligation } from '../../types';
import { BookOpen } from 'lucide-react';

interface EvidenceViewerProps {
  obligation: Obligation;
  clauseNumber?: string;
  clauseTitle?: string;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  obligation,
  clauseNumber,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-obsidian-400">
        <span className="flex items-center gap-1.5 font-medium text-obsidian-200">
          <BookOpen className="w-3.5 h-3.5 text-obsidian-400" />
          <span>Verbatim Contract Evidence</span>
        </span>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-obsidian-300">
          Source: Page {obligation.source_page || 1}
          {clauseNumber ? `, Clause ${clauseNumber}` : ''}
        </span>
      </div>

      {/* Verbatim quote */}
      <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 text-xs sm:text-sm leading-relaxed text-obsidian-200 font-mono">
        "{obligation.evidence_text}"
      </div>

      {/* Structured Semantic Breakdown */}
      <div className="p-3.5 rounded-xl bg-obsidian-900 border border-obsidian-750 space-y-2.5">
        <span className="text-[10px] font-mono font-medium text-obsidian-500 uppercase tracking-wider block">
          Parsed Entity Tokens
        </span>

        <div className="flex flex-wrap gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-obsidian-200 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span className="text-obsidian-400">Actor:</span> {obligation.actor}
          </div>

          <div className="px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-obsidian-200 flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-obsidian-400">Action:</span> {obligation.action}
          </div>

          {obligation.amount && (
            <div className="px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-emerald-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-obsidian-400">Amount:</span> {obligation.amount}
            </div>
          )}

          {obligation.normalized_deadline && (
            <div className="px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-rose-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span className="text-obsidian-400">Deadline:</span> {obligation.normalized_deadline}
            </div>
          )}

          {obligation.condition && (
            <div className="px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-amber-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-obsidian-400">Condition:</span> {obligation.condition}
            </div>
          )}

          {obligation.consequence && (
            <div className="px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-red-300 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              <span className="text-obsidian-400">Consequence:</span> {obligation.consequence}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
