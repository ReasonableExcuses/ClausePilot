import os
import fitz  # PyMuPDF
from typing import List, Dict, Any


class PDFExtractionResult:
    def __init__(self, text: str, pages: List[Dict[str, Any]], total_pages: int):
        self.text = text
        self.pages = pages
        self.total_pages = total_pages


class PDFService:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> PDFExtractionResult:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at: {file_path}")

        try:
            doc = fitz.open(file_path)
        except Exception as e:
            raise ValueError(f"Could not open PDF file. It may be corrupted or not a valid PDF: {str(e)}")

        total_pages = len(doc)
        if total_pages == 0:
            doc.close()
            raise ValueError("The uploaded PDF file contains 0 pages.")

        all_text = []
        pages_data = []

        has_any_text = False
        for page_idx in range(total_pages):
            page = doc[page_idx]
            page_text = page.get_text("text") or ""
            if page_text.strip():
                has_any_text = True

            # Extract paragraphs / blocks
            blocks = page.get_text("blocks") or []
            paragraphs = []
            for b in blocks:
                b_text = b[4].strip() if len(b) > 4 else ""
                if b_text and not b_text.startswith("DEMONSTRATION DOCUMENT") and not b_text.startswith("ClausePilot Prototype"):
                    paragraphs.append(b_text)

            pages_data.append({
                "page_number": page_idx + 1,
                "text": page_text,
                "paragraphs": paragraphs
            })
            all_text.append(page_text)

        doc.close()

        if not has_any_text:
            raise ValueError(
                "We couldn't extract text from this PDF. This prototype currently works best with text-based PDFs rather than scanned image-only documents."
            )

        return PDFExtractionResult(
            text="\n\n".join(all_text),
            pages=pages_data,
            total_pages=total_pages
        )
