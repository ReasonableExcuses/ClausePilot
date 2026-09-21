import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Layers,
  CheckCircle2,
  Network,
  Clock,
  Bell,
  MessageSquare,
  ArrowLeft,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import {
  ContractDetail,
  Clause,
  Obligation,
  GraphData,
  TimelineItem,
  Reminder,
  AnalyticsData,
} from '../types';

import { ContractOverview } from '../components/dashboard/ContractOverview';
import { ClausesTab } from '../components/clauses/ClausesTab';
import { ObligationsTab } from '../components/obligations/ObligationsTab';
import { ObligationGraphTab } from '../components/graph/ObligationGraphTab';
import { TimelineTab } from '../components/timeline/TimelineTab';
import { RemindersTab } from '../components/reminders/RemindersTab';
import { AskAgreementTab } from '../components/qa/AskAgreementTab';

type TabType = 'overview' | 'clauses' | 'obligations' | 'graph' | 'timeline' | 'reminders' | 'ask';

export const ContractDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const loadContractWorkspace = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [cDetail, cClauses, cObls, cGraph, cTimeline, cReminders, cAnalytics] =
        await Promise.all([
          api.fetchContractDetail(id),
          api.fetchClauses(id),
          api.fetchObligations(id),
          api.fetchGraph(id),
          api.fetchTimeline(id),
          api.fetchReminders(id),
          api.fetchAnalytics(id),
        ]);

      setContract(cDetail);
      setClauses(cClauses);
      setObligations(cObls);
      setGraphData(cGraph);
      setTimelineItems(cTimeline.items);
      setReminders(cReminders);
      setAnalytics(cAnalytics);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load contract workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractWorkspace();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this contract from workspace?')) return;
    try {
      await api.deleteContract(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete contract.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="w-7 h-7 text-white animate-spin mb-3" />
        <p className="text-xs font-semibold text-white tracking-wide">Loading Contract Intelligence...</p>
        <p className="text-[11px] text-obsidian-500 mt-1 font-mono">Retrieving clauses, obligations, and relational graph</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 editorial-card bg-obsidian-900 border border-red-500/20 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Contract Not Available</h3>
        <p className="text-xs text-obsidian-400 mb-5">{error || 'Could not load contract details.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 text-xs font-medium text-white transition-colors"
        >
          Return to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Editorial Header Bar */}
      <div className="editorial-card p-6 bg-obsidian-900 border border-obsidian-750 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-obsidian-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>All Agreements</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {contract.title}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Analyzed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-obsidian-400 font-mono">
            <span>{contract.filename}</span>
            <span>•</span>
            <span>{contract.total_pages} Page{contract.total_pages > 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{contract.clause_count} Clauses</span>
            <span>•</span>
            <span>{contract.obligation_count} Obligations</span>
            <span>•</span>
            <span className="text-obsidian-300">
              Parties: {contract.parties.map((p) => `${p.name} (${p.role})`).join(', ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            title="Delete contract"
            className="p-2 rounded-lg bg-obsidian-850 border border-obsidian-750 hover:border-red-500/40 text-obsidian-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Control Pill Navigation Dock */}
      <div className="bg-obsidian-900 border border-obsidian-750/90 p-1 rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-none shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'clauses', label: 'Clauses', icon: Layers, count: contract.clause_count },
          { id: 'obligations', label: 'Obligations', icon: CheckCircle2, count: contract.obligation_count },
          { id: 'graph', label: 'Obligation Graph', icon: Network },
          { id: 'timeline', label: 'Timeline', icon: Clock },
          { id: 'reminders', label: 'Reminders', icon: Bell, count: reminders.length },
          { id: 'ask', label: 'Ask Agreement', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-obsidian-800 text-white border border-obsidian-700 shadow-sm'
                  : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-850/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-obsidian-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-obsidian-700 text-obsidian-200' : 'bg-obsidian-850 text-obsidian-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <ContractOverview
            contract={contract}
            analytics={analytics}
            onNavigateTab={(t) => setActiveTab(t as TabType)}
          />
        )}

        {activeTab === 'clauses' && (
          <ClausesTab clauses={clauses} obligations={obligations} />
        )}

        {activeTab === 'obligations' && (
          <ObligationsTab
            obligations={obligations}
            clauses={clauses}
            onObligationUpdated={loadContractWorkspace}
          />
        )}

        {activeTab === 'graph' && <ObligationGraphTab graphData={graphData} />}

        {activeTab === 'timeline' && <TimelineTab items={timelineItems} />}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            obligations={obligations}
            contractId={contract.id}
            onRefresh={loadContractWorkspace}
          />
        )}

        {activeTab === 'ask' && <AskAgreementTab contractId={contract.id} />}
      </div>
    </div>
  );
};
