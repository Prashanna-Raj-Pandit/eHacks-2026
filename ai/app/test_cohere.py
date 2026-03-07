from __future__ import annotations

from ai.app.cohere_client import CohereClient



def main() -> None:
    client = CohereClient()
    result = client.generate_text("Say hello in one sentence.")
    print(result)


if __name__ == "__main__":
    main()