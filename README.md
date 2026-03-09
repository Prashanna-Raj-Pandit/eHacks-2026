# EvidenceCV: Evidence-Based Resume Generation using RAG

> 🏆 Built at **eHacks Hackathon** — St. Louis, 2026 (Mar 6–8) &nbsp;|&nbsp; 🥉 **3rd Place Winner**
## Overview

The hiring landscape has changed dramatically in recent years. Most companies no longer manually review resumes first - they rely on AI-driven Applicant Tracking Systems (ATS) to automatically filter candidates before a human ever sees the application.

While this improves efficiency for recruiters, it creates major problems for applicants:
- Qualified candidates are often rejected because their resume does not perfectly match ATS keywords.
- Applicants forget projects or skills they worked on years ago.
- Many candidates exaggerate or fabricate experience to pass automated filters.
- People with strong real-world evidence (GitHub projects, research papers, certifications) struggle to summarize everything accurately in a resume.

This project aims to solve that problem by building an AI-powered evidence-based resume generator that automatically gathers a candidate's real work and generates a tailored resume aligned with a specific job description.

Instead of manually writing resumes, this system builds a knowledge base of the candidate's actual work and uses Retrieval-Augmented Generation (RAG) to create a resume grounded in real evidence.

### Built With

* [![Python][Python-logo]][Python-url]
* [![FastAPI][FastAPI-logo]][FastAPI-url]
* [![React][React-logo]][React-url]
* [![TypeScript][TypeScript-logo]][TypeScript-url]
* [![Vite][Vite-logo]][Vite-url]
* [![Cohere][Cohere-logo]][Cohere-url]
* [![ChromaDB][ChromaDB-logo]][ChromaDB-url]
* [![HuggingFace][HuggingFace-logo]][HuggingFace-url]
* [![GitHub][GitHub-logo]][GitHub-url]

[Python-logo]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org

[FastAPI-logo]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white
[FastAPI-url]: https://fastapi.tiangolo.com

[React-logo]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org

[TypeScript-logo]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org

[Vite-logo]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev

[Cohere-logo]: https://img.shields.io/badge/Cohere-39594E?style=for-the-badge&logo=cohere&logoColor=white
[Cohere-url]: https://cohere.com

[ChromaDB-logo]: https://img.shields.io/badge/ChromaDB-FF6B35?style=for-the-badge&logo=databricks&logoColor=white
[ChromaDB-url]: https://www.trychroma.com

[HuggingFace-logo]: https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black
[HuggingFace-url]: https://huggingface.co/sentence-transformers

[GitHub-logo]: https://img.shields.io/badge/GitHub_API-181717?style=for-the-badge&logo=github&logoColor=white
[GitHub-url]: https://docs.github.com/en/rest


## Problem Statement

In today's job market:
- Recruiters receive hundreds or thousands of applications.
- Most resumes are filtered by AI systems before human review.
- ATS systems rank resumes based on keyword similarity with job descriptions.

This leads to several issues:
1. Qualified candidates get rejected because their resume wording doesn't match ATS keywords.
2. Applicants forget past work such as GitHub projects, academic work, or research they completed years earlier.
3. Candidates exaggerate experience to match job requirements.
4. Evidence of skills exists online, but resumes fail to capture it.

For example, many developers may have:
- dozens of GitHub repositories
- research papers
- certifications
- academic projects

Yet their resume only lists a small portion of this work.

The core question becomes:

> How can we automatically transform a person's real work into an ATS-optimized resume tailored to a specific job description?

## Solution

This project builds an AI system that automatically converts a candidate's real work into a structured knowledge base and generates an ATS-optimized resume tailored to a job description.

The system:
1. Collects evidence from sources such as:
   - GitHub repositories
   - research papers
   - certifications
   - portfolio documents
2. Converts this information into a vector knowledge base
3. Matches the knowledge base against a job description
4. Generates a custom resume supported by real evidence

This approach ensures that:
- resumes reflect actual work
- ATS keywords match the job description
- candidates don't forget past projects
- hallucinated claims are minimized


## Key Idea: Evidence-Based Resume Generation

Traditional resume tools work like this:

```
Job Description → AI → Resume
```

This often leads to hallucinations or generic content.

Our approach uses Retrieval-Augmented Generation (RAG):

```
Candidate Evidence → Vector Database
                    ↓
           Job Description Query
                    ↓
        Retrieve Relevant Evidence
                    ↓
             AI Resume Generator
```

The AI only writes the resume based on retrieved evidence, making the result more trustworthy and personalized.

## System Architecture

The system consists of three major phases.

```
Data Sources
(GitHub, Papers, Certificates, PDFs)

        ↓

Phase 1: Document Ingestion
Extract text and metadata

        ↓

Phase 2: Vector Indexing
Chunk documents and create embeddings

        ↓

Phase 3: Job-Aware Resume Generation
Retrieve relevant evidence and generate resume

        ↓

Output:
• ATS optimized resume (LaTeX)
• Structured resume JSON
```


## Phase 1: Document Ingestion

The first phase collects information from multiple sources and converts them into structured documents.

Supported sources include:
- GitHub repositories
- research papers
- certifications
- portfolio documents
- PDFs

### GitHub Ingestion

The system uses the GitHub API to:
- fetch repositories
- scan repository file trees
- extract useful files such as:

```
.py
.md
.ipynb
.json
.yaml
```

Unnecessary files are ignored:

```
node_modules
build directories
images
binaries
```

Each file becomes a document record containing text and metadata.

### PDF Processing

PDF documents are processed using PyMuPDF (fitz) to extract:
- research papers
- certifications
- technical reports
- resume documents

Text is extracted and stored as structured records.

### Output

The result of Phase 1 is a dataset like:

```
phase1_documents.jsonl
```

Each entry contains:

```
doc_id
text
metadata
```

This forms the candidate knowledge base.


## Phase 2: Chunking and Embedding

Documents are split into smaller segments called chunks so that they can be searched efficiently.

### Chunking Strategy
- Chunk size: 200–300 words
- Overlap: 20%

Overlap ensures that context is preserved between chunks.

### Embedding Model

Each chunk is converted into a vector embedding using:

```
Sentence Transformers
all-MiniLM-L6-v2
```

Embedding dimension:

```
384
```

These embeddings capture the semantic meaning of the text.

### Vector Database

Embeddings are stored in ChromaDB, which allows efficient semantic search.

ChromaDB uses the HNSW (Hierarchical Navigable Small World) algorithm for fast approximate nearest neighbor search.


## Phase 3: Job-Aware Resume Generation

This phase uses Retrieval-Augmented Generation.

### Step 1: Job Description Parsing

The system analyzes the job description to extract:
- role title
- required skills
- technologies
- responsibilities
- ATS keywords

### Step 2: Evidence Retrieval

The job description is converted into an embedding vector.

The vector database retrieves the Top-K most relevant chunks.

```
Top K = 5
Similarity metric = Cosine similarity
```

These retrieved chunks represent the candidate's most relevant experience.

### Step 3: Resume Generation

The AI model receives:
- job description
- retrieved evidence
- structured resume template

It generates:
- ATS-optimized resume content
- supported by real evidence


## Resume Rendering

The final resume is generated as LaTeX.

Advantages of LaTeX:
- professional formatting
- ATS-friendly
- easy PDF generation
- consistent layout

Empty sections are automatically removed to avoid formatting errors.


## Additional Feature: LinkedIn Resume Parser

The system also includes a profile parser.

Users can upload a resume or LinkedIn export, and the system extracts structured information.

Example output:

```json
{
  "user": {...},
  "workExperience": [...],
  "education": [...]
}
```

This structured data can power:
- portfolio websites
- structured candidate profiles
- resume builders


## API System

The backend exposes two main endpoints using FastAPI.

### Profile Parser

```
POST /api/profile-parser
```

Input:
- LinkedIn or resume PDF

Output:
- structured JSON profile

### Resume Generator

```
POST /api/resume-generator
```

Input:
- job description
- GitHub username (optional)
- repository list (optional)
- uploaded documents

Output:
- LaTeX resume
- structured JSON resume


## Key Features

**Evidence-based resume generation**
Resumes are generated from real work evidence rather than hallucinated content.

**ATS optimization**
The system aligns resumes with job descriptions to improve ATS compatibility.

**Multi-source knowledge ingestion**
Supports GitHub, research papers, certifications, and documents.

**Semantic retrieval**
Uses embeddings and vector search to match relevant experience.

**Automated resume generation**
Produces professional resumes automatically.

**Portfolio data extraction**
Converts resumes into structured JSON for portfolio websites.
