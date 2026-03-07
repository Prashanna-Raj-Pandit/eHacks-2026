from __future__ import annotations

import base64
from pathlib import Path
from typing import Any

import requests

from ai.app.config import settings
from ai.app.models import DocumentRecord
from ai.app.utils import clean_text, make_doc_id, redact_secrets


class GitHubIngestor:
    def __init__(self) -> None:
        self.session = requests.Session()
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "career-rag-mvp",
        }
        if settings.github_token:
            headers["Authorization"] = f"Bearer {settings.github_token}"
        self.session.headers.update(headers)

    def _get(self, url: str, params: dict[str, Any] | None = None) -> Any:
        response = self.session.get(url, params=params, timeout=settings.github_timeout_seconds)
        response.raise_for_status()
        return response.json()

    def list_user_repos(self, username: str | None = None, limit: int = 5) -> list[dict[str, Any]]:
        username = username or settings.github_username
        if not username:
            raise ValueError("GitHub username not found. Set GITHUB_USERNAME in .env")

        repos = self._get(
            f"{settings.github_api_base}/users/{username}/repos",
            params={"per_page": min(limit, 100), "sort": "updated"},
        )
        return repos[:limit]

    def should_include_file(self, path_str: str, size: int = 0) -> bool:
        path = Path(path_str)

        if any(part in settings.ignored_directories for part in path.parts):
            return False

        if size > settings.max_file_size_bytes:
            return False

        lower_name = path.name.lower()
        if any(lower_name.endswith(pattern) for pattern in settings.ignored_file_patterns):
            return False

        if path.name in settings.allowed_exact_names:
            return True

        return path.suffix.lower() in settings.allowed_extensions

    def fetch_repo_tree(self, owner: str, repo: str, branch: str) -> list[dict[str, Any]]:
        tree_url = f"{settings.github_api_base}/repos/{owner}/{repo}/git/trees/{branch}"
        data = self._get(tree_url, params={"recursive": "1"})
        return data.get("tree", [])

    def fetch_file_content(self, owner: str, repo: str, file_path: str) -> str | None:
        url = f"{settings.github_api_base}/repos/{owner}/{repo}/contents/{file_path}"
        try:
            data = self._get(url)
        except requests.HTTPError:
            return None

        if isinstance(data, list):
            return None

        if data.get("encoding") == "base64" and data.get("content"):
            try:
                decoded = base64.b64decode(data["content"])
                return decoded.decode("utf-8", errors="ignore")
            except Exception:
                return None

        download_url = data.get("download_url")
        if download_url:
            try:
                response = self.session.get(download_url, timeout=settings.github_timeout_seconds)
                response.raise_for_status()
                return response.text
            except Exception:
                return None

        return None

    def ingest_repo(self, owner: str, repo: str, branch: str = "main") -> list[DocumentRecord]:
        records: list[DocumentRecord] = []

        try:
            tree = self.fetch_repo_tree(owner, repo, branch)
        except requests.HTTPError:
            if branch == "main":
                tree = self.fetch_repo_tree(owner, repo, "master")
                branch = "master"
            else:
                raise

        for item in tree:
            if item.get("type") != "blob":
                continue

            path_str = item.get("path", "")
            size = item.get("size", 0)

            if not self.should_include_file(path_str, size):
                continue

            content = self.fetch_file_content(owner, repo, path_str)
            if not content:
                continue

            cleaned = clean_text(redact_secrets(content))
            if len(cleaned) < 20:
                continue

            record = DocumentRecord(
                doc_id=make_doc_id("github", owner, repo, path_str),
                text=cleaned,
                metadata={
                    "source_type": "github_repo",
                    "owner": owner,
                    "repo": repo,
                    "branch": branch,
                    "file_path": path_str,
                    "file_size": size,
                    "url": f"https://github.com/{owner}/{repo}/blob/{branch}/{path_str}",
                },
            )
            records.append(record)

        return records

    def ingest_selected_repos(self, repo_names: list[str], owner: str | None = None) -> list[DocumentRecord]:
        owner = owner or settings.github_username
        if not owner:
            raise ValueError("GitHub username not found. Set GITHUB_USERNAME in .env")

        all_records: list[DocumentRecord] = []
        for repo_name in repo_names:
            repo_records = self.ingest_repo(owner=owner, repo=repo_name)
            all_records.extend(repo_records)
        return all_records