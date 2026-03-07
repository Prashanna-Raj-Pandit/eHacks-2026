from __future__ import annotations

from ai.app.models import JobRequirements, RetrievedEvidence


class PromptBuilder:
    @staticmethod
    def build_evidence_context(evidence: list[RetrievedEvidence]) -> str:
        blocks: list[str] = []
        for i, item in enumerate(evidence, start=1):
            meta = item.metadata
            source_label = PromptBuilder._source_label(meta)
            block = f"""
[EVIDENCE #{i}]
Retrieved for query: {item.query_used}
Source: {source_label}
Chunk ID: {item.chunk_id}
Content:
{item.text}
""".strip()
            blocks.append(block)
        return "\n\n".join(blocks)

    @staticmethod
    def build_resume_generation_prompt(
        job_description: str,
        req: JobRequirements,
        evidence: list[RetrievedEvidence],
    ) -> str:
        evidence_context = PromptBuilder.build_evidence_context(evidence)

        return f"""
You are an evidence-grounded resume assistant.

Your task is to generate ATS-aligned resume content for a candidate, but you must only use the retrieved evidence below.

STRICT RULES:
1. Do not invent achievements, metrics, tools, or responsibilities not supported by evidence.
2. If evidence is partial, use careful wording like "worked with", "contributed to", or "implemented".
3. If a requested skill is not supported, mention it in a "Potential Gaps" section instead of fabricating it.
4. Every bullet must be plausibly supported by at least one evidence item.
5. Use professional, concise, recruiter-friendly language.
6. Optimize wording for ATS alignment using the job requirements.
7. Do not claim years of experience unless the evidence directly supports it.
8. Prefer strong action verbs.

Return markdown with exactly these sections:

# Target Role
# Match Summary
Write a 3-5 sentence summary of how the candidate aligns to the job.

# ATS Keywords Covered
A bullet list of matched keywords clearly supported by evidence.

# Resume Bullets
Write 4-6 strong resume bullets.
After each bullet, add a sub-line starting with "Evidence:" and cite the source briefly.

# Potential Gaps
List important job requirements that were not clearly supported by the evidence.

# Suggested Next Artifacts to Ingest
Suggest what missing repo, cert, paper, or project evidence would strengthen this application.

Structured job requirements:
Target role: {req.target_role}
Must-have skills: {req.must_have_skills}
Nice-to-have skills: {req.nice_to_have_skills}
Tools and technologies: {req.tools_and_technologies}
Responsibilities: {req.responsibilities}
ATS keywords: {req.ats_keywords}

Original job description:
{job_description}

Retrieved evidence:
{evidence_context}
""".strip()

    @staticmethod
    def _source_label(meta: dict) -> str:
        source_type = meta.get("source_type", "")
        if source_type == "github_repo":
            repo = meta.get("repo", "")
            file_path = meta.get("file_path", "")
            return f"GitHub repo={repo}, file={file_path}"
        if source_type == "pdf":
            source_name = meta.get("source_name", "")
            page = meta.get("page", "")
            return f"PDF={source_name}, page={page}"
        return str(meta)