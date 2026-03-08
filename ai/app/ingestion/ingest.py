from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

from ai.app.config import settings
from ai.app.ingestion.github_ingestor import GitHubIngestor
from ai.app.ingestion.pdf_ingestor import PDFIngestor
from ai.app.utils import write_jsonl


def run_phase1(
    repos: list[str] | None = None,
    github_user: str | None = None,
    repo_limit: int = 3,
    skip_github: bool = False,
    skip_pdf: bool = False,
    output_path: Path | None = None,
) -> dict[str, Any]:
    settings.ensure_dirs()

    repos = repos or []
    github_user = github_user or settings.github_username
    output_path = output_path or settings.phase1_documents_path

    all_records = []
    github_records = []
    pdf_records = []
    repo_names: list[str] = []

    if not skip_github:
        github = GitHubIngestor()
        repo_names = repos

        if not repo_names:
            fetched_repos = github.list_user_repos(
                username=github_user,
                limit=repo_limit,
            )
            repo_names = [repo["name"] for repo in fetched_repos]

        print(f"[INFO] Ingesting GitHub repos: {repo_names}")
        github_records = github.ingest_selected_repos(
            repo_names=repo_names,
            owner=github_user,
        )
        print(f"[INFO] GitHub records collected: {len(github_records)}")
        all_records.extend(github_records)

    if not skip_pdf:
        pdf_ingestor = PDFIngestor()
        pdf_records = pdf_ingestor.ingest_directory(settings.pdf_dir)
        print(f"[INFO] PDF records collected: {len(pdf_records)}")
        all_records.extend(pdf_records)

    write_jsonl(output_path, all_records)

    print(f"[INFO] Total records written: {len(all_records)}")
    print(f"[INFO] Output file: {output_path}")

    return {
        "success": True,
        "output_path": str(output_path),
        "total_records": len(all_records),
        "github_records": len(github_records),
        "pdf_records": len(pdf_records),
        "repos_used": repo_names,
        "github_skipped": skip_github,
        "pdf_skipped": skip_pdf,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Phase 1 ingestion for career RAG MVP")
    parser.add_argument(
        "--repos",
        nargs="*",
        default=[],
        help="Specific GitHub repo names to ingest",
    )
    parser.add_argument(
        "--github-user",
        default=settings.github_username,
        help="GitHub username or owner",
    )
    parser.add_argument(
        "--repo-limit",
        type=int,
        default=3,
        help="If no repos are given, ingest this many recent repos",
    )
    parser.add_argument(
        "--skip-github",
        action="store_true",
        help="Skip GitHub ingestion",
    )
    parser.add_argument(
        "--skip-pdf",
        action="store_true",
        help="Skip PDF ingestion",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run_phase1(
        repos=args.repos,
        github_user=args.github_user,
        repo_limit=args.repo_limit,
        skip_github=args.skip_github,
        skip_pdf=args.skip_pdf,
    )


if __name__ == "__main__":
    main()