import React from 'react';
import { TimelineItem } from '../../types';
import {
  Calendar,
  Clock,
  Repeat,
  AlertCircle,
  Flag,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface TimelineTabProps {
  items: TimelineItem[];
}

export const TimelineTab: React.FC<TimelineTabProps> = ({ items }) => {
  // Group into phases
  const initialItems = items.filter((i) => i.timing_type === 'initial');
  const recurringItems = items.filter((i) => i.timing_type === 'recurring');
  const ongoingItems = items.filter((i) => i.timing_type === 'ongoing');
  const eventDrivenItems = items.filter((i) => i.timing_type === 'event_driven');
  const terminalItems = items.filter((i) => i.timing_type === 'terminal');

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-editorial">
      {/* Intro Header */}
      <div className="editorial-panel p-5 rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-obsidian-300" />
            <span>Contractual Lifecycle & Chronological Timeline</span>
          </h3>
          <p className="text-xs text-obsidian-400 mt-1">
            Organized chronologically with recurring routines and conditional trigger-bound milestones.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-obsidian-800 border border-obsidian-750 text-obsidian-300 font-mono">
          {items.length} Timeline Events
        </span>
      </div>

      {/* Timeline Spine */}
      <div className="relative border-l border-obsidian-750 ml-4 pl-7 space-y-8">
        {/* Phase 1: Execution / Commencement */}
        {initialItems.length > 0 && (
          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-obsidian-200 text-xs font-mono font-medium">
              1
            </div>
            <div className="mb-3">
              <span className="text-xs uppercase font-mono font-medium tracking-wider text-obsidian-300">
                Phase 1: Lease Execution & Move-In Protocol
              </span>
            </div>
            <div className="space-y-3">
              {initialItems.map((item) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Phase 2: Recurring Monthly Routines */}
        {recurringItems.length > 0 && (
          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-obsidian-200 text-xs">
              <Repeat className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="mb-3">
              <span className="text-xs uppercase font-mono font-medium tracking-wider text-obsidian-300">
                Phase 2: Monthly Recurring Obligations
              </span>
            </div>
            <div className="space-y-3">
              {recurringItems.map((item) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: Event-Driven Triggers & Contingencies */}
        {eventDrivenItems.length > 0 && (
          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-obsidian-200 text-xs">
              <Zap className="w-3 h-3 text-purple-400" />
            </div>
            <div className="mb-3">
              <span className="text-xs uppercase font-mono font-medium tracking-wider text-obsidian-300">
                Phase 3: Trigger & Event-Driven Contingencies
              </span>
            </div>
            <div className="space-y-3">
              {eventDrivenItems.map((item) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Phase 4: Ongoing Tenancy Conditions */}
        {ongoingItems.length > 0 && (
          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-obsidian-200 text-xs">
              <Clock className="w-3 h-3 text-sky-400" />
            </div>
            <div className="mb-3">
              <span className="text-xs uppercase font-mono font-medium tracking-wider text-obsidian-300">
                Phase 4: Continuous Tenancy Duties
              </span>
            </div>
            <div className="space-y-3">
              {ongoingItems.map((item) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Phase 5: Termination & Exit Protocol */}
        {terminalItems.length > 0 && (
          <div className="relative">
            <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-obsidian-850 border border-obsidian-700 flex items-center justify-center text-obsidian-200 text-xs">
              <Flag className="w-3 h-3 text-rose-400" />
            </div>
            <div className="mb-3">
              <span className="text-xs uppercase font-mono font-medium tracking-wider text-obsidian-300">
                Phase 5: Notice, Vacating & Deposit Settlement
              </span>
            </div>
            <div className="space-y-3">
              {terminalItems.map((item) => (
                <TimelineCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TimelineCard: React.FC<{ item: TimelineItem }> = ({ item }) => {
  return (
    <div className="editorial-card p-4 rounded-xl border border-obsidian-750 hover:border-obsidian-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-obsidian-800 border border-obsidian-750 text-obsidian-200 text-[11px] font-medium font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.party === 'Tenant'
                  ? 'bg-sky-400'
                  : item.party === 'Landlord'
                  ? 'bg-indigo-400'
                  : 'bg-obsidian-400'
              }`}
            />
            {item.party}
          </span>
          <span className="font-semibold text-white tracking-tight">{item.action}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-obsidian-400">
          {item.trigger && (
            <span>
              <strong className="text-obsidian-300 font-medium">Trigger:</strong> {item.trigger}
            </span>
          )}
          {item.condition && (
            <span className="text-amber-300/90 italic font-mono-code">
              * {item.condition}
            </span>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-end gap-1 flex-shrink-0">
        <span className="font-mono font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-[11px]">
          {item.time_label}
        </span>
        <span className="text-[10px] text-obsidian-400 font-mono">{item.source_clause}</span>
      </div>
    </div>
  );
};
