import React, { useState } from 'react';
import { Reminder, Obligation } from '../../types';
import { Bell, CheckCircle2, Clock, AlertTriangle, Send, ShieldCheck, Plus, Check } from 'lucide-react';
import { api } from '../../services/api';

interface RemindersTabProps {
  reminders: Reminder[];
  obligations: Obligation[];
  contractId: string;
  onRefresh: () => void;
}

export const RemindersTab: React.FC<RemindersTabProps> = ({
  reminders,
  obligations,
  contractId,
  onRefresh,
}) => {
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleToggleDismiss = async (reminder: Reminder) => {
    try {
      await api.updateReminder(reminder.id, { is_dismissed: !reminder.is_dismissed });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSimulatedAlert = () => {
    setTestNotificationSent(true);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ClausePilot Reminder Alert', {
        body: 'Tenant rent payment of ₹20,000 is due in 3 days on the 5th of the month.',
      });
    }
    setTimeout(() => setTestNotificationSent(false), 4000);
  };

  const activeReminders = reminders.filter((r) => !r.is_dismissed);
  const dismissedReminders = reminders.filter((r) => r.is_dismissed);

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-editorial">
      {/* Header & Simulated Test Alert Banner */}
      <div className="editorial-panel p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-4 h-4 text-obsidian-300" />
            <span>Automated Obligation Reminders</span>
          </h3>
          <p className="text-xs text-obsidian-400 mt-1">
            Proactive simulated alerts derived deterministically from contractual deadlines and recurring terms.
          </p>
        </div>

        <button
          id="simulate-notification-btn"
          onClick={handleTriggerSimulatedAlert}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-obsidian-950 hover:bg-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Simulate Notification Dispatch</span>
        </button>
      </div>

      {/* Notification Toast Confirmation */}
      {testNotificationSent && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white">Simulated Notification Dispatched</p>
            <p className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
              "Tenant rent payment of ₹20,000 is due on the 5th of this month (Clause 3)."
            </p>
          </div>
        </div>
      )}

      {/* Active Reminders List */}
      <div>
        <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-obsidian-400 mb-3 flex items-center justify-between">
          <span>Active Scheduled Reminders ({activeReminders.length})</span>
        </h4>

        {activeReminders.length === 0 ? (
          <div className="p-8 rounded-2xl editorial-card text-center text-obsidian-400 text-xs">
            All reminders have been acknowledged or dismissed.
          </div>
        ) : (
          <div className="space-y-3">
            {activeReminders.map((rem) => (
              <div
                key={rem.id}
                className="editorial-card p-4 rounded-xl border border-obsidian-750 hover:border-obsidian-700 transition-all flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-obsidian-800 border border-obsidian-700 flex items-center justify-center text-obsidian-300 flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white tracking-tight">{rem.title}</h5>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-obsidian-400 font-mono">
                      <span className="text-rose-300 font-medium">Due: {rem.due_date}</span>
                      <span className="text-obsidian-600">•</span>
                      <span>{rem.reminder_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleDismiss(rem)}
                    className="px-3 py-1.5 rounded-lg bg-obsidian-800 hover:bg-obsidian-750 border border-obsidian-700 text-[11px] font-medium text-obsidian-200 hover:text-white transition-colors"
                  >
                    Acknowledge / Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dismissed Reminders (if any) */}
      {dismissedReminders.length > 0 && (
        <div className="pt-4 border-t border-obsidian-750">
          <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-obsidian-500 mb-3">
            Acknowledged / Archived ({dismissedReminders.length})
          </h4>
          <div className="space-y-2 opacity-60">
            {dismissedReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3 rounded-xl bg-obsidian-900/50 border border-obsidian-800 flex items-center justify-between text-xs text-obsidian-400 font-mono"
              >
                <div className="line-through">{rem.title}</div>
                <button
                  onClick={() => handleToggleDismiss(rem)}
                  className="text-[10px] text-obsidian-300 hover:text-white hover:underline transition-colors"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
