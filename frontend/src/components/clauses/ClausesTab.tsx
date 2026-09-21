import React, { useState } from 'react';
import { Search, Layers, AlertTriangle, FileText, ArrowRight, X } from 'lucide-react';
import { Clause, Obligation } from '../../types';

interface ClausesTabProps {
  clauses: Clause[];
  obligations: Obligation[];
  onSelectObligation?: (obligation: Obligation) => void;
}

export const ClausesTab: React.FC<ClausesTabProps> = ({
  clauses,
  obligations,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClause, setSelectedClause] = useState<Clause | null>(null);

  const filteredClauses = clauses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clause_number.includes(searchTerm)
  );

  const getClauseObligations = (clauseId: string, clauseNum: string) => {
    return obligations.filter(
      (o) => o.clause_id === clauseId || o.object?.includes(clauseNum)
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-obsidian-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="clause-search-input"
            type="text"
            placeholder="Search clause title or text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-obsidian-900 border border-obsidian-750 text-xs text-white placeholder-obsidian-500 focus:outline-none focus:border-obsidian-600 transition-colors font-mono"
          />
        </div>
        <span className="text-[11px] text-obsidian-400 font-mono">
          Showing {filteredClauses.length} of {clauses.length} clauses
        </span>
      </div>

      {/* Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClauses.map((clause) => {
          const clauseObls = getClauseObligations(clause.id, clause.clause_number);
          const hasAttention = (clause.attention_flags && clause.attention_flags.length > 0);

          return (
            <div
              key={clause.id}
              onClick={() => setSelectedClause(clause)}
              className="editorial-card p-5 bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-650 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-obsidian-900 text-obsidian-300 border border-obsidian-750">
                    Clause {clause.clause_number}
                  </span>
                  <span className="text-[11px] font-mono text-obsidian-500">Page {clause.page_number}</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-obsidian-200 transition-colors line-clamp-1">
                  {clause.title}
                </h3>

                <p className="text-xs text-obsidian-400 line-clamp-3 leading-relaxed mb-4 font-mono">
                  {clause.preview || clause.text}
                </p>
              </div>

              <div>
                {hasAttention && (
                  <div className="mb-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>{clause.attention_flags![0].title}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-obsidian-750/80 flex items-center justify-between text-xs text-obsidian-400">
                  <span className="flex items-center gap-1.5 text-[11px] font-mono">
                    <strong className="text-obsidian-200 font-semibold">{clauseObls.length}</strong> obligation{clauseObls.length === 1 ? '' : 's'}
                  </span>
                  <span className="text-xs text-obsidian-300 group-hover:text-white transition-colors flex items-center gap-0.5 font-medium">
                    Inspect <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clause Detail Drawer/Modal */}
      {selectedClause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="editorial-card w-full max-w-2xl max-h-[85vh] bg-obsidian-900 border border-obsidian-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-obsidian-750 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-obsidian-800 text-obsidian-300 border border-obsidian-700">
                    Clause {selectedClause.clause_number}
                  </span>
                  <span className="text-xs text-obsidian-500 font-mono">Page {selectedClause.page_number}</span>
                </div>
                <h2 className="text-base font-bold text-white">{selectedClause.title}</h2>
              </div>
              <button
                onClick={() => setSelectedClause(null)}
                className="p-1.5 rounded-lg text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 font-medium mb-2">
                  Verbatim Contract Text
                </h4>
                <div className="p-4 rounded-xl bg-obsidian-950 border border-obsidian-750 text-xs text-obsidian-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {selectedClause.text}
                </div>
              </div>

              {selectedClause.attention_flags && selectedClause.attention_flags.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-medium mb-2">
                    Attention Flags
                  </h4>
                  <div className="space-y-2">
                    {selectedClause.attention_flags.map((flag: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-0.5"
                      >
                        <p className="font-semibold text-amber-200">{flag.title}</p>
                        <p className="text-amber-300/80 text-[11px]">{flag.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-obsidian-400 font-medium mb-2">
                  Parsed Obligations ({getClauseObligations(selectedClause.id, selectedClause.clause_number).length})
                </h4>

                <div className="space-y-2.5">
                  {getClauseObligations(selectedClause.id, selectedClause.clause_number).map((obl) => (
                    <div
                      key={obl.id}
                      className="p-3.5 rounded-xl bg-obsidian-850 border border-obsidian-750 text-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sky-400">{obl.actor}</span>
                            <span className="text-obsidian-600">•</span>
                            <span className="font-semibold text-white">{obl.action}</span>
                            {obl.amount && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px]">
                                {obl.amount}
                              </span>
                            )}
                          </div>
                          <p className="text-obsidian-400 italic font-mono text-[11px]">"{obl.evidence_text}"</p>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-900 border border-obsidian-750 text-obsidian-300 flex-shrink-0">
                          {Math.round(obl.confidence * 100)}% conf
                        </span>
                      </div>

                      {obl.normalized_deadline && (
                        <div className="text-[11px] text-obsidian-400 flex items-center gap-1.5 pt-2 border-t border-obsidian-750/80 font-mono">
                          <span className="text-obsidian-400">Deadline:</span>
                          <span className="text-rose-300">{obl.normalized_deadline}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-obsidian-750 bg-obsidian-950/60 flex justify-end">
              <button
                onClick={() => setSelectedClause(null)}
                className="px-4 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-xs font-medium text-white transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
