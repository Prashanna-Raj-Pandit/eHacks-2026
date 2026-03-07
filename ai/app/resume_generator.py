from __future__ import annotations

from ai.app.cohere_client import CohereClient
from ai.app.models import JobRequirements, RetrievedEvidence
from ai.app.prompt_builder import PromptBuilder


class ResumeGenerator:
    def __init__(self) -> None:
        self.client = CohereClient()

    def generate(
        self,
        job_description: str,
        requirements: JobRequirements,
        evidence: list[RetrievedEvidence],
    ) -> str:
        prompt = PromptBuilder.build_resume_generation_prompt(
            job_description=job_description,
            req=requirements,
            evidence=evidence,
        )
        return self.client.generate_text(prompt, temperature=0.2)