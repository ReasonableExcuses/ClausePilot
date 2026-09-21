from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class AttentionFlag(BaseModel):
    id: str
    type: str  # ambiguous_deadline, conditional_duty, low_confidence, undefined_term, high_financial_impact
    title: str
    description: str
    severity: str = "warning"  # info, warning, caution
    clause_number: Optional[str] = None


class PartyResponse(BaseModel):
    id: str
    contract_id: str
    name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class ClauseResponse(BaseModel):
    id: str
    contract_id: str
    clause_number: str
    title: str
    text: str
    page_number: int
    preview: Optional[str] = None
    attention_flags: List[Dict[str, Any]] = []
    obligation_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class ObligationResponse(BaseModel):
    id: str
    contract_id: str
    clause_id: Optional[str] = None
    actor: str
    action: str
    object: Optional[str] = None
    amount: Optional[str] = None
    frequency: Optional[str] = None
    trigger: Optional[str] = None
    condition: Optional[str] = None
    deadline_text: Optional[str] = None
    normalized_deadline: Optional[str] = None
    consequence: Optional[str] = None
    status: str
    confidence: float
    evidence_text: str
    source_page: Optional[int] = 1
    is_edited: bool = False
    edited_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ObligationUpdate(BaseModel):
    actor: Optional[str] = None
    action: Optional[str] = None
    object: Optional[str] = None
    amount: Optional[str] = None
    frequency: Optional[str] = None
    trigger: Optional[str] = None
    condition: Optional[str] = None
    deadline_text: Optional[str] = None
    normalized_deadline: Optional[str] = None
    consequence: Optional[str] = None
    status: Optional[str] = None


class ContractSummaryResponse(BaseModel):
    id: str
    title: str
    filename: str
    total_pages: int
    clause_count: int
    obligation_count: int
    status: str
    created_at: datetime
    parties: List[PartyResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ContractDetailResponse(BaseModel):
    id: str
    title: str
    filename: str
    file_path: str
    total_pages: int
    clause_count: int
    obligation_count: int
    status: str
    created_at: datetime
    parties: List[PartyResponse] = []
    clauses: List[ClauseResponse] = []
    obligations: List[ObligationResponse] = []
    attention_flags: List[AttentionFlag] = []

    model_config = ConfigDict(from_attributes=True)


class GraphNode(BaseModel):
    id: str
    type: str  # clause, party, obligation, trigger, deadline, condition, consequence
    label: str
    data: Dict[str, Any] = {}


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: Optional[bool] = True


class GraphResponse(BaseModel):
    contract_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class TimelineItem(BaseModel):
    id: str
    obligation_id: str
    party: str
    action: str
    timing_type: str  # recurring, milestone, relative, continuous
    time_label: str
    order_index: int
    trigger: Optional[str] = None
    condition: Optional[str] = None
    status: str
    source_clause: str
    source_page: int


class TimelineResponse(BaseModel):
    contract_id: str
    items: List[TimelineItem]


class ReminderResponse(BaseModel):
    id: str
    contract_id: str
    obligation_id: Optional[str] = None
    title: str
    due_date: Optional[str] = None
    reminder_date: Optional[str] = None
    is_simulated: bool = True
    is_dismissed: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReminderCreate(BaseModel):
    contract_id: str
    obligation_id: Optional[str] = None
    title: str
    due_date: Optional[str] = None
    reminder_date: Optional[str] = None


class ReminderUpdate(BaseModel):
    is_dismissed: Optional[bool] = None
    due_date: Optional[str] = None
    reminder_date: Optional[str] = None


class EvidenceSource(BaseModel):
    clause_id: Optional[str] = None
    clause_number: str
    clause_title: str
    page_number: int
    snippet: str
    relevance_score: float


class QAAskRequest(BaseModel):
    question: str


class QAAskResponse(BaseModel):
    contract_id: str
    question: str
    answer: str
    evidence_sources: List[EvidenceSource] = []
    confidence: float
    disclaimer: str = "ClausePilot is an information-extraction tool and does not provide legal advice."


class AnalyticsResponse(BaseModel):
    contract_id: str
    total_clauses: int
    total_obligations: int
    deadlines_count: int
    recurring_count: int
    conditional_count: int
    obligations_by_party: Dict[str, int]
    obligations_by_type: Dict[str, int]
    status_breakdown: Dict[str, int]
    confidence_distribution: Dict[str, int]
    attention_flags_count: int


class EvaluationMetricsResponse(BaseModel):
    dataset_name: str
    total_samples: int
    clause_detection: Dict[str, float]
    obligation_extraction: Dict[str, float]
    evidence_retrieval: Dict[str, float]
    qa_performance: Dict[str, float]
    human_correction_rate: float
    benchmark_samples: List[Dict[str, Any]]
