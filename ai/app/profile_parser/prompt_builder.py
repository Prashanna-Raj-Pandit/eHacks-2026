from __future__ import annotations


class ProfilePromptBuilder:
    @staticmethod
    def build_profile_extraction_prompt(document_text: str) -> str:
        return f"""
You are a resume/profile parser.

Extract structured profile information from the provided resume/profile text.

Return ONLY valid JSON using EXACTLY this schema:

{{
  "user": {{
    "firstName": "",
    "lastName": "",
    "email": "",
    "phone": "",
    "bio": "",
    "location": "",
    "skills": [""]
  }},
  "workExperience": [
    {{
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }}
  ],
  "education": [
    {{
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": "",
      "current": false
    }}
  ]
}}

Rules:
1. Use only the document text provided.
2. Do not invent missing information.
3. If a value is missing, return an empty string.
4. If a list has no valid items, return an empty list.
5. Normalize dates to YYYY-MM when possible.
6. If the document says Present or Current, set current=true and endDate="".
7. Keep bio concise, 2 to 4 sentences maximum, based on the summary/profile text.
8. Skills should be a clean deduplicated list of real skills visible in the document.
9. Work descriptions should be short but informative.
10. Return only JSON.

Document text:
{document_text}
""".strip()