import os
from app.services.pdf_service import PDFService
from app.services.extraction.demo import DemoExtractor
from app.services.extraction.rule_based import RuleBasedExtractor
from app.services.extraction.normalizer import ObligationNormalizer
from app.core.config import settings


def test_normalizer_deadline():
    norm, freq = ObligationNormalizer.normalize_deadline("on or before the 5th day of each calendar month")
    assert norm == "Day 5 of every month"
    assert freq == "Monthly"

    norm2, freq2 = ObligationNormalizer.normalize_deadline("within 30 days following surrender of premises")
    assert "30 days" in norm2

    norm3, freq3 = ObligationNormalizer.normalize_deadline("within 7 days of receiving the respective bill")
    assert "7 days" in norm3


def test_demo_extractor():
    pdf_path = os.path.join(settings.DATA_DIR, "demo_agreement.pdf")
    res = PDFService.extract_text_from_pdf(pdf_path)

    extractor = DemoExtractor()
    parties, clauses, obligations = extractor.extract(res.text, res.pages)

    assert len(parties) >= 2
    assert any(p["role"] == "Tenant" for p in parties)
    assert any(p["role"] == "Landlord" for p in parties)

    assert len(clauses) == 12
    assert len(obligations) >= 9

    rent_obl = next((o for o in obligations if "20,000" in (o.get("amount") or "") or "rent" in o.get("action", "").lower()), None)
    assert rent_obl is not None
    assert rent_obl["actor"] == "Tenant"
    assert rent_obl["confidence"] >= 0.90


def test_rule_based_extractor():
    sample_text = """
    Clause 1 — Monthly Rent
    The Tenant shall pay monthly rent of ₹20,000 on or before the 5th day of each month.
    In the event of default, the Tenant agrees to pay a late fee of ₹500 per day.

    Clause 2 — Security Deposit
    The Tenant shall deposit a refundable security deposit of ₹60,000 upon execution of this agreement.
    The Landlord shall refund the security deposit within 30 days after termination of the lease.
    """
    dummy_pages = [{"page_number": 1, "text": sample_text, "paragraphs": [sample_text]}]

    extractor = RuleBasedExtractor()
    parties, clauses, obligations = extractor.extract(sample_text, dummy_pages)

    assert len(clauses) >= 2
    assert len(obligations) >= 2
    assert any(o["actor"] == "Tenant" for o in obligations)
