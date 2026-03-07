from __future__ import annotations

from langchain_text_splitters import RecursiveCharacterTextSplitter

from ai.app.config import settings
from ai.app.models import ChunkRecord, DocumentRecord
from ai.app.utils import make_doc_id


class DocumentChunker:
    def __init__(self) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def chunk_documents(self, docs: list[DocumentRecord]) -> list[ChunkRecord]:
        chunks: list[ChunkRecord] = []

        for doc in docs:
            split_texts = self.splitter.split_text(doc.text)
            for idx, chunk_text in enumerate(split_texts):
                chunk_id = make_doc_id(doc.doc_id, str(idx))
                metadata = dict(doc.metadata)
                metadata.update(
                    {
                        "chunk_index": idx,
                        "parent_doc_id": doc.doc_id,
                    }
                )

                chunks.append(
                    ChunkRecord(
                        chunk_id=chunk_id,
                        parent_doc_id=doc.doc_id,
                        text=chunk_text,
                        metadata=metadata,
                    )
                )

        return chunks