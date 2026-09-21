export interface Party {
  id: string;
  contract_id: string;
  name: string;
  role: string;
}

export interface AttentionFlag {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'caution';
  clause_number?: string;
}

export interface Clause {
  id: string;
  contract_id: string;
  clause_number: string;
  title: string;
  text: string;
  page_number: number;
  preview?: string;
  attention_flags?: AttentionFlag[];
  obligation_count?: number;
}

export interface Obligation {
  id: string;
  contract_id: string;
  clause_id?: string;
  actor: string;
  action: string;
  object?: string | null;
  amount?: string | null;
  frequency?: string | null;
  trigger?: string | null;
  condition?: string | null;
  deadline_text?: string | null;
  normalized_deadline?: string | null;
  consequence?: string | null;
  status: 'Pending' | 'Due Soon' | 'Completed' | 'Overdue' | 'Needs Review';
  confidence: number;
  evidence_text: string;
  source_page?: number;
  is_edited?: boolean;
  edited_at?: string | null;
}

export interface ContractSummary {
  id: string;
  title: string;
  filename: string;
  total_pages: number;
  clause_count: number;
  obligation_count: number;
  status: string;
  created_at: string;
  parties: Party[];
}

export interface ContractDetail {
  id: string;
  title: string;
  filename: string;
  file_path: string;
  total_pages: number;
  clause_count: number;
  obligation_count: number;
  status: string;
  created_at: string;
  parties: Party[];
  clauses: Clause[];
  obligations: Obligation[];
  attention_flags: AttentionFlag[];
}

export interface GraphNode {
  id: string;
  type: 'clause' | 'party' | 'obligation' | 'trigger' | 'deadline' | 'condition' | 'consequence';
  label: string;
  data: Record<string, any>;
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface GraphData {
  contract_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TimelineItem {
  id: string;
  obligation_id: string;
  party: string;
  action: string;
  timing_type: 'recurring' | 'initial' | 'ongoing' | 'event_driven' | 'terminal';
  time_label: string;
  order_index: number;
  trigger?: string;
  condition?: string;
  status: string;
  source_clause: string;
  source_page: number;
}

export interface Reminder {
  id: string;
  contract_id: string;
  obligation_id?: string;
  title: string;
  due_date?: string;
  reminder_date?: string;
  is_simulated: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface EvidenceSource {
  clause_id?: string;
  clause_number: string;
  clause_title: string;
  page_number: number;
  snippet: string;
  relevance_score: number;
}

export interface QAAnswer {
  contract_id: string;
  question: string;
  answer: string;
  evidence_sources: EvidenceSource[];
  confidence: number;
  disclaimer: string;
}

export interface AnalyticsData {
  contract_id: string;
  total_clauses: number;
  total_obligations: number;
  deadlines_count: number;
  recurring_count: number;
  conditional_count: number;
  obligations_by_party: Record<string, number>;
  obligations_by_type: Record<string, number>;
  status_breakdown: Record<string, number>;
  confidence_distribution: Record<string, number>;
  attention_flags_count: number;
}

export interface EvaluationMetrics {
  dataset_name: string;
  total_samples: number;
  clause_detection: {
    precision: number;
    recall: number;
    f1_score: number;
    detected_count: number;
    ground_truth_count: number;
  };
  obligation_extraction: {
    actor_accuracy: number;
    action_accuracy: number;
    deadline_accuracy: number;
    overall_f1: number;
  };
  evidence_retrieval: {
    precision_at_1: number;
    precision_at_3: number;
    mean_reciprocal_rank: number;
  };
  qa_performance: {
    answer_correctness: number;
    evidence_attribution_accuracy: number;
  };
  human_correction_rate: number;
  benchmark_samples: Array<Record<string, any>>;
}
