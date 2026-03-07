from __future__ import annotations

from ai.app.chunker import DocumentChunker
from ai.app.config import settings
from ai.app.embed_store import EmbeddingStore
from ai.app.models import DocumentRecord
from ai.app.utils import read_jsonl, write_jsonl



def main() -> None:
    settings.ensure_dirs()

    if not settings.phase1_documents_path.exists():
        raise FileNotFoundError(
            f"Phase 1 file not found: {settings.phase1_documents_path}"
        )

    print(f"[INFO] Reading Phase 1 documents from: {settings.phase1_documents_path}")
    documents = read_jsonl(settings.phase1_documents_path, DocumentRecord)
    print(f"[INFO] Documents loaded: {len(documents)}")

    chunker = DocumentChunker()
    chunks = chunker.chunk_documents(documents)
    print(f"[INFO] Chunks created: {len(chunks)}")

    write_jsonl(settings.phase2_chunks_path, chunks)
    print(f"[INFO] Chunk file written: {settings.phase2_chunks_path}")

    store = EmbeddingStore()
    store.index_chunks(chunks)
    print(f"[INFO] Chunks indexed into ChromaDB at: {settings.chroma_dir}")
    print(f"[INFO] Collection name: {settings.chroma_collection_name}")


if __name__ == "__main__":
    main()