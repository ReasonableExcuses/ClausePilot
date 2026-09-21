from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contract import Reminder, Contract
from app.schemas.contract import ReminderResponse, ReminderCreate, ReminderUpdate

router = APIRouter(prefix="", tags=["reminders"])


@router.get("/contracts/{contract_id}/reminders", response_model=List[ReminderResponse])
def get_contract_reminders(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    return db.query(Reminder).filter(Reminder.contract_id == contract_id).all()


@router.post("/reminders", response_model=ReminderResponse)
def create_reminder(reminder_in: ReminderCreate, db: Session = Depends(get_db)):
    reminder = Reminder(
        contract_id=reminder_in.contract_id,
        obligation_id=reminder_in.obligation_id,
        title=reminder_in.title,
        due_date=reminder_in.due_date,
        reminder_date=reminder_in.reminder_date,
        is_simulated=True,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.patch("/reminders/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: str, reminder_in: ReminderUpdate, db: Session = Depends(get_db)
):
    rem = db.query(Reminder).filter(Reminder.id == reminder_id).first()
    if not rem:
        raise HTTPException(status_code=404, detail="Reminder not found.")

    if reminder_in.is_dismissed is not None:
        rem.is_dismissed = reminder_in.is_dismissed
    if reminder_in.due_date is not None:
        rem.due_date = reminder_in.due_date
    if reminder_in.reminder_date is not None:
        rem.reminder_date = reminder_in.reminder_date

    db.commit()
    db.refresh(rem)
    return rem
