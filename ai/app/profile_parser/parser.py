from __future__ import annotations

from pathlib import Path

from ai.app.ingestion.pdf_ingestor import PDFIngestor
from ai.app.llm.cohere_client import CohereClient
from ai.app.profile_parser.models import PortfolioProfile
from ai.app.profile_parser.prompt_builder import ProfilePromptBuilder


class PortfolioProfileParser:
    def __init__(self) -> None:
        self.pdf_ingestor = PDFIngestor()
        self.client = CohereClient()

    def _extract_pdf_text(self, pdf_path: Path) -> str:
        records = self.pdf_ingestor.extract_pdf(pdf_path)
        if not records:
            return ""

        parts: list[str] = []
        for record in records:
            page = record.metadata.get("page", "")
            text = record.text.strip()
            if text:
                parts.append(f"[PAGE {page}]\n{text}")

        return "\n\n".join(parts).strip()

    def parse_pdf(self, pdf_path: Path) -> PortfolioProfile:
        extracted_text = self._extract_pdf_text(pdf_path)
        if not extracted_text:
            raise ValueError(f"No text extracted from PDF: {pdf_path}")

        prompt = ProfilePromptBuilder.build_profile_extraction_prompt(extracted_text)
        data = self.client.generate_json(prompt)
        return PortfolioProfile(**data)