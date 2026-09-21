from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Obligation, Contract, AuditLog
from app.schemas.contract import ObligationResponse, ObligationUpdate

router = APIRouter(prefix="", tags=["obligations"])


@router.get("/contracts/{contract_id}/obligations", response_model=List[ObligationResponse])
def get_contract_obligations(
    contract_id: str,
    actor: Optional[str] = Query(None, description="Filter by party role/actor"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search term in action or evidence"),
    db: Session = Depends(get_db),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    query = db.query(Obligation).filter(Obligation.contract_id == contract_id)

    if actor:
        query = query.filter(Obligation.actor.ilike(f"%{actor}%"))

    if status:
        query = query.filter(Obligation.status == status)

    if search:
        s = f"%{search}%"
        query = query.filter(
            Obligation.action.ilike(s) | Obligation.evidence_text.ilike(s) | Obligation.trigger.ilike(s)
        )

    return query.all()


@router.get("/obligations/{obligation_id}", response_model=ObligationResponse)
def get_obligation(obligation_id: str, db: Session = Depends(get_db)):
    obl = db.query(Obligation).filter(Obligation.id == obligation_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found.")
    return obl


@router.patch("/obligations/{obligation_id}", response_model=ObligationResponse)
def update_obligation(
    obligation_id: str,
    update_data: ObligationUpdate,
    db: Session = Depends(get_db),
):
    """
    Human-in-the-Loop review endpoint.
    Updates obligation fields and stores an audit log tracking the original vs corrected values.
    """
    obl = db.query(Obligation).filter(Obligation.id == obligation_id).first()
    if not obl:
        raise HTTPException(status_code=404, detail="Obligation not found.")

    fields_to_update = update_data.dict(exclude_unset=True)

    for field, new_val in fields_to_update.items():
        old_val = getattr(obl, field, None)
        if str(old_val) != str(new_val):
            # Create audit log record
            log = AuditLog(
                obligation_id=obl.id,
                field_changed=field,
                old_value=str(old_val),
                new_value=str(new_val),
                timestamp=datetime.utcnow(),
            )
            db.add(log)
            setattr(obl, field, new_val)

    obl.is_edited = True
    obl.edited_at = datetime.utcnow()
    db.commit()
    db.refresh(obl)
    return obl
