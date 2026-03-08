from __future__ import annotations

from pathlib import Path
from typing import Any

from ai.app.config import settings
from ai.app.indexing.chunker import DocumentChunker
from ai.app.indexing.embed_store import EmbeddingStore
from ai.app.models import DocumentRecord
from ai.app.utils import read_jsonl, write_jsonl


def run_phase2(
    phase1_input_path: Path | None = None,
    phase2_output_path: Path | None = None,
) -> dict[str, Any]:
    settings.ensure_dirs()

    phase1_input_path = phase1_input_path or settings.phase1_documents_path
    phase2_output_path = phase2_output_path or settings.phase2_chunks_path

    if not phase1_input_path.exists():
        raise FileNotFoundError(f"Phase 1 file not found: {phase1_input_path}")

    print(f"[INFO] Reading Phase 1 documents from: {phase1_input_path}")
    documents = read_jsonl(phase1_input_path, DocumentRecord)
    print(f"[INFO] Documents loaded: {len(documents)}")

    chunker = DocumentChunker()
    chunks = chunker.chunk_documents(documents)
    print(f"[INFO] Chunks created: {len(chunks)}")

    write_jsonl(phase2_output_path, chunks)
    print(f"[INFO] Chunk file written: {phase2_output_path}")

    store = EmbeddingStore()
    store.index_chunks(chunks)
    print(f"[INFO] Chunks indexed into ChromaDB at: {settings.chroma_dir}")
    print(f"[INFO] Collection name: {settings.chroma_collection_name}")

    return {
        "success": True,
        "phase1_input_path": str(phase1_input_path),
        "phase2_output_path": str(phase2_output_path),
        "documents_loaded": len(documents),
        "chunks_created": len(chunks),
        "chroma_dir": str(settings.chroma_dir),
        "collection_name": settings.chroma_collection_name,
    }


def main() -> None:
    run_phase2()


if __name__ == "__main__":
    main()