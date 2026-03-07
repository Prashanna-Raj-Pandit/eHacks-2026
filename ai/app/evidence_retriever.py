from __future__ import annotations

from collections import OrderedDict

from ai.app.config import settings
from ai.app.embed_store import EmbeddingStore
from ai.app.models import JobRequirements, RetrievedEvidence


class EvidenceRetriever:
    def __init__(self) -> None:
        self.store = EmbeddingStore()

    def build_queries(self, job_description: str, req: JobRequirements) -> list[str]:
        queries: list[str] = []

        if req.target_role:
            queries.append(req.target_role)

        queries.extend(req.must_have_skills[:6])
        queries.extend(req.tools_and_technologies[:6])
        queries.extend(req.ats_keywords[:6])

        combined = ", ".join(req.must_have_skills[:5] + req.tools_and_technologies[:5])
        if combined:
            queries.append(combined)

        trimmed_jd = job_description[:1500].strip()
        if trimmed_jd:
            queries.append(trimmed_jd)

        unique_queries = list(OrderedDict.fromkeys(q.strip() for q in queries if q.strip()))
        return unique_queries[:12]

    def retrieve(self, job_description: str, req: JobRequirements, top_k_per_query: int = 4) -> list[RetrievedEvidence]:
        queries = self.build_queries(job_description, req)
        seen_chunk_ids: set[str] = set()
        evidence_items: list[RetrievedEvidence] = []

        for query in queries:
            results = self.store.query(query, top_k=top_k_per_query)
            ids = results.get("ids", [[]])[0]
            docs = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]

            for idx, chunk_id in enumerate(ids):
                if chunk_id in seen_chunk_ids:
                    continue
                seen_chunk_ids.add(chunk_id)

                text = docs[idx] if idx < len(docs) else ""
                metadata = metadatas[idx] if idx < len(metadatas) else {}

                evidence_items.append(
                    RetrievedEvidence(
                        chunk_id=chunk_id,
                        text=text,
                        metadata=metadata,
                        query_used=query,
                    )
                )

        return evidence_items[: settings.top_k_results]