from __future__ import annotations

import json
import re
from typing import Any

import cohere

from ai.app.config import settings


class CohereClient:
    def __init__(self) -> None:
        if not settings.cohere_api_key:
            raise ValueError("COHERE_API_KEY is missing in .env")

        self.client = cohere.ClientV2(api_key=settings.cohere_api_key)
        self.model_name = settings.cohere_model

    def generate_text(self, prompt: str, temperature: float = 0.2) -> str:
        response = self.client.chat(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=temperature,
        )

        text = self._extract_text(response)
        return text.strip()

    def generate_json(self, prompt: str, temperature: float = 0.1) -> dict[str, Any]:
        full_prompt = (
            prompt
            + "\n\nReturn only valid JSON. Do not wrap it in markdown fences."
        )

        response = self.client.chat(
            model=self.model_name,
            messages=[
                {
                    "role": "user",
                    "content": full_prompt,
                }
            ],
            temperature=temperature,
        )

        text = self._extract_text(response).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            text = re.sub(r"^```json\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            match = re.search(r"\{.*\}", text, flags=re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise

    @staticmethod
    def _extract_text(response: Any) -> str:
        parts: list[str] = []
        for item in getattr(response, "message", {}).content:
            if getattr(item, "type", "") == "text":
                parts.append(item.text)
        return "\n".join(parts)