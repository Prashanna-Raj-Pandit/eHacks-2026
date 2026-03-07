from __future__ import annotations

import re
from typing import Any


def latex_escape(text: str) -> str:
    if not text:
        return ""
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    pattern = re.compile("|".join(re.escape(k) for k in replacements))
    return pattern.sub(lambda m: replacements[m.group()], text)


def safe_url(url: str) -> str:
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://") or url.startswith("mailto:"):
        return url
    if "@" in url and not url.startswith("mailto:"):
        return f"mailto:{url}"
    return f"https://{url}"


def build_header(header: dict[str, Any]) -> str:
    name = latex_escape(header.get("name", "") or "[NAME]")
    location = latex_escape(header.get("location", "") or "[LOCATION]")
    phone = latex_escape(header.get("phone", "") or "[PHONE]")
    email = header.get("email", "") or "[EMAIL]"
    email_display = latex_escape(email)
    website_url = safe_url(header.get("website_url", "") or "[WEBSITE]")
    website_label = latex_escape(header.get("website_label", "") or header.get("website_url", "") or "[WEBSITE]")
    linkedin_url = safe_url(header.get("linkedin_url", "") or "[LINKEDIN]")
    linkedin_label = latex_escape(header.get("linkedin_label", "") or header.get("linkedin_url", "") or "[LINKEDIN]")
    github_url = safe_url(header.get("github_url", "") or "[GITHUB]")
    github_label = latex_escape(header.get("github_label", "") or header.get("github_url", "") or "[GITHUB]")

    return rf"""
\begin{{center}}
    {{\LARGE\bfseries {name}}} \\[6pt]
    {location} \textbar\ 
    {phone} \textbar\ 
    \href{{mailto:{email}}}{{{email_display}}} \textbar\ 
    \href{{{website_url}}}{{{website_label}}} \\[2pt]
    \href{{{linkedin_url}}}{{{linkedin_label}}} \textbar\ 
    \href{{{github_url}}}{{{github_label}}}
\end{{center}}
""".strip()


def build_summary(summary: str) -> str:
    summary = latex_escape(summary or "")
    return f"\\section{{Summary}}\n{summary}\n"


def build_education(education: list[dict[str, Any]]) -> str:
    if not education:
        education = [
            {
                "degree": "[ADD EDUCATION]",
                "dates": "[ADD DATES]",
                "institution": "[ADD INSTITUTION]",
                "location_gpa": "[ADD LOCATION / GPA]",
            }
        ]

    lines = ["\\section{Education}", "\\resumeSubHeadingListStart"]
    for item in education:
        degree = latex_escape(item.get("degree", ""))
        dates = latex_escape(item.get("dates", ""))
        institution = latex_escape(item.get("institution", ""))
        location_gpa = latex_escape(item.get("location_gpa", ""))
        lines.extend(
            [
                "  \\resumeSubheading",
                f"    {{{degree}}}{{{dates}}}",
                f"    {{{institution}}}{{{location_gpa}}}",
            ]
        )
    lines.append("\\resumeSubHeadingListEnd")
    return "\n".join(lines) + "\n"


def build_skills(skills: list[dict[str, Any]]) -> str:
    lines = ["\\section{Skills}"]
    for item in skills:
        category = latex_escape(item.get("category", ""))
        values = ", ".join(latex_escape(x) for x in item.get("items", []) if x)
        if category and values:
            lines.append(f"\\textbf{{{category}:}} {values} \\\\")
    if len(lines) == 1:
        lines.append("\\textbf{Skills:} [ADD SKILLS]")
    return "\n".join(lines) + "\n"


def build_experience(experience: list[dict[str, Any]]) -> str:
    lines = ["\\section{Experience}", "\\resumeSubHeadingListStart"]
    for item in experience:
        title = latex_escape(item.get("title", "") or "[ROLE TITLE]")
        dates = latex_escape(item.get("dates", "") or "[DATES]")
        organization = latex_escape(item.get("organization", "") or "[ORGANIZATION]")
        location = latex_escape(item.get("location", "") or "[LOCATION]")

        lines.extend(
            [
                "  \\resumeSubheading",
                f"    {{{title}}}{{{dates}}}",
                f"    {{{organization}}}{{{location}}}",
                "    \\resumeItemListStart",
            ]
        )

        bullets = item.get("bullets", []) or []
        for bullet in bullets:
            bullet = latex_escape(bullet)
            if bullet:
                lines.append(f"      \\resumeItem{{{bullet}}}")

        lines.append("    \\resumeItemListEnd")
    lines.append("\\resumeSubHeadingListEnd")
    return "\n".join(lines) + "\n"


def build_projects(projects: list[dict[str, Any]]) -> str:
    lines = ["\\section{Projects}", "\\resumeSubHeadingListStart"]
    for item in projects:
        name = latex_escape(item.get("name", "") or "[PROJECT NAME]")
        tech = latex_escape(item.get("tech", "") or "")
        label_right = latex_escape(item.get("label_right", "") or "")

        if tech:
            left = rf"\textbf{{{name}}} $|$ \emph{{{tech}}}"
        else:
            left = rf"\textbf{{{name}}}"

        lines.extend(
            [
                "  \\resumeProjectHeading",
                f"    {{{left}}}{{{label_right}}}",
                "    \\resumeItemListStart",
            ]
        )

        bullets = item.get("bullets", []) or []
        for bullet in bullets:
            bullet = latex_escape(bullet)
            if bullet:
                lines.append(f"      \\resumeItem{{{bullet}}}")

        lines.append("    \\resumeItemListEnd")
    lines.append("\\resumeSubHeadingListEnd")
    return "\n".join(lines) + "\n"


def build_publications_awards(items: list[str]) -> str:
    cleaned = [latex_escape(x) for x in items if x and x.strip()]
    if not cleaned:
        return ""
    lines = ["\\section{Publications \\& Awards}"]
    for item in cleaned:
        lines.append(item + r" \\")
    return "\n".join(lines) + "\n"


def build_full_resume_latex(data: dict[str, Any]) -> str:
    header = build_header(data.get("header", {}))
    summary = build_summary(data.get("summary", ""))
    education = build_education(data.get("education", []))
    skills = build_skills(data.get("skills", []))
    experience = build_experience(data.get("experience", []))
    projects = build_projects(data.get("projects", []))
    publications_awards = build_publications_awards(data.get("publications_awards", []))

    return rf"""%-------------------------
% Resume in Latex
% Generated by eHacks Resume RAG
%------------------------

\documentclass[letterpaper,10pt]{{article}}

\usepackage{{latexsym}}
\usepackage[empty]{{fullpage}}
\usepackage{{titlesec}}
\usepackage[usenames,dvipsnames]{{color}}
\usepackage{{enumitem}}
\usepackage[hidelinks]{{hyperref}}
\usepackage{{fancyhdr}}
\usepackage[english]{{babel}}
\usepackage{{tabularx}}
\usepackage{{multicol}}
\setlength{{\multicolsep}}{{-3.0pt}}
\setlength{{\columnsep}}{{-1pt}}
\input{{glyphtounicode}}
\usepackage{{lmodern}}

\pagestyle{{fancy}}
\fancyhf{{}}
\fancyfoot{{}}
\renewcommand{{\headrulewidth}}{{0pt}}
\renewcommand{{\footrulewidth}}{{0pt}}

\addtolength{{\oddsidemargin}}{{-0.6in}}
\addtolength{{\evensidemargin}}{{-0.5in}}
\addtolength{{\textwidth}}{{1.19in}}
\addtolength{{\topmargin}}{{-.7in}}
\addtolength{{\textheight}}{{1.4in}}

\urlstyle{{same}}
\raggedbottom
\raggedright
\setlength{{\tabcolsep}}{{0in}}

\titleformat{{\section}}{{
  \vspace{{-7pt}}\scshape\raggedright\normalsize\bfseries
}}{{}}{{0em}}{{}}[\color{{black}}\titlerule \vspace{{-6pt}}]

\pdfgentounicode=1

\newcommand{{\resumeItem}}[1]{{\item{{#1 \vspace{{-3pt}}}}}}
\newcommand{{\resumeSubheading}}[4]{{
  \vspace{{-3pt}}\item
    \begin{{tabular*}}{{1.0\textwidth}}[t]{{l@{{\extracolsep{{\fill}}}}r}}
      \textbf{{#1}} & \textbf{{#2}} \\
      \textit{{#3}} & \textit{{#4}} \\
    \end{{tabular*}}\vspace{{-6pt}}
}}
\newcommand{{\resumeProjectHeading}}[2]{{
    \vspace{{-3pt}}\item
    \begin{{tabular*}}{{1.0\textwidth}}[t]{{l@{{\extracolsep{{\fill}}}}r}}
      #1 & \textbf{{#2}}\\
    \end{{tabular*}}\vspace{{-6pt}}
}}
\newcommand{{\resumeItemListStart}}{{\begin{{itemize}}}}
\newcommand{{\resumeItemListEnd}}{{\end{{itemize}}\vspace{{-6pt}}}}
\newcommand{{\resumeSubHeadingListStart}}{{\begin{{itemize}}[leftmargin=0.0in, label={{}}]}}
\newcommand{{\resumeSubHeadingListEnd}}{{\end{{itemize}}}}

\begin{{document}}

{header}

{summary}

{education}

{skills}

{experience}

{projects}
{publications_awards}
\end{{document}}
""".strip() + "\n"