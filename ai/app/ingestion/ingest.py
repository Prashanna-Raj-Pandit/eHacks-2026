from __future__ import annotations

import argparse

from ai.app.config import settings
from ai.app.ingestion.github_ingestor import GitHubIngestor
from ai.app.ingestion.pdf_ingestor import PDFIngestor
from ai.app.utils import write_jsonl


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
    settings.ensure_dirs()

    all_records = []

    if not args.skip_github:
        github = GitHubIngestor()
        repo_names = args.repos

        if not repo_names:
            repos = github.list_user_repos(username=args.github_user, limit=args.repo_limit)
            repo_names = [repo["name"] for repo in repos]

        print(f"[INFO] Ingesting GitHub repos: {repo_names}")
        github_records = github.ingest_selected_repos(repo_names=repo_names, owner=args.github_user)
        print(f"[INFO] GitHub records collected: {len(github_records)}")
        all_records.extend(github_records)

    if not args.skip_pdf:
        pdf_ingestor = PDFIngestor()
        pdf_records = pdf_ingestor.ingest_directory(settings.pdf_dir)
        print(f"[INFO] PDF records collected: {len(pdf_records)}")
        all_records.extend(pdf_records)

    output_path = settings.output_dir / "phase1_documents.jsonl"
    write_jsonl(output_path, all_records)
    print(f"[INFO] Total records written: {len(all_records)}")
    print(f"[INFO] Output file: {output_path}")


if __name__ == "__main__":
    main()
