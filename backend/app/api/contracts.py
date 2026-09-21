import os
import shutil
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.models.contract import Contract, Party, Clause, Obligation, DocumentChunk, Reminder
from app.schemas.contract import (
    ContractSummaryResponse,
    ContractDetailResponse,
    AttentionFlag,
)
from app.services.pdf_service import PDFService
from app.services.extraction.factory import ExtractorFactory
from app.services.extraction.normalizer import ObligationNormalizer

router = APIRouter(prefix="/contracts", tags=["contracts"])


def _populate_contract_data(
    contract: Contract,
    parties_data: list,
    clauses_data: list,
    obligations_data: list,
    pages_data: list,
    db: Session,
):
    # 1. Save parties
    party_objs = []
    for p in parties_data:
        party = Party(
            contract_id=contract.id,
            name=p["name"],
            role=p["role"],
        )
        db.add(party)
        party_objs.append(party)

    # 2. Save clauses
    clause_map = {}  # clause_number -> Clause obj
    for c in clauses_data:
        clause = Clause(
            contract_id=contract.id,
            clause_number=str(c["clause_number"]),
            title=c["title"],
            text=c["text"],
            page_number=c.get("page_number", 1),
            preview=c.get("preview", c["text"][:180] + "..."),
            attention_flags=c.get("attention_flags", []),
        )
        db.add(clause)
        clause_map[str(c["clause_number"])] = clause

    db.flush()  # Flush to get clause IDs

    # 3. Save obligations
    for o in obligations_data:
        c_num = str(o.get("clause_number", "1"))
        matched_clause = clause_map.get(c_num)

        obl = Obligation(
            contract_id=contract.id,
            clause_id=matched_clause.id if matched_clause else None,
            actor=o.get("actor", "Party"),
            action=o.get("action", "Perform obligation"),
            object=o.get("object", None),
            amount=o.get("amount", None),
            frequency=o.get("frequency", "As needed"),
            trigger=o.get("trigger", None),
            condition=o.get("condition", None),
            deadline_text=o.get("deadline_text", None),
            normalized_deadline=o.get("normalized_deadline", None),
            consequence=o.get("consequence", None),
            status=o.get("status", "Pending"),
            confidence=o.get("confidence", 0.85),
            evidence_text=o.get("evidence_text", ""),
            source_page=o.get("source_page", 1),
            original_extraction=dict(o),
        )
        db.add(obl)

        # Create simulated reminder if obligation has a deadline
        if obl.deadline_text or obl.normalized_deadline:
            rem = Reminder(
                contract_id=contract.id,
                obligation=obl,
                title=f"{obl.actor}: {obl.action}",
                due_date=obl.normalized_deadline or obl.deadline_text,
                reminder_date="Upcoming milestone alert",
                is_simulated=True,
                is_dismissed=False,
            )
            db.add(rem)

    # 4. Save document chunks for search
    for p in pages_data:
        for idx, para in enumerate(p.get("paragraphs", [])):
            if len(para.strip()) > 30:
                chunk = DocumentChunk(
                    contract_id=contract.id,
                    chunk_index=idx,
                    text=para.strip(),
                    page_number=p["page_number"],
                )
                db.add(chunk)

    contract.clause_count = len(clauses_data)
    contract.obligation_count = len(obligations_data)
    contract.status = "processed"
    db.commit()


@router.post("/upload", response_model=ContractSummaryResponse)
async def upload_contract(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a valid PDF document.",
        )

    # Check file size (limit 20MB)
    file_bytes = await file.read()
    if len(file_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit (20MB).")

    # Save to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    saved_filename = f"{int(datetime.utcnow().timestamp())}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Extract text from PDF
    try:
        extraction_res = PDFService.extract_text_from_pdf(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Create Contract record
    title = file.filename.rsplit(".", 1)[0].replace("_", " ").title()
    contract = Contract(
        title=title,
        filename=file.filename,
        file_path=file_path,
        total_pages=extraction_res.total_pages,
        status="processing",
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Run extraction
    extractor = ExtractorFactory.get_extractor(filename=file.filename)
    parties_data, clauses_data, obligations_data = extractor.extract(
        extraction_res.text, extraction_res.pages
    )

    _populate_contract_data(
        contract,
        parties_data,
        clauses_data,
        obligations_data,
        extraction_res.pages,
        db,
    )

    db.refresh(contract)
    return contract


@router.post("/demo", response_model=ContractSummaryResponse)
def load_demo_contract(db: Session = Depends(get_db)):
    """
    Instantly loads the bundled Residential Rental Agreement demo contract.
    Guaranteed to succeed and populate complete clauses, obligations, graph, and timeline.
    """
    demo_pdf_path = os.path.join(settings.DATA_DIR, "demo_agreement.pdf")
    if not os.path.exists(demo_pdf_path):
        from scripts.generate_demo_pdf import create_demo_pdf
        create_demo_pdf(demo_pdf_path)

    # Check if demo contract already exists
    existing = db.query(Contract).filter(Contract.filename == "demo_agreement.pdf").first()
    if existing:
        return existing

    extraction_res = PDFService.extract_text_from_pdf(demo_pdf_path)

    contract = Contract(
        title="Residential Rental Agreement",
        filename="demo_agreement.pdf",
        file_path=demo_pdf_path,
        total_pages=extraction_res.total_pages,
        status="processing",
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    extractor = ExtractorFactory.get_extractor(force_demo=True)
    parties_data, clauses_data, obligations_data = extractor.extract(
        extraction_res.text, extraction_res.pages
    )

    _populate_contract_data(
        contract,
        parties_data,
        clauses_data,
        obligations_data,
        extraction_res.pages,
        db,
    )

    db.refresh(contract)
    return contract


@router.get("", response_model=List[ContractSummaryResponse])
def list_contracts(db: Session = Depends(get_db)):
    return db.query(Contract).order_by(Contract.created_at.desc()).all()


@router.get("/{contract_id}", response_model=ContractDetailResponse)
def get_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    # Collect all attention flags across clauses
    attention_flags = []
    for c in contract.clauses:
        if c.attention_flags:
            for flag in c.attention_flags:
                attention_flags.append(
                    AttentionFlag(
                        id=flag.get("id", "flag-1"),
                        type=flag.get("type", "warning"),
                        title=flag.get("title", "Attention Flag"),
                        description=flag.get("description", ""),
                        severity=flag.get("severity", "warning"),
                        clause_number=c.clause_number,
                    )
                )

    resp = ContractDetailResponse.model_validate(contract)
    resp.attention_flags = attention_flags
    return resp


@router.delete("/{contract_id}")
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found.")

    db.delete(contract)
    db.commit()
    return {"message": "Contract deleted successfully.", "contract_id": contract_id}
