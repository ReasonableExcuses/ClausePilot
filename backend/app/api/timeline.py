from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Contract
from app.schemas.contract import TimelineResponse
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="", tags=["timeline"])


@router.get("/contracts/{contract_id}/timeline", response_model=TimelineResponse)
def get_contract_timeline(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    items = TimelineService.build_timeline(contract)
    return {"contract_id": contract.id, "items": items}
