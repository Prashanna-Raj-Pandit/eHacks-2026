from __future__ import annotations

from app.config import settings
from app.loaders.ingest import GitHubIngestor
from app.loaders.pdf_ingestor import PDFIngestor
from app.utils import write_jsonl


def run() -> None:
    settings.ensure_dirs()

    github = GitHubIngestor()
    pdfs = PDFIngestor()

    all_records = []

    # GitHub: ingest latest 5 repos by default
    repos = github.list_user_repos(limit=5)
    repo_names = [r["name"] for r in repos if "name" in r]
    all_records.extend(github.ingest_selected_repos(repo_names=repo_names))

    # PDFs: ingest from PDF_DIR
    all_records.extend(pdfs.ingest_directory(settings.pdf_dir))

    out_path = settings.output_dir / "phase1_documents.jsonl"
    write_jsonl(out_path, all_records)

    print(f"Wrote {len(all_records)} records -> {out_path}")


if __name__ == "__main__":
    run()