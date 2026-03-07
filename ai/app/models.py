from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class DocumentRecord(BaseModel):
    doc_id: str
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class ChunkRecord(BaseModel):
    chunk_id: str
    parent_doc_id: str
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class JobRequirements(BaseModel):
    target_role: str = ""
    must_have_skills: list[str] = Field(default_factory=list)
    nice_to_have_skills: list[str] = Field(default_factory=list)
    tools_and_technologies: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    ats_keywords: list[str] = Field(default_factory=list)


class RetrievedEvidence(BaseModel):
    chunk_id: str
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    query_used: str = ""


class ResumeGenerationResult(BaseModel):
    job_requirements: JobRequirements
    evidence: list[RetrievedEvidence] = Field(default_factory=list)
    final_markdown: str = ""