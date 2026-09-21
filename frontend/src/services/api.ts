import {
  ContractSummary,
  ContractDetail,
  Clause,
  Obligation,
  GraphData,
  TimelineItem,
  Reminder,
  QAAnswer,
  EvidenceSource,
  AnalyticsData,
  EvaluationMetrics,
} from '../types';

const API_BASE = '/api';

export const api = {
  async fetchContracts(): Promise<ContractSummary[]> {
    const res = await fetch(`${API_BASE}/contracts`);
    if (!res.ok) throw new Error('Failed to fetch contracts');
    return res.json();
  },

  async fetchContractDetail(id: string): Promise<ContractDetail> {
    const res = await fetch(`${API_BASE}/contracts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch contract details');
    return res.json();
  },

  async uploadContract(file: File): Promise<ContractSummary> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/contracts/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async loadDemoContract(): Promise<ContractSummary> {
    const res = await fetch(`${API_BASE}/contracts/demo`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to load demo agreement');
    return res.json();
  },

  async deleteContract(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/contracts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete contract');
  },

  async fetchClauses(contractId: string): Promise<Clause[]> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/clauses`);
    if (!res.ok) throw new Error('Failed to fetch clauses');
    return res.json();
  },

  async fetchObligations(
    contractId: string,
    filters?: { actor?: string; status?: string; search?: string }
  ): Promise<Obligation[]> {
    const params = new URLSearchParams();
    if (filters?.actor) params.append('actor', filters.actor);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/contracts/${contractId}/obligations${query}`);
    if (!res.ok) throw new Error('Failed to fetch obligations');
    return res.json();
  },

  async updateObligation(
    obligationId: string,
    data: Partial<Obligation>
  ): Promise<Obligation> {
    const res = await fetch(`${API_BASE}/obligations/${obligationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update obligation');
    return res.json();
  },

  async fetchGraph(contractId: string): Promise<GraphData> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/graph`);
    if (!res.ok) throw new Error('Failed to fetch obligation graph');
    return res.json();
  },

  async fetchTimeline(contractId: string): Promise<{ contract_id: string; items: TimelineItem[] }> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch contract timeline');
    return res.json();
  },

  async askQuestion(contractId: string, question: string): Promise<QAAnswer> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Failed to get answer');
    return res.json();
  },

  async searchContract(contractId: string, query: string): Promise<EvidenceSource[]> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search contract');
    return res.json();
  },

  async fetchReminders(contractId: string): Promise<Reminder[]> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/reminders`);
    if (!res.ok) throw new Error('Failed to fetch reminders');
    return res.json();
  },

  async updateReminder(reminderId: string, data: Partial<Reminder>): Promise<Reminder> {
    const res = await fetch(`${API_BASE}/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update reminder');
    return res.json();
  },

  async fetchAnalytics(contractId: string): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/contracts/${contractId}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async fetchEvaluationMetrics(): Promise<EvaluationMetrics> {
    const res = await fetch(`${API_BASE}/evaluation/metrics`);
    if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
    return res.json();
  },
};
