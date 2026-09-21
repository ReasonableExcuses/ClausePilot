import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    total_pages = Column(Integer, default=1)
    clause_count = Column(Integer, default=0)
    obligation_count = Column(Integer, default=0)
    status = Column(String(50), default="processed")  # processing, processed, error
    created_at = Column(DateTime, default=datetime.utcnow)

    parties = relationship("Party", back_populates="contract", cascade="all, delete-orphan")
    clauses = relationship("Clause", back_populates="contract", cascade="all, delete-orphan")
    obligations = relationship("Obligation", back_populates="contract", cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="contract", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="contract", cascade="all, delete-orphan")
    qa_queries = relationship("QAQuery", back_populates="contract", cascade="all, delete-orphan")


class Party(Base):
    __tablename__ = "parties"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)  # Tenant, Landlord, Service Provider, etc.

    contract = relationship("Contract", back_populates="parties")


class Clause(Base):
    __tablename__ = "clauses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    clause_number = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    preview = Column(String(500), nullable=True)
    attention_flags = Column(JSON, default=list)  # list of flag objects

    contract = relationship("Contract", back_populates="clauses")
    obligations = relationship("Obligation", back_populates="clause", cascade="all, delete-orphan")


class Obligation(Base):
    __tablename__ = "obligations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=True)

    actor = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False)
    object = Column(String(255), nullable=True)

    amount = Column(String(100), nullable=True)
    frequency = Column(String(100), nullable=True)  # Monthly, One-time, As needed

    trigger = Column(String(255), nullable=True)
    condition = Column(String(255), nullable=True)

    deadline_text = Column(String(255), nullable=True)
    normalized_deadline = Column(String(255), nullable=True)

    consequence = Column(String(255), nullable=True)

    status = Column(String(50), default="Pending")  # Pending, Due Soon, Completed, Overdue, Needs Review
    confidence = Column(Float, default=0.85)

    evidence_text = Column(Text, nullable=False)
    source_page = Column(Integer, default=1)

    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime, nullable=True)
    original_extraction = Column(JSON, nullable=True)

    contract = relationship("Contract", back_populates="obligations")
    clause = relationship("Clause", back_populates="obligations")
    audit_logs = relationship("AuditLog", back_populates="obligation", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="obligation", cascade="all, delete-orphan")


class ObligationDependency(Base):
    __tablename__ = "obligation_dependencies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    source_obligation_id = Column(String(36), ForeignKey("obligations.id"), nullable=False)
    target_obligation_id = Column(String(36), ForeignKey("obligations.id"), nullable=False)
    relationship_type = Column(String(100), default="depends_on")  # triggers, precedes, resolves


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    clause_id = Column(String(36), ForeignKey("clauses.id"), nullable=True)
    chunk_index = Column(Integer, default=0)
    text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)

    contract = relationship("Contract", back_populates="chunks")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    obligation_id = Column(String(36), ForeignKey("obligations.id"), nullable=True)
    title = Column(String(255), nullable=False)
    due_date = Column(String(100), nullable=True)
    reminder_date = Column(String(100), nullable=True)
    is_simulated = Column(Boolean, default=True)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="reminders")
    obligation = relationship("Obligation", back_populates="reminders")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    obligation_id = Column(String(36), ForeignKey("obligations.id"), nullable=False)
    field_changed = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    obligation = relationship("Obligation", back_populates="audit_logs")


class QAQuery(Base):
    __tablename__ = "qa_queries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    contract_id = Column(String(36), ForeignKey("contracts.id"), nullable=False)
    query = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    evidence_sources = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="qa_queries")
