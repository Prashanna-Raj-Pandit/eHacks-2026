from __future__ import annotations

from pathlib import Path

import fitz

from ai.app.models import DocumentRecord
from ai.app.utils import clean_text, make_doc_id


class PDFIngestor:
    def extract_pdf(self, pdf_path: Path) -> list[DocumentRecord]:
        records: list[DocumentRecord] = []
        document = fitz.open(pdf_path)

        title = document.metadata.get("title") or pdf_path.stem

        for page_number in range(len(document)):
            page = document[page_number]
            text = page.get_text("text")
            text = clean_text(text)

            if len(text) < 20:
                continue

            record = DocumentRecord(
                doc_id=make_doc_id("pdf", str(pdf_path), str(page_number + 1)),
                text=text,
                metadata={
                    "source_type": "pdf",
                    "source_name": pdf_path.name,
                    "document_title": title,
                    "page": page_number + 1,
                    "path": str(pdf_path),
                },
            )
            records.append(record)

        document.close()
        return records

    def ingest_directory(self, pdf_dir: Path) -> list[DocumentRecord]:
        all_records: list[DocumentRecord] = []
        for pdf_path in sorted(pdf_dir.glob("*.pdf")):
            all_records.extend(self.extract_pdf(pdf_path))
        return all_records