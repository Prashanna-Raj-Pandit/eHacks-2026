from __future__ import annotations

import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ai.app.config import settings
from ai.app.profile_parser.run import run_profile_parser
from ai.app.ingestion.ingest import run_phase1
from ai.app.indexing.phase2_index import run_phase2
from ai.app.pipelines.phase3_resume import run_phase3_resume

app = FastAPI(title="eHacks AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"success": True, "message": "AI API is running"}


@app.post("/api/profile-parser")
async def profile_parser(file: UploadFile = File(...)) -> dict:
    settings.ensure_dirs()

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    temp_name = f"{uuid4()}_{file.filename}"
    temp_path = settings.portfolio_input_dir / temp_name

    with temp_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        result = run_profile_parser(temp_path, save_prefix="profile")
        return {
            "success": True,
            "data": result["profile"],
            "output_path": result["output_path"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _clear_directory_files(directory: Path) -> None:
    if not directory.exists():
        return

    for item in directory.iterdir():
        if item.is_file():
            item.unlink()


@app.post("/api/resume-generator")
async def resume_generator(
    job_description: str = Form(...),
    target_role: str = Form(""),
    github_user: str = Form(""),
    repos: str = Form(""),
    repo_limit: int = Form(3),
    files: list[UploadFile] = File(default=[]),
) -> dict:
    settings.ensure_dirs()

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required.")

    try:
        # Parse repo list from comma-separated form field
        parsed_repos = [repo.strip() for repo in repos.split(",") if repo.strip()]

        has_github = bool(github_user.strip())
        has_files = len(files) > 0

        if not has_github and not has_files:
            raise HTTPException(
                status_code=400,
                detail="Provide at least one source: uploaded PDF files or github_user.",
            )

        # Clear previous uploaded PDFs so each request uses only current uploaded files
        _clear_directory_files(settings.pdf_dir)

        saved_files: list[str] = []

        # Save uploaded PDFs into data/raw/pdfs
        for file in files:
            if not file.filename:
                continue

            if not file.filename.lower().endswith(".pdf"):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type for {file.filename}. Only PDF files are allowed.",
                )

            safe_name = f"{uuid4()}_{file.filename}"
            file_path = settings.pdf_dir / safe_name

            with file_path.open("wb") as f:
                shutil.copyfileobj(file.file, f)

            saved_files.append(str(file_path))

        # Save job description to a temp file
        jd_path = settings.output_dir / f"job_description_{uuid4()}.txt"
        jd_path.write_text(job_description, encoding="utf-8")

        # Decide what sources to use
        skip_github = not has_github
        skip_pdf = not has_files

        phase1_result = run_phase1(
            repos=parsed_repos,
            github_user=github_user.strip() or None,
            repo_limit=repo_limit,
            skip_github=skip_github,
            skip_pdf=skip_pdf,
        )

        phase2_result = run_phase2()

        phase3_result = run_phase3_resume(
            job_file=jd_path,
            target_role=target_role,
            save_prefix="resume_api",
        )

        return {
            "success": True,
            "data": {
                "uploaded_files": saved_files,
                "github_user": github_user.strip(),
                "repos": parsed_repos,
                "phase1": phase1_result,
                "phase2": phase2_result,
                "latex": phase3_result["latex"],
                "structured_json": phase3_result["structured_json"],
                "tex_path": phase3_result["tex_path"],
                "json_path": phase3_result["json_path"],
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))