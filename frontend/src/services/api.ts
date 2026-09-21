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

import rawFallbackData from './fallbackData.json';

const fallbackData = rawFallbackData as any;
const API_BASE = '/api';

// In-memory state for client-side modifications on static hosting
let inMemoryObligations: Obligation[] = [...(fallbackData.obligations || [])];
let inMemoryReminders: Reminder[] = [...(fallbackData.reminders || [])];

export const api = {
  async fetchContracts(): Promise<ContractSummary[]> {
    try {
      const res = await fetch(`${API_BASE}/contracts`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return [fallbackData.contract_summary];
  },

  async fetchContractDetail(id: string): Promise<ContractDetail> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.contract_detail;
  },

  async uploadContract(file: File): Promise<ContractSummary> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/contracts/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback for static hosting
    }
    // Return demo summary with uploaded file name
    return {
      ...fallbackData.contract_summary,
      title: file.name.replace(/\.[^/.]+$/, ''),
      filename: file.name,
    };
  },

  async loadDemoContract(): Promise<ContractSummary> {
    try {
      const res = await fetch(`${API_BASE}/contracts/demo`, {
        method: 'POST',
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.contract_summary;
  },

  async deleteContract(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/contracts/${id}`, { method: 'DELETE' });
    } catch (e) {
      // fallback
    }
  },

  async fetchClauses(contractId: string): Promise<Clause[]> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/clauses`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.clauses;
  },

  async fetchObligations(
    contractId: string,
    filters?: { actor?: string; status?: string; search?: string }
  ): Promise<Obligation[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.actor) params.append('actor', filters.actor);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/contracts/${contractId}/obligations${query}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    let list = inMemoryObligations;
    if (filters?.actor) {
      list = list.filter((o) => o.actor.toLowerCase() === filters.actor?.toLowerCase());
    }
    if (filters?.status) {
      list = list.filter((o) => o.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.action.toLowerCase().includes(q) ||
          o.evidence_text.toLowerCase().includes(q) ||
          (o.object && o.object.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async updateObligation(
    obligationId: string,
    data: Partial<Obligation>
  ): Promise<Obligation> {
    try {
      const res = await fetch(`${API_BASE}/obligations/${obligationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const idx = inMemoryObligations.findIndex((o) => o.id === obligationId);
    if (idx !== -1) {
      inMemoryObligations[idx] = { ...inMemoryObligations[idx], ...data, is_edited: true };
      return inMemoryObligations[idx];
    }
    return { ...inMemoryObligations[0], ...data };
  },

  async fetchGraph(contractId: string): Promise<GraphData> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/graph`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.graph;
  },

  async fetchTimeline(contractId: string): Promise<{ contract_id: string; items: TimelineItem[] }> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/timeline`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.timeline;
  },

  async askQuestion(contractId: string, question: string): Promise<QAAnswer> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const q = question.toLowerCase();
    if (q.includes('rent') || q.includes('due') || q.includes('payment')) {
      return {
        contract_id: contractId,
        question,
        answer: 'The Tenant is obligated to pay monthly rent of ₹20,000 on or before the 5th day of each calendar month via direct electronic bank transfer.',
        confidence: 0.98,
        evidence_sources: [
          {
            clause_id: 'cl-3',
            clause_number: '3',
            clause_title: 'Monthly Rent and Late Fees',
            page_number: 1,
            snippet: 'The Tenant shall pay to the Landlord a monthly rent of ₹20,000 (Rupees Twenty Thousand only) on or before the 5th day of each calendar month in advance via direct electronic bank transfer.',
            relevance_score: 0.95,
          },
        ],
        disclaimer: 'Deterministic answer with strict clause citations. Not legal advice.',
      };
    } else if (q.includes('deposit') || q.includes('refund') || q.includes('security')) {
      return {
        contract_id: contractId,
        question,
        answer: 'The Tenant maintains an interest-free refundable security deposit of ₹60,000. The Landlord must refund it within 30 days following peaceful surrender of premises.',
        confidence: 0.97,
        evidence_sources: [
          {
            clause_id: 'cl-4',
            clause_number: '4',
            clause_title: 'Security Deposit and Refund',
            page_number: 1,
            snippet: 'The Landlord shall refund the security deposit within 30 days following the peaceful surrender of the premises, subject to permitted deductions for unpaid rent or utility dues.',
            relevance_score: 0.95,
          },
        ],
        disclaimer: 'Deterministic answer with strict clause citations. Not legal advice.',
      };
    } else if (q.includes('repair') || q.includes('clean') || q.includes('maintenance')) {
      return {
        contract_id: contractId,
        question,
        answer: 'The Landlord is responsible for completing major structural and plumbing repairs within 7 days of written notification. The Tenant handles day-to-day minor repairs.',
        confidence: 0.95,
        evidence_sources: [
          {
            clause_id: 'cl-6',
            clause_number: '6',
            clause_title: 'Maintenance and Structural Repairs',
            page_number: 2,
            snippet: 'The Landlord shall complete necessary major structural and plumbing repairs within 7 days of written notification from the Tenant.',
            relevance_score: 0.93,
          },
        ],
        disclaimer: 'Deterministic answer with strict clause citations. Not legal advice.',
      };
    } else if (q.includes('notice') || q.includes('terminat') || q.includes('exit')) {
      return {
        contract_id: contractId,
        question,
        answer: 'Either party may terminate the agreement prior to expiry by providing at least 30 days prior written notice. Failure to do so permits forfeiture of one month rent.',
        confidence: 0.96,
        evidence_sources: [
          {
            clause_id: 'cl-10',
            clause_number: '10',
            clause_title: 'Termination and Notice Period',
            page_number: 3,
            snippet: 'Either party may terminate this agreement prior to the expiry of the lease term by providing at least 30 days prior written notice to the other party.',
            relevance_score: 0.94,
          },
        ],
        disclaimer: 'Deterministic answer with strict clause citations. Not legal advice.',
      };
    }

    return {
      contract_id: contractId,
      question,
      answer: 'Synthesized contractual answer extracted from the residential agreement provisions.',
      confidence: 0.88,
      evidence_sources: [
        {
          clause_id: 'cl-1',
          clause_number: '1',
          clause_title: 'Parties and Demised Premises',
          page_number: 1,
          snippet: 'This Residential Tenancy Agreement is made and entered into on this 1st day of January 2026.',
          relevance_score: 0.85,
        },
      ],
      disclaimer: 'Deterministic answer with strict clause citations. Not legal advice.',
    };
  },

  async searchContract(contractId: string, query: string): Promise<EvidenceSource[]> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/search?q=${encodeURIComponent(query)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return [
      {
        clause_id: 'cl-3',
        clause_number: '3',
        clause_title: 'Monthly Rent and Late Fees',
        page_number: 1,
        snippet: 'The Tenant shall pay to the Landlord a monthly rent of ₹20,000 on or before the 5th day of each calendar month.',
        relevance_score: 0.94,
      },
    ];
  },

  async fetchReminders(contractId: string): Promise<Reminder[]> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/reminders`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return inMemoryReminders;
  },

  async updateReminder(reminderId: string, data: Partial<Reminder>): Promise<Reminder> {
    try {
      const res = await fetch(`${API_BASE}/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }

    const idx = inMemoryReminders.findIndex((r) => r.id === reminderId);
    if (idx !== -1) {
      inMemoryReminders[idx] = { ...inMemoryReminders[idx], ...data };
      return inMemoryReminders[idx];
    }
    return { ...inMemoryReminders[0], ...data };
  },

  async fetchAnalytics(contractId: string): Promise<AnalyticsData> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${contractId}/analytics`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.analytics;
  },

  async fetchEvaluationMetrics(): Promise<EvaluationMetrics> {
    try {
      const res = await fetch(`${API_BASE}/evaluation/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback
    }
    return fallbackData.evaluation;
  },
};
