# eHacks

# Skill Surface MVP - Extract, Embed, and Generate Resume Bullets

## Problem Statement
People already have proof of their skills embedded in their work—GitHub repos, PDFs, portfolios—but they cannot surface it fast when they need it most. During job applications, interviews, and career transitions, talented professionals struggle to quickly articulate their capabilities with evidence.

**Solution**: Automatically extract, chunk, embed, and retrieve proof of skills from multiple sources, then generate resume bullets with cited evidence.

---

## Build Plan

### Phase 1: Build Ingestion
- **GitHub repo text files** – Clone and extract all text content
- **PDF text extraction** – Parse PDFs and extract searchable text

### Phase 2: Chunk and Embed
- Split content into semantic chunks
- Generate embeddings using OpenAI API
- Preserve source metadata (file, repo, line numbers)

### Phase 3: Store in ChromaDB
- Persist embeddings and metadata in ChromaDB
- Maintain searchability and retrieval efficiency

### Phase 4: Create Query Function
- **Ask skill question** – Natural language input
- **Retrieve top chunks** – Semantic search via embeddings
- **Return evidence** – Include source references and line numbers

### Phase 5: Resume Bullet Generation
- Generate professional resume bullets from retrieved chunks only
- Ensure all bullets are backed by evidence from ingested sources
- Include citations to source files

### Phase 6: Prepare Strong Demo Case
- Paste a job description
- Generate targeted resume bullets
- Show evidence lines with source references

---

## Biggest Success Factors

The judges will care less about "complexity" and more about:

✅ **Clear problem** – Visible pain point  
✅ **Practical solution** – Works for real use cases  
✅ **Working demo** – End-to-end functional prototype  
✅ **Ethical angle** – Transparent sourcing, no hallucination  
✅ **Visible usefulness** – Immediate value to users  

---

## Why This Idea is Strong

**Core Value Proposition**: People already have proof of their skills, but cannot surface it fast.

This solves a real, urgent pain point:
- Job applications require quick skill articulation
- Interviews demand evidence-backed responses
- Career transitions need skill showcasing
- Current tools require manual bullet creation

The MVP demonstrates:
- Automated skill extraction from real work
- Semantic understanding of capabilities
- Evidence-backed claims (no hallucination)
- Rapid bullet generation with citations

---

## Demo Flow

### Input
1. User provides GitHub repositories or PDF documents
2. System ingests and indexes all content
3. User asks: *"What are my AWS and DevOps skills?"*

### Processing
1. Query embeddings are generated
2. ChromaDB retrieves top matching chunks
3. LLM generates resume bullets from chunks only

### Output
- **Generated Bullets**: 
  - "Architected and deployed scalable AWS infrastructure serving 100K+ users (EC2, RDS, Lambda)"
  - "Implemented CI/CD pipelines reducing deployment time by 40%"
- **Evidence Citations**:
  - `repo: project-x | file: infra/main.tf | lines: 45-67`
  - `repo: devops-tools | file: .github/workflows/deploy.yml | lines: 12-34`

---

## Tech Stack

- **Language**: Python 3.10+
- **Embedding Model**: OpenAI embeddings API
- **Vector DB**: ChromaDB (persistent)
- **LLM**: OpenAI GPT-4 or GPT-3.5-turbo
- **Framework**: FastAPI (optional for production)
- **Ingestion**: PyPDF2, GitPython
- **Environment**: Python venv, .env configuration

---

## Project Structure
