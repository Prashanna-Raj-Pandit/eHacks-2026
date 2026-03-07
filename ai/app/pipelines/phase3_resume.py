from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

from ai.app.config import settings
from ai.app.retrieval.evidence_retriever import EvidenceRetriever
from ai.app.llm.job_parser import JobDescriptionParser
from ai.app.rendering.latex_renderer import build_full_resume_latex
from ai.app.llm.resume_generator import ResumeGenerator


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate professional LaTeX resume from evidence")
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

    print("[INFO] Retrieving evidence from ChromaDB...")
    retriever = EvidenceRetriever()
    evidence = retriever.retrieve(job_description=job_description, req=requirements)
    print(f"[INFO] Evidence chunks retrieved: {len(evidence)}")

    print("[INFO] Generating structured resume data with Cohere...")
    generator = ResumeGenerator()
    structured_resume = generator.generate_structured_resume(
        job_description=job_description,
        requirements=requirements,
        evidence=evidence,
    )

    print("[INFO] Rendering final LaTeX resume...")
    latex_output = build_full_resume_latex(structured_resume)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = settings.phase3_output_dir / f"{args.save_prefix}_{timestamp}.json"
    tex_path = settings.phase3_output_dir / f"{args.save_prefix}_{timestamp}.tex"

    json_path.write_text(json.dumps(structured_resume, indent=2, ensure_ascii=False), encoding="utf-8")
    tex_path.write_text(latex_output, encoding="utf-8")

    print(f"[INFO] Structured JSON saved to: {json_path}")
    print(f"[INFO] Final LaTeX saved to: {tex_path}")
    print("\n" + "=" * 100)
    print(latex_output)
    print("=" * 100)


if __name__ == "__main__":
    main()