# Skill Surface MVP

## Problem Statement

**Real Problem:** People have proof of their skills scattered across:
- GitHub repositories
- Project documentation  
- PDF resumes and portfolios
- Work samples

**The Pain:** When applying for jobs, they cannot quickly surface and connect their existing proof of skills to a job description. They end up writing generic bullet points instead of evidence-backed accomplishments.

**The Opportunity:** Build a tool that extracts, chunks, embeds, and retrieves skill evidence in seconds.

---

## The Solution

A 6-phase MVP that:
1. Ingests GitHub repos and PDFs
2. Chunks and embeds content
3. Stores in vector database (ChromaDB)
4. Retrieves relevant skill evidence
5. Generates resume bullets from retrieved chunks
6. Demonstrates with real job description → bullets + evidence

---

## Build Plan & Phases

### Phase 1: Build Ingestion

**GitHub repo text files**
- Clone or fetch public repos
- Extract all `.md`, `.txt`, `.py`, `.js` files
- Parse and clean text

**PDF text extraction**
- Use PyPDF or similar
- Extract text from PDFs
- Preserve structure (headings, bullet points)

### Phase 2: Chunk and Embed

- Split content into meaningful chunks (300-500 tokens)
- Generate embeddings using OpenAI API or local model
- Preserve metadata (source file, line numbers, file type)

### Phase 3: Store in ChromaDB

- Initialize persistent ChromaDB
- Store vectors with metadata
- Enable fast retrieval

### Phase 4: Create Query Function

- **Ask skill question** – "What is your experience with Python async?"
- **Retrieve top chunks** – Get top 5-10 most relevant chunks
- **Return evidence** – Show exact lines with source files

### Phase 5: Resume Bullet Generation

- Take retrieved chunks
- Generate 2-3 strong resume bullets
- Format as accomplishment statements
- **Critical:** Use only retrieved chunks (no hallucination)

### Phase 6: Prepare One Strong Demo Case

**Demo Flow:**
1. Paste a real job description
2. Extract required skills
3. Query for each skill
4. Generate bullets with evidence
5. Show the exact source lines

---

## Biggest Success Factors

**Judges will care LESS about:**
- Complexity of architecture
- Number of features
- Fancy UI

**Judges WILL care about:**
✅ **Clear Problem** – People cannot surface skills fast  
✅ **Practical Solution** – Takes skill proof → generates bullets  
✅ **Working Demo** – End-to-end, real job description input  
✅ **Ethical Angle** – No hallucination, evidence-based only  
✅ **Visible Usefulness** – Someone would actually use this  

---

## Why This Idea is Strong

**The Core Insight:**
People already have proof of skill. The problem isn't *what* they've done—it's that they cannot *surface it fast*.

**The Story:**
"I built a tool that takes your GitHub repos and PDFs, finds proof of your skills, and generates resume bullets with evidence in seconds. No more generic bullet points. Just facts from your own work."

**This solves a real pain point** that hiring managers, recruiters, and job applicants all face.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | Python 3.9+ |
| Ingestion | `PyGithub`, `PyPDF2` |
| Chunking | `langchain` or custom |
| Embeddings | OpenAI API (or local: `sentence-transformers`) |
| Vector DB | ChromaDB (persistent) |
| Backend | FastAPI |
| Demo | CLI + Jupyter notebook |

---

## Project Structure

```
skill-surface-mvp/
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── config.py                 # Configuration (API keys, paths)
├── ingestion.py              # Phase 1: GitHub + PDF extraction
├── chunking.py               # Phase 2: Chunking & embedding
├── storage.py                # Phase 3: ChromaDB storage
├── query_engine.py           # Phase 4: Query & retrieval
├── bullet_generator.py        # Phase 5: Resume generation
├── demo.py                   # Phase 6: Full demo
├── chroma_data/              # Vector DB storage (persistent)
├── sample_data/              # Sample GitHub repos, PDFs, JD
└── notebooks/                # Jupyter demos
    └── demo.ipynb
```

---

## Getting Started

### Installation

```bash
# Clone the repo
git clone https://github.com/ashasiue/skill-surface-mvp.git
cd skill-surface-mvp

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key
```

### Run the Demo

```bash
# Phase 1-3: Ingest, chunk, and store
python demo.py --ingest --repo "https://github.com/example/repo"

# Phase 4-5: Query and generate bullets
python demo.py --job-description "job_description.txt"
```

---

## Demo Flow (What Judges Will See)

### Input
```
Job Description: Senior Python Engineer

Required Skills:
- Async Python
- FastAPI
- Docker
- Database design
```

### Processing
```
1. Extract skills from JD
2. For each skill, query ChromaDB
3. Retrieve top evidence chunks
4. Generate resume bullets
```

### Output
```
SKILL: Async Python
Evidence: "Implemented async event handlers in production service"
Source: my-repo/services/events.py (lines 45-67)

BULLET GENERATED:
• Designed and deployed async Python services handling 10K+ concurrent requests, 
  reducing latency by 40% through event-driven architecture

---

SKILL: FastAPI
Evidence: "Built REST API with FastAPI, includes authentication and rate limiting"
Source: my-repo/api/main.py (lines 1-200)

BULLET GENERATED:
• Developed FastAPI backend with JWT authentication and rate limiting, 
  serving 50K daily requests with 99.9% uptime

```

---

## Key Constraints (Critical for MVP)

1. **Evidence-based only** – Never generate bullets without retrieved chunks
2. **Source attribution** – Always show where the evidence came from
3. **No hallucination** – If skill not found, say "No evidence found"
4. **Real demo** – Use actual GitHub repos and job descriptions
5. **Working end-to-end** – From repo URL to final bullets in <30 seconds

---

## Success Metrics

✅ Tool ingests 1+ GitHub repos  
✅ Tool chunks and embeds content  
✅ Tool stores and retrieves vectors  
✅ Tool generates bullets with evidence  
✅ Demo runs end-to-end in <1 minute  
✅ Evidence is traceable to source files  

---

## Ethical Considerations

**No Hallucination:**
- Every bullet point is generated ONLY from retrieved chunks
- If no relevant evidence found, explicitly say so
- Never fabricate skills or accomplishments

**Transparency:**
- Show exact source files and line numbers
- Let users verify the evidence themselves
- Make it clear where the information came from

**User Control:**
- Users choose what repos/PDFs to ingest
- Users can review generated bullets before using them
- No unauthorized data scraping

---

## The Pitch (30 seconds)

> "Job applications require proof of skills, but most people can't surface it fast. They end up writing generic bullet points. 
>
> I built a tool that takes your GitHub repos and PDFs, finds concrete proof of your skills, and generates resume bullets with evidence in seconds. 
>
> No hallucination. Just facts from your own work. 
>
> Watch: I paste a job description → the tool finds matching skills in my repos → generates bullets with exact source lines → ready to apply."

---

## Next Steps

1. **Phase 1-2:** Get ingestion and chunking working
2. **Phase 3:** Verify storage in ChromaDB
3. **Phase 4:** Build query function with retrieval
4. **Phase 5:** Implement bullet generation
5. **Phase 6:** Create polished demo
6. **Final:** Record 2-minute demo video

---

## Questions?

This MVP focuses on **clarity, practicality, and working demo** over complexity.

The goal: Show judges a real problem, a working solution, and a user who would immediately benefit.

---

**Status:** MVP Ready 🚀