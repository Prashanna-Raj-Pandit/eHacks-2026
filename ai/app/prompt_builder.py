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
You are an evidence-grounded resume writer.

Your job is to generate a PROFESSIONAL LATEX RESUME CONTENT in the same style and structure as the provided resume template.

IMPORTANT GOAL:
Generate a polished, realistic, recruiter-friendly resume that looks like a real professional resume, not a generic AI summary.

STRICT RULES:
1. Use ONLY the retrieved evidence below.
2. Do NOT invent achievements, dates, metrics, employers, locations, tools, responsibilities, education details, or publication claims that are not supported by evidence.
3. If information such as name, address, email, phone, website, LinkedIn, or GitHub is missing, leave it blank using placeholders like:
   - [NAME]
   - [LOCATION]
   - [PHONE]
   - [EMAIL]
   - [WEBSITE]
   - [LINKEDIN]
   - [GITHUB]
4. If a section has weak evidence, keep it concise and conservative.
5. If there is not enough evidence for Experience, you may place strong items under Projects instead.
6. Publications & Awards is OPTIONAL. Include it only if there is clear supporting evidence.
7. Do not fabricate GPA, dates, company names, degree names, or job titles unless clearly supported.
8. Prefer ATS-friendly wording aligned with the job description.
9. Use strong action verbs, but remain truthful.
10. Output MUST be valid LaTeX body content following the template style.
11. Do not wrap the result in markdown fences.
12. Do not output explanations before or after the LaTeX.

RESUME TEMPLATE STYLE TO FOLLOW:
- Header with name and contact details on top
- Section order:
  1. Summary
  2. Education
  3. Skills
  4. Experience
  5. Projects
  6. Publications & Awards (optional)
- Skills grouped into categories
- Experience and Projects written as concise impact-oriented bullet points
- Clean, realistic formatting
- Professional tone suitable for software, data, or ML roles

OUTPUT FORMAT:
Return ONLY the content inside \\begin{{document}} ... \\end{{document}}.
That means include:
- \\begin{{center}} ... \\end{{center}}
- \\section{{Summary}}
- \\section{{Education}}
- \\section{{Skills}}
- \\section{{Experience}}
- \\section{{Projects}}
- optional \\section{{Publications \\& Awards}}

Use these exact latex macros where appropriate:
- \\resumeSubHeadingListStart
- \\resumeSubheading
- \\resumeItemListStart
- \\resumeItem
- \\resumeItemListEnd
- \\resumeSubHeadingListEnd
- \\resumeProjectHeading

GUIDANCE FOR EACH SECTION:

HEADER:
Use placeholders for missing personal info.
Format like:
\\begin{{center}}
    {{\\LARGE\\bfseries [NAME]}} \\\\[6pt]
    [LOCATION] \\textbar\\
    [PHONE] \\textbar\\
    \\href{{mailto:[EMAIL]}}{{[EMAIL]}} \\textbar\\
    \\href{{[WEBSITE]}}{{[WEBSITE]}} \\\\[2pt]
    \\href{{[LINKEDIN]}}{{[LINKEDIN]}} \\textbar\\
    \\href{{[GITHUB]}}{{[GITHUB]}}
\\end{{center}}

SUMMARY:
Write a concise 3-5 line professional summary aligned to the target job.
Use only supported skills and domains from evidence.

EDUCATION:
Only include education entries if there is evidence.
If no education evidence exists, create the section with a placeholder entry:
- Degree: [ADD EDUCATION]
- Institution: [ADD INSTITUTION]
- Dates: [ADD DATES]

SKILLS:
Infer skills conservatively from evidence.
Group them like:
- Programming
- Machine Learning / AI
- Data / Analytics
- Cloud / MLOps
- Tools / Frameworks
Only include categories that are supported.

EXPERIENCE:
Only include if evidence supports real experience-like entries.
If employer or role is unknown, use placeholders:
- [ROLE TITLE]
- [ORGANIZATION]
- [DATES]
Write 2-4 bullets per entry.
Bullets must sound professional and ATS-optimized.

PROJECTS:
Use this section for strong technical work from repositories, research, papers, or certifications when formal experience is unclear.
Each project can include tools/stack if supported.

PUBLICATIONS & AWARDS:
Include only if clearly supported by evidence.
This section is optional.

JOB TARGETING:
Target role: {req.target_role}
Must-have skills: {req.must_have_skills}
Nice-to-have skills: {req.nice_to_have_skills}
Tools and technologies: {req.tools_and_technologies}
Responsibilities: {req.responsibilities}
ATS keywords: {req.ats_keywords}

JOB DESCRIPTION:
{job_description}

RETRIEVED EVIDENCE:
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