from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Contract
from app.schemas.contract import AnalyticsResponse

router = APIRouter(prefix="", tags=["analytics"])


@router.get("/contracts/{contract_id}/analytics", response_model=AnalyticsResponse)
def get_contract_analytics(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    obligations = contract.obligations

    # Count by party
    party_counter = Counter()
    for o in obligations:
        party_counter[o.actor] += 1

    # Count by type
    type_counter = Counter()
    for o in obligations:
        act = o.action.lower()
        if any(k in act for k in ["pay", "rent", "fee", "deposit", "bill", "refund", "remit"]):
            type_counter["Payment"] += 1
        elif any(k in act for k in ["notice", "termination", "written"]):
            type_counter["Notice"] += 1
        elif any(k in act for k in ["repair", "maintenance", "clean", "fixtures"]):
            type_counter["Maintenance"] += 1
        elif any(k in act for k in ["inspection", "entry", "permit"]):
            type_counter["Inspection & Access"] += 1
        elif any(k in act for k in ["keys", "surrender", "possession", "handover"]):
            type_counter["Surrender"] += 1
        elif any(k in act for k in ["conciliation", "dispute", "arbitration"]):
            type_counter["Dispute Resolution"] += 1
        else:
            type_counter["Operational"] += 1

    # Status breakdown
    status_counter = Counter()
    for o in obligations:
        status_counter[o.status] += 1

    # Confidence distribution
    conf_counter = Counter({"High (≥90%)": 0, "Medium (75–89%)": 0, "Needs Review (<75%)": 0})
    for o in obligations:
        if o.confidence >= 0.90:
            conf_counter["High (≥90%)"] += 1
        elif o.confidence >= 0.75:
            conf_counter["Medium (75–89%)"] += 1
        else:
            conf_counter["Needs Review (<75%)"] += 1

    deadlines_count = sum(1 for o in obligations if o.deadline_text or o.normalized_deadline)
    recurring_count = sum(1 for o in obligations if o.frequency in ["Monthly", "Daily upon delay", "Continuous"])
    conditional_count = sum(1 for o in obligations if o.condition)

    total_flags = sum(len(c.attention_flags or []) for c in contract.clauses)

    return {
        "contract_id": contract.id,
        "total_clauses": len(contract.clauses),
        "total_obligations": len(obligations),
        "deadlines_count": deadlines_count,
        "recurring_count": recurring_count,
        "conditional_count": conditional_count,
        "obligations_by_party": dict(party_counter),
        "obligations_by_type": dict(type_counter),
        "status_breakdown": dict(status_counter),
        "confidence_distribution": dict(conf_counter),
        "attention_flags_count": total_flags,
    }
