from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path

from ai.app.config import settings
from ai.app.profile_parser.parser import PortfolioProfileParser


def run_profile_parser(input_file: Path, save_prefix: str = "portfolio_profile") -> dict:
    settings.ensure_dirs()

    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {input_file}")

    parser = PortfolioProfileParser()
    profile = parser.parse_pdf(input_file)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = settings.portfolio_output_dir / f"{save_prefix}_{timestamp}.json"

    output_path.write_text(
        json.dumps(profile.model_dump(), indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    return {
        "profile": profile.model_dump(),
        "output_path": str(output_path),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Parse a resume/profile PDF into portfolio JSON")
    parser.add_argument("--input-file", type=str, required=True, help="Path to the input PDF file")
    parser.add_argument("--save-prefix", type=str, default="portfolio_profile")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result = run_profile_parser(Path(args.input_file), args.save_prefix)
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

# from __future__ import annotations
#
# import argparse
# import json
# from datetime import datetime
# from pathlib import Path
#
# from ai.app.config import settings
# from ai.app.profile_parser.parser import PortfolioProfileParser
#
#
# def parse_args() -> argparse.Namespace:
#     parser = argparse.ArgumentParser(description="Parse a resume/profile PDF into portfolio JSON")
#     parser.add_argument(
#         "--input-file",
#         type=str,
#         required=True,
#         help="Path to the input PDF file",
#     )
#     parser.add_argument(
#         "--save-prefix",
#         type=str,
#         default="portfolio_profile",
#         help="Prefix for the output JSON filename",
#     )
#     return parser.parse_args()
#
#
# def main() -> None:
#     settings.ensure_dirs()
#     args = parse_args()
#
#     pdf_path = Path(args.input_file)
#     if not pdf_path.exists():
#         raise FileNotFoundError(f"Input file not found: {pdf_path}")
#
#     parser = PortfolioProfileParser()
#     profile = parser.parse_pdf(pdf_path)
#
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     output_path = settings.portfolio_output_dir / f"{args.save_prefix}_{timestamp}.json"
#
#     output_path.write_text(
#         json.dumps(profile.model_dump(), indent=2, ensure_ascii=False),
#         encoding="utf-8",
#     )
#
#     print("[INFO] Portfolio profile extracted successfully.")
#     print(f"[INFO] Output written to: {output_path}")
#     print(profile.model_dump_json(indent=2))
#
#
# if __name__ == "__main__":
#     main()