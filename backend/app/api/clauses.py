from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Clause, Contract
from app.schemas.contract import ClauseResponse

router = APIRouter(prefix="", tags=["clauses"])


@router.get("/contracts/{contract_id}/clauses", response_model=List[ClauseResponse])
def get_contract_clauses(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    clauses = db.query(Clause).filter(Clause.contract_id == contract_id).all()
    res = []
    for c in clauses:
        c_resp = ClauseResponse.model_validate(c)
        c_resp.obligation_count = len(c.obligations)
        res.append(c_resp)
    return res


@router.get("/clauses/{clause_id}", response_model=ClauseResponse)
def get_clause(clause_id: str, db: Session = Depends(get_db)):
    clause = db.query(Clause).filter(Clause.id == clause_id).first()
    if not clause:
        raise HTTPException(status_code=404, detail="Clause not found.")

    c_resp = ClauseResponse.model_validate(clause)
    c_resp.obligation_count = len(clause.obligations)
    return c_resp
