from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Contract
from app.schemas.contract import QAAskRequest, QAAskResponse, EvidenceSource
from app.services.search_qa_service import SearchQAService

router = APIRouter(prefix="", tags=["qa"])


@router.post("/contracts/{contract_id}/ask", response_model=QAAskResponse)
def ask_contract_question(
    contract_id: str,
    request: QAAskRequest,
    db: Session = Depends(get_db),
):
    """
    RAG Question-Answering endpoint.
    Answers user queries based STRICTLY on contractual evidence with source clause/page attribution.
    """
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    answer_data = SearchQAService.answer_question(contract, request.question)
    return answer_data


@router.get("/contracts/{contract_id}/search", response_model=List[EvidenceSource])
def search_contract(
    contract_id: str,
    q: str = Query(..., description="Search query"),
    db: Session = Depends(get_db),
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    matches = SearchQAService.semantic_search(contract, q)
    return matches
