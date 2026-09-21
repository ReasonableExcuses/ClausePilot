import os
import pytest
from app.services.pdf_service import PDFService
from app.core.config import settings


def test_pdf_extraction_demo():
    pdf_path = os.path.join(settings.DATA_DIR, "demo_agreement.pdf")
    assert os.path.exists(pdf_path), f"Demo PDF does not exist at {pdf_path}"

    res = PDFService.extract_text_from_pdf(pdf_path)
    assert res.total_pages >= 3
    assert len(res.text) > 500
    assert "RESIDENTIAL RENTAL AGREEMENT" in res.text
    assert "Clause 1" in res.text
    assert "Clause 3" in res.text
