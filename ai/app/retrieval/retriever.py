from __future__ import annotations

import argparse

from ai.app.indexing.embed_store import EmbeddingStore



def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Query the career knowledge base")
    parser.add_argument("query", type=str, help="The question to search for")
    parser.add_argument("--top-k", type=int, default=5, help="Number of results to return")
    parser.add_argument(
        "--source-type",
        type=str,
        default="",
        help="Optional metadata filter, e.g. pdf or github_repo",
    )
    return parser.parse_args()



def main() -> None:
    args = parse_args()
    store = EmbeddingStore()

    where = None
    if args.source_type:
        where = {"source_type": args.source_type}

    results = store.query(args.query, top_k=args.top_k, where=where)

    ids = results.get("ids", [[]])[0]
    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0] if results.get("distances") else []

    if not ids:
        print("No results found.")
        return

    for i, chunk_id in enumerate(ids, start=1):
        metadata = metadatas[i - 1] if i - 1 < len(metadatas) else {}
        text = docs[i - 1] if i - 1 < len(docs) else ""
        score = distances[i - 1] if i - 1 < len(distances) else "N/A"

        print("=" * 80)
        print(f"Result #{i}")
        print(f"Chunk ID: {chunk_id}")
        print(f"Score/Distance: {score}")
        print(f"Source Type: {metadata.get('source_type', '')}")
        print(f"Repo: {metadata.get('repo', '')}")
        print(f"File Path: {metadata.get('file_path', '')}")
        print(f"PDF: {metadata.get('source_name', '')}")
        print(f"Page: {metadata.get('page', '')}")
        print("Text Preview:")
        print(text[:800])
        print()


if __name__ == "__main__":
    main()