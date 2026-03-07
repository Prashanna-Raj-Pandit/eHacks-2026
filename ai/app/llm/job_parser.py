from __future__ import annotations

from ai.app.llm.cohere_client import CohereClient
from ai.app.models import JobRequirements


class JobDescriptionParser:
    def __init__(self) -> None:
        self.client = CohereClient()

    def extract_requirements(self, job_description: str, target_role: str = "") -> JobRequirements:
        prompt = f"""
You are extracting structured hiring requirements from a job description.

Return ONLY valid JSON with this exact schema:
{{
  "target_role": "string",
  "must_have_skills": ["string"],
  "nice_to_have_skills": ["string"],
  "tools_and_technologies": ["string"],
  "responsibilities": ["string"],
  "ats_keywords": ["string"]
}}

Rules:
- Do not invent details not present or strongly implied.
- Keep entries concise.
- ATS keywords should be likely recruiter search terms.
- Deduplicate similar items.
- Return at most 12 items per list.
- If the role is obvious from the description, fill target_role.

Target role hint: {target_role}

Job description:
{job_description}
""".strip()

        data = self.client.generate_json(prompt)
        return JobRequirements(**data)