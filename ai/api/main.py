from __future__ import annotations

import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ai.app.config import settings
from ai.app.profile_parser.run import run_profile_parser
from ai.app.ingestion.ingest import main as phase1_main  # temporary if not yet refactored
from ai.app.indexing.phase2_index import main as phase2_main  # temporary if not yet refactored
from ai.app.pipelines.phase3_resume import run_phase3_resume

app = FastAPI(title="eHacks AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
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

    if not file.filename.lower().endswith(".pdf"):
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


@app.post("/api/resume-generator")
async def resume_generator(
    job_description: str = Form(...),
    target_role: str = Form(""),
) -> dict:
    settings.ensure_dirs()

    try:
        # Save JD to a temporary file
        jd_path = settings.output_dir / f"job_description_{uuid4()}.txt"
        jd_path.write_text(job_description, encoding="utf-8")

        # Temporary version: call your existing phase CLIs through imported main functions
        # Better version: replace these with run_phase1() and run_phase2() after refactor
        phase1_main()
        phase2_main()

        result = run_phase3_resume(
            job_file=jd_path,
            target_role=target_role,
            save_prefix="resume_api",
        )

        return {
            "success": True,
            "data": {
                "latex": result["latex"],
                "structured_json": result["structured_json"],
                "tex_path": result["tex_path"],
                "json_path": result["json_path"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))