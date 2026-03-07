from __future__ import annotations

from typing import Any

from ai.app.llm.cohere_client import CohereClient
from ai.app.models import JobRequirements, RetrievedEvidence
from ai.app.llm.prompt_builder import PromptBuilder


class ResumeGenerator:
    def __init__(self) -> None:
        self.client = CohereClient()

    def generate_structured_resume(
        self,
        job_description: str,
        requirements: JobRequirements,
        evidence: list[RetrievedEvidence],
    ) -> dict[str, Any]:
        prompt = PromptBuilder.build_resume_generation_prompt(
            job_description=job_description,
            req=requirements,
            evidence=evidence,
        )
        return self.client.generate_json(prompt, temperature=0.2)
