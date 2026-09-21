import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit3,
  Eye,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { Obligation, Clause } from '../../types';
import { EvidenceViewer } from '../evidence/EvidenceViewer';
import { api } from '../../services/api';

interface ObligationsTabProps {
  obligations: Obligation[];
  clauses: Clause[];
  onObligationUpdated: () => void;
}

const STATUS_OPTIONS = ['Pending', 'Due Soon', 'Completed', 'Overdue', 'Needs Review'] as const;

export const ObligationsTab: React.FC<ObligationsTabProps> = ({
  obligations,
  clauses,
  onObligationUpdated,
}) => {
  const [selectedParty, setSelectedParty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'confidence' | 'actor'>('confidence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [inspectObligation, setInspectObligation] = useState<Obligation | null>(null);
  const [editObligation, setEditObligation] = useState<Obligation | null>(null);
  const [savingEdit, setSavingEdit] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Partial<Obligation>>({});

  const distinctParties = Array.from(new Set(obligations.map((o) => o.actor)));

  const filteredObligations = obligations
    .filter((obl) => {
      if (selectedParty !== 'All' && obl.actor !== selectedParty) return false;
      if (selectedStatus !== 'All' && obl.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          obl.action.toLowerCase().includes(q) ||
          obl.actor.toLowerCase().includes(q) ||
          (obl.trigger && obl.trigger.toLowerCase().includes(q)) ||
          (obl.deadline_text && obl.deadline_text.toLowerCase().includes(q)) ||
          (obl.normalized_deadline && obl.normalized_deadline.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'confidence') {
        return sortOrder === 'desc' ? b.confidence - a.confidence : a.confidence - b.confidence;
      } else {
        return sortOrder === 'desc' ? b.actor.localeCompare(a.actor) : a.actor.localeCompare(b.actor);
      }
    });

  const handleStatusChange = async (obligationId: string, newStatus: any) => {
    try {
      await api.updateObligation(obligationId, { status: newStatus });
      onObligationUpdated();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const startEdit = (obl: Obligation) => {
    setEditObligation(obl);
    setEditForm({
      actor: obl.actor,
      action: obl.action,
      amount: obl.amount || '',
      frequency: obl.frequency || '',
      trigger: obl.trigger || '',
      condition: obl.condition || '',
      normalized_deadline: obl.normalized_deadline || '',
      consequence: obl.consequence || '',
      status: obl.status,
    });
  };

  const handleSaveCorrection = async () => {
    if (!editObligation) return;
    try {
      setSavingEdit(true);
      await api.updateObligation(editObligation.id, editForm);
      setSavingEdit(false);
      setEditObligation(null);
      onObligationUpdated();
    } catch (err) {
      setSavingEdit(false);
      alert('Failed to save correction.');
    }
  };

  const getMatchedClause = (clauseId?: string) => {
    return clauses.find((c) => c.id === clauseId);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="editorial-card p-3 bg-obsidian-900 border border-obsidian-750 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Party Filter */}
          <div className="flex items-center gap-1.5 text-xs text-obsidian-400">
            <Filter className="w-3.5 h-3.5 text-obsidian-500" />
            <span>Party:</span>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="bg-obsidian-850 border border-obsidian-750 text-obsidian-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-obsidian-600 font-mono"
            >
              <option value="All">All Parties</option>
              {distinctParties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-obsidian-400">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-obsidian-850 border border-obsidian-750 text-obsidian-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-obsidian-600 font-mono"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => {
              if (sortBy === 'confidence') {
                setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
              } else {
                setSortBy('confidence');
                setSortOrder('desc');
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-obsidian-850 border border-obsidian-750 text-xs text-obsidian-300 hover:text-white transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-obsidian-400" />
            <span>Sort: Conf ({sortOrder})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-obsidian-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="obligation-search-input"
            type="text"
            placeholder="Search obligations, actions, triggers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded-md bg-obsidian-950 border border-obsidian-750 text-xs text-white placeholder-obsidian-500 focus:outline-none focus:border-obsidian-600 transition-colors font-mono"
          />
        </div>
      </div>

      {/* Obligations Table */}
      <div className="editorial-card bg-obsidian-900 border border-obsidian-750 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-obsidian-750 bg-obsidian-950/60 text-[10px] font-mono font-semibold uppercase tracking-wider text-obsidian-400">
                <th className="py-3 px-4">Party</th>
                <th className="py-3 px-4">Obligation / Action</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-750/70 text-xs">
              {filteredObligations.map((obl) => {
                const confPercent = Math.round(obl.confidence * 100);

                return (
                  <tr
                    key={obl.id}
                    className="hover:bg-obsidian-850/50 transition-colors group"
                  >
                    {/* Party */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-obsidian-200">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            obl.actor === 'Tenant'
                              ? 'bg-sky-400'
                              : obl.actor === 'Landlord'
                              ? 'bg-indigo-400'
                              : 'bg-obsidian-400'
                          }`}
                        ></span>
                        {obl.actor}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{obl.action}</span>
                        {obl.amount && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {obl.amount}
                          </span>
                        )}
                        {obl.is_edited && (
                          <span className="text-[9px] uppercase px-1 rounded bg-obsidian-800 text-obsidian-300 font-mono">
                            Edited
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-obsidian-400 truncate max-w-xs mt-0.5 font-mono">
                        "{obl.evidence_text}"
                      </p>
                    </td>

                    {/* Trigger */}
                    <td className="py-3 px-4 text-obsidian-300 text-[11px]">
                      {obl.trigger || <span className="text-obsidian-600">—</span>}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-4 text-rose-300 font-mono text-[11px] whitespace-nowrap">
                      {obl.normalized_deadline || obl.deadline_text || (
                        <span className="text-obsidian-600">—</span>
                      )}
                    </td>

                    {/* Condition */}
                    <td className="py-3 px-4 text-amber-300/90 text-[11px] max-w-xs truncate">
                      {obl.condition || <span className="text-obsidian-600">—</span>}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={obl.status}
                        onChange={(e) => handleStatusChange(obl.id, e.target.value)}
                        className="text-[11px] font-medium px-2 py-1 rounded bg-obsidian-850 border border-obsidian-750 text-obsidian-200 focus:outline-none focus:border-obsidian-600 font-mono transition-colors"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-obsidian-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div
                        title="Extraction certainty based on textual evidence clarity."
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] text-obsidian-300"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            obl.confidence >= 0.9
                              ? 'bg-emerald-400'
                              : obl.confidence >= 0.75
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        ></span>
                        <span>{confPercent}%</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Inspect Evidence"
                          onClick={() => setInspectObligation(obl)}
                          className="p-1 rounded text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          title="Edit (Human in the Loop)"
                          onClick={() => startEdit(obl)}
                          className="p-1 rounded text-obsidian-400 hover:text-white hover:bg-obsidian-800 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Evidence Modal */}
      {inspectObligation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="editorial-card w-full max-w-lg bg-obsidian-900 border border-obsidian-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-obsidian-750 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-obsidian-400 font-semibold">
                  Evidence Inspection
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {inspectObligation.actor}: {inspectObligation.action}
                </h3>
              </div>
              <button
                onClick={() => setInspectObligation(null)}
                className="p-1 text-obsidian-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              <EvidenceViewer
                obligation={inspectObligation}
                clauseNumber={getMatchedClause(inspectObligation.clause_id)?.clause_number}
                clauseTitle={getMatchedClause(inspectObligation.clause_id)?.title}
              />

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-obsidian-850 border border-obsidian-750">
                  <span className="text-obsidian-500 block text-[10px] uppercase font-mono">
                    Frequency
                  </span>
                  <span className="text-obsidian-200 font-medium font-mono">{inspectObligation.frequency || 'As needed'}</span>
                </div>

                <div className="p-3 rounded-lg bg-obsidian-850 border border-obsidian-750">
                  <span className="text-obsidian-500 block text-[10px] uppercase font-mono">
                    Confidence
                  </span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {Math.round(inspectObligation.confidence * 100)}% Certainty
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-obsidian-750 bg-obsidian-950/60 flex items-center justify-between">
              <button
                onClick={() => {
                  const obl = inspectObligation;
                  setInspectObligation(null);
                  startEdit(obl);
                }}
                className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-xs font-medium text-white flex items-center gap-1.5 transition-colors border border-obsidian-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Parameters</span>
              </button>

              <button
                onClick={() => setInspectObligation(null)}
                className="px-3.5 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-obsidian-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Human-in-the-Loop Review Edit Modal */}
      {editObligation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="editorial-card w-full max-w-md bg-obsidian-900 border border-obsidian-700 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-obsidian-750 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Human Verification & Correction
                </h3>
                <p className="text-[11px] text-obsidian-400 mt-0.5">
                  Corrections update database records and are logged with an audit trail.
                </p>
              </div>
              <button
                onClick={() => setEditObligation(null)}
                className="p-1 text-obsidian-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto max-h-[70vh] text-xs">
              <div>
                <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Bound Party (Actor)</label>
                <input
                  type="text"
                  value={editForm.actor || ''}
                  onChange={(e) => setEditForm({ ...editForm, actor: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Obligation Action</label>
                <input
                  type="text"
                  value={editForm.action || ''}
                  onChange={(e) => setEditForm({ ...editForm, action: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Amount</label>
                  <input
                    type="text"
                    value={editForm.amount || ''}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    placeholder="e.g. ₹20,000"
                    className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Normalized Deadline</label>
                  <input
                    type="text"
                    value={editForm.normalized_deadline || ''}
                    onChange={(e) => setEditForm({ ...editForm, normalized_deadline: e.target.value })}
                    placeholder="e.g. Day 5 of every month"
                    className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Trigger Event</label>
                <input
                  type="text"
                  value={editForm.trigger || ''}
                  onChange={(e) => setEditForm({ ...editForm, trigger: e.target.value })}
                  placeholder="e.g. End of tenancy"
                  className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600"
                />
              </div>

              <div>
                <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Condition</label>
                <input
                  type="text"
                  value={editForm.condition || ''}
                  onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                  placeholder="e.g. Subject to permitted deductions"
                  className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600"
                />
              </div>

              <div>
                <label className="block text-obsidian-400 text-[11px] font-mono uppercase mb-1">Consequence</label>
                <input
                  type="text"
                  value={editForm.consequence || ''}
                  onChange={(e) => setEditForm({ ...editForm, consequence: e.target.value })}
                  placeholder="e.g. Late fee of ₹500/day"
                  className="w-full px-3 py-1.5 rounded-lg bg-obsidian-950 border border-obsidian-750 text-white focus:outline-none focus:border-obsidian-600"
                />
              </div>
            </div>

            <div className="p-3.5 border-t border-obsidian-750 bg-obsidian-950/60 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setEditObligation(null)}
                className="px-3.5 py-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-xs font-medium text-obsidian-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                disabled={savingEdit}
                className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-xs font-semibold text-obsidian-950 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Correction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
