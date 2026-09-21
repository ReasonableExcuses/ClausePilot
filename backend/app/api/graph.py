from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Contract
from app.schemas.contract import GraphResponse
from app.services.graph_service import GraphService

router = APIRouter(prefix="", tags=["graph"])


@router.get("/contracts/{contract_id}/graph", response_model=GraphResponse)
def get_obligation_graph(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    graph_data = GraphService.build_obligation_graph(contract)
    return graph_data
