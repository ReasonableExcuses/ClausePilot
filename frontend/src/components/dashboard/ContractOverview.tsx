import React from 'react';
import {
  FileText,
  Layers,
  Clock,
  Repeat,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ContractDetail, AnalyticsData } from '../../types';

interface ContractOverviewProps {
  contract: ContractDetail;
  analytics: AnalyticsData | null;
  onNavigateTab: (tab: string) => void;
}

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#38bdf8', '#8b5cf6', '#ec4899'];
const CONF_PALETTE: Record<string, string> = {
  'High (≥90%)': '#10b981',
  'Medium (75–89%)': '#f59e0b',
  'Needs Review (<75%)': '#ef4444',
};

export const ContractOverview: React.FC<ContractOverviewProps> = ({
  contract,
  analytics,
  onNavigateTab,
}) => {
  const partyData = analytics?.obligations_by_party
    ? Object.entries(analytics.obligations_by_party).map(([name, value]) => ({ name, value }))
    : [];

  const typeData = analytics?.obligations_by_type
    ? Object.entries(analytics.obligations_by_type).map(([name, value]) => ({ name, value }))
    : [];

  const confData = analytics?.confidence_distribution
    ? Object.entries(analytics.confidence_distribution).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Clauses */}
        <div
          onClick={() => onNavigateTab('clauses')}
          className="editorial-card p-4 bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-650 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-obsidian-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Clauses</span>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white font-tabular">
            {contract.clause_count}
          </div>
          <span className="text-[11px] text-obsidian-400 mt-1">Sections analyzed</span>
        </div>

        {/* Card 2: Obligations */}
        <div
          onClick={() => onNavigateTab('obligations')}
          className="editorial-card p-4 bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-650 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-obsidian-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Obligations</span>
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white font-tabular">
            {contract.obligation_count}
          </div>
          <span className="text-[11px] text-obsidian-400 mt-1">Extracted duties</span>
        </div>

        {/* Card 3: Deadlines */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="editorial-card p-4 bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-650 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-obsidian-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Deadlines</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white font-tabular">
            {analytics?.deadlines_count ?? 2}
          </div>
          <span className="text-[11px] text-obsidian-400 mt-1">Time boundaries</span>
        </div>

        {/* Card 4: Recurring */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="editorial-card p-4 bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-650 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-obsidian-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Recurring</span>
            <Repeat className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white font-tabular">
            {analytics?.recurring_count ?? 3}
          </div>
          <span className="text-[11px] text-obsidian-400 mt-1">Monthly schedules</span>
        </div>

        {/* Card 5: Conditional */}
        <div
          onClick={() => onNavigateTab('obligations')}
          className="editorial-card p-4 bg-obsidian-850 border border-obsidian-750 hover:border-obsidian-650 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-obsidian-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Conditional</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-white font-tabular">
            {analytics?.conditional_count ?? 4}
          </div>
          <span className="text-[11px] text-obsidian-400 mt-1">Contingent duties</span>
        </div>
      </div>

      {/* Document Attention Flags Panel */}
      {contract.attention_flags.length > 0 && (
        <div className="editorial-card p-5 bg-obsidian-900 border border-obsidian-750 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-200">
                Document Attention Flags
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-obsidian-800 text-obsidian-300 font-mono">
                {contract.attention_flags.length} items
              </span>
            </div>
            <span className="text-[11px] text-obsidian-500 font-mono hidden sm:block">
              Explainability indicators • Not legal risk scores
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {contract.attention_flags.map((flag, idx) => (
              <div
                key={`${flag.id || 'flag'}-${idx}`}
                className="p-3 rounded-lg bg-obsidian-850 border border-obsidian-750/90 flex items-start gap-2.5 text-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-obsidian-100">{flag.title}</span>
                    {flag.clause_number && (
                      <span className="text-[10px] font-mono text-obsidian-400">
                        Clause {flag.clause_number}
                      </span>
                    )}
                  </div>
                  <p className="text-obsidian-400 leading-relaxed text-[11px]">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Obligations by Party */}
        <div className="editorial-card p-5 bg-obsidian-850 border border-obsidian-750">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-200">
              Obligations by Bound Party
            </h3>
            <p className="text-[11px] text-obsidian-400">Distribution across contractual signatories</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={partyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {partyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1013',
                    borderColor: '#23262e',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f4f5f7',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Obligations by Type */}
        <div className="editorial-card p-5 bg-obsidian-850 border border-obsidian-750">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-200">
              Obligations by Functional Category
            </h3>
            <p className="text-[11px] text-obsidian-400">Payment, notice, maintenance, and operational duties</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1013',
                    borderColor: '#23262e',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f4f5f7',
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Confidence Distribution */}
        <div className="editorial-card p-5 bg-obsidian-850 border border-obsidian-750">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-200">
              Extraction Confidence Certainty
            </h3>
            <p className="text-[11px] text-obsidian-400">Statistical certainty distribution of parsed entities</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e1013',
                    borderColor: '#23262e',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f4f5f7',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {confData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CONF_PALETTE[entry.name] || '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Workflow Status Breakdown */}
        <div className="editorial-card p-5 bg-obsidian-850 border border-obsidian-750 flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-obsidian-200">
                Workflow Tracking Status
              </h3>
              <p className="text-[11px] text-obsidian-400">Pending, completed, due soon, and overdue tasks</p>
            </div>

            <div className="space-y-2.5 mt-4">
              {Object.entries(analytics?.status_breakdown || {}).map(([status, count]) => {
                const total = contract.obligation_count || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-obsidian-300">{status}</span>
                      <span className="text-obsidian-400 font-mono text-[11px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-obsidian-750 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'Completed'
                            ? 'bg-emerald-500'
                            : status === 'Due Soon'
                            ? 'bg-amber-500'
                            : status === 'Overdue'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-obsidian-750 flex items-center justify-between text-xs">
            <span className="text-[11px] text-obsidian-500 font-mono">Status updates persist to database</span>
            <button
              onClick={() => onNavigateTab('obligations')}
              className="text-xs font-semibold text-white hover:text-obsidian-300 flex items-center gap-1 transition-colors"
            >
              <span>View Obligations</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
