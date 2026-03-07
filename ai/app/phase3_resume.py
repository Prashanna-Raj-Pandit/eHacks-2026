from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path

from ai.app.config import settings
from ai.app.evidence_retriever import EvidenceRetriever
from ai.app.job_parser import JobDescriptionParser
from ai.app.models import ResumeGenerationResult
from ai.app.resume_generator import ResumeGenerator



def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate evidence-grounded resume content")
    parser.add_argument(
        "--job-file",
        type=str,
        required=True,
        help="Path to a text file containing the job description",
    )
    parser.add_argument(
        "--target-role",
        type=str,
        default="",
        help="Optional target role hint",
    )
    parser.add_argument(
        "--save-prefix",
        type=str,
        default="resume_output",
        help="Prefix for output files",
    )
    return parser.parse_args()


def read_job_description(path: str) -> str:
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"Job description file not found: {path}")
    return file_path.read_text(encoding="utf-8").strip()



def main() -> None:
    settings.ensure_dirs()
    args = parse_args()

    job_description = read_job_description(args.job_file)
    if not job_description:
        raise ValueError("Job description file is empty.")

    print("[INFO] Extracting job requirements...")
    parser = JobDescriptionParser()
    requirements = parser.extract_requirements(
        job_description=job_description,
        target_role=args.target_role,
    )
    print(f"[INFO] Target role: {requirements.target_role}")
    print(f"[INFO] Must-have skills found: {len(requirements.must_have_skills)}")

    print("[INFO] Retrieving evidence from ChromaDB...")
    retriever = EvidenceRetriever()
    evidence = retriever.retrieve(job_description=job_description, req=requirements)
    print(f"[INFO] Evidence chunks retrieved: {len(evidence)}")

    print("[INFO] Generating final resume content with Cohere...")
    generator = ResumeGenerator()
    final_markdown = generator.generate(
        job_description=job_description,
        requirements=requirements,
        evidence=evidence,
    )

    result = ResumeGenerationResult(
        job_requirements=requirements,
        evidence=evidence,
        final_markdown=final_markdown,
    )

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # md_path = settings.phase3_output_dir / f"{args.save_prefix}_{timestamp}.md"
    md_path = settings.phase3_output_dir / f"{args.save_prefix}_{timestamp}.tex" # Latex
    json_path = settings.phase3_output_dir / f"{args.save_prefix}_{timestamp}.json"

    md_path.write_text(final_markdown, encoding="utf-8")
    json_path.write_text(result.model_dump_json(indent=2), encoding="utf-8")

    print("\n" + "=" * 100)
    print(final_markdown)
    print("=" * 100)
    print(f"[INFO] LaTex output saved to: {md_path}")
    print(f"[INFO] JSON output saved to: {json_path}")


if __name__ == "__main__":
    main()