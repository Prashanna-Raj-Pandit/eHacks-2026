from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parents[2]

@dataclass
class Settings:
    portfolio_input_dir: Path = PROJECT_ROOT / os.getenv("PORTFOLIO_INPUT_DIR", "data/portfolio_inputs")
    portfolio_output_dir: Path = PROJECT_ROOT / os.getenv("PORTFOLIO_OUTPUT_DIR", "data/portfolio_outputs")

    cohere_api_key: str = os.getenv("COHERE_API_KEY", "")
    cohere_model: str = os.getenv("COHERE_MODEL", "command-r-plus-08-2024")

    github_token: str = os.getenv("GITHUB_TOKEN", "")
    github_username: str = os.getenv("GITHUB_USERNAME", "")
    output_dir: Path = Path(os.getenv("OUTPUT_DIR", "data/processed"))
    pdf_dir: Path = Path(os.getenv("PDF_DIR", "data/raw/pdfs"))
    local_repo_dir: Path = Path(os.getenv("LOCAL_REPO_DIR", "data/raw/repos"))

    github_api_base: str = "https://api.github.com"
    github_timeout_seconds: int = 30
    max_file_size_bytes: int = 350_000

    chunk_size: int = int(os.getenv("CHUNK_SIZE", "1200"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    phase1_documents_path: Path = PROJECT_ROOT / "data/processed/phase1_documents.jsonl"
    phase2_chunks_path: Path = PROJECT_ROOT / "data/processed/phase2_chunks.jsonl"
    chroma_dir: Path = PROJECT_ROOT / "data/chroma_db"

    phase3_output_dir: Path = PROJECT_ROOT / "data/outputs"
    top_k_results: int = int(os.getenv("TOP_K_RESULTS", "12"))

    chroma_collection_name: str = os.getenv("CHROMA_COLLECTION_NAME", "career_kb")
    embedding_model_name: str = os.getenv(
        "EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"
    )

    allowed_extensions: set[str] = field(
        default_factory=lambda: {
            ".md", ".txt", ".py", ".js", ".ts", ".tsx", ".jsx",
            ".java", ".c", ".cpp", ".h", ".hpp", ".go", ".rs",
            ".rb", ".php", ".swift", ".kt", ".scala", ".sql",
            ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
            ".html", ".css", ".sh", ".ipynb", ".tex", ".r",
        }
    )

    allowed_exact_names: set[str] = field(
        default_factory=lambda: {
            "README", "README.md", "readme.md", "LICENSE",
            "requirements.txt", "Dockerfile", ".gitignore",
        }
    )

    ignored_directories: set[str] = field(
        default_factory=lambda: {
            ".git", ".github", "node_modules", "dist", "build", "target",
            "vendor", "venv", ".venv", "__pycache__", ".idea", ".vscode",
            "coverage", "out", "bin", "obj", "site-packages", "migrations",
        }
    )

    ignored_file_patterns: tuple[str, ...] = (
        ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg",
        ".pdf", ".zip", ".tar", ".gz", ".7z", ".jar", ".exe", ".dll",
        ".so", ".dylib", ".class", ".o", ".a", ".obj",
        ".lock", ".min.js", ".min.css",
    )

    def ensure_dirs(self) -> None:
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.pdf_dir.mkdir(parents=True, exist_ok=True)
        self.local_repo_dir.mkdir(parents=True, exist_ok=True)
        self.chroma_dir.mkdir(parents=True, exist_ok=True)
        self.phase3_output_dir.mkdir(parents=True, exist_ok=True)
        self.portfolio_input_dir.mkdir(parents=True, exist_ok=True)
        self.portfolio_output_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()