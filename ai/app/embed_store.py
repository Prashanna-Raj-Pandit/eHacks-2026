from __future__ import annotations

from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection
from sentence_transformers import SentenceTransformer

from app.config import settings
from app.models import ChunkRecord


class EmbeddingStore:
    def __init__(self) -> None:
        self.model = SentenceTransformer(settings.embedding_model_name)
        self.client = chromadb.PersistentClient(path=str(settings.chroma_dir))
        self.collection: Collection = self.client.get_or_create_collection(
            name=settings.chroma_collection_name,
            metadata={"description": "Career evidence knowledge base"},
        )

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        vectors = self.model.encode(texts, normalize_embeddings=True)
        return vectors.tolist()

    def index_chunks(self, chunks: list[ChunkRecord], batch_size: int = 64) -> None:
        for start in range(0, len(chunks), batch_size):
            batch = chunks[start : start + batch_size]
            ids = [chunk.chunk_id for chunk in batch]
            docs = [chunk.text for chunk in batch]
            metadatas = [self._normalize_metadata(chunk.metadata) for chunk in batch]
            embeddings = self.embed_texts(docs)

            self.collection.upsert(
                ids=ids,
                documents=docs,
                metadatas=metadatas,
                embeddings=embeddings,
            )

    def query(self, query_text: str, top_k: int = 5, where: dict[str, Any] | None = None) -> dict[str, Any]:
        query_embedding = self.embed_texts([query_text])[0]
        return self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
        )

    @staticmethod
    def _normalize_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
        normalized: dict[str, Any] = {}
        for key, value in metadata.items():
            if isinstance(value, (str, int, float, bool)) or value is None:
                normalized[key] = value
            else:
                normalized[key] = str(value)
        return normalized