"""
Test Phase 2 with JSONL input
"""

import sys
import os
import json
import logging
import tempfile
import numpy as np

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import locally
from chunking import TextChunker
from embeddings import LSAEmbedding
from phase2_processor import Phase2Processor

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def generate_fake_jsonl():
    """Generate fake Phase 1 JSONL for testing"""
    
    documents = [
        {
            'content': '''# Skill Surface MVP
A tool that helps professionals surface their hidden skills quickly.

## Problem
People have proof of their skills scattered across GitHub, PDFs, and projects.
When applying for jobs, they can't quickly connect their skills to job requirements.

## Solution
Our solution has multiple phases:
1. Ingestion: Extract from GitHub repos and PDFs
2. Chunking: Split into meaningful pieces
3. Storage: Store chunks in vector database
4. Retrieval: Find relevant chunks by similarity
5. Generation: Create resume bullets with sources
6. Display: Show results in web interface

## Technologies
- Python, FastAPI, React
- GitHub API, PyPDF2
- scikit-learn for embeddings
- ChromaDB for vector storage
''',
            'source': 'README.md',
            'type': 'github',
            'file_path': 'skill-surface-mvp/README.md',
            'repo': 'skill-surface-mvp',
            'raw_url': 'https://raw.githubusercontent.com/ashasiue/skill-surface-mvp/main/README.md'
        },
        {
            'content': '''JOHN DOE
San Francisco, CA | john.doe@email.com

PROFESSIONAL SUMMARY
Full-stack software engineer with 5+ years of experience.
Expert in Python, JavaScript, and cloud technologies.

EXPERIENCE
Senior Software Engineer | TechCorp (2021 - Present)
- Led design of microservices architecture using FastAPI
- Implemented CI/CD pipeline using GitHub Actions
- Managed PostgreSQL database optimization
- Architected caching layer using Redis

Software Engineer | StartupXYZ (2019 - 2021)
- Built REST APIs using FastAPI and Django
- Implemented real-time features using WebSockets
- Deployed on AWS EC2 and RDS
- Designed React dashboard with visualizations
- Implemented OAuth2 authentication

SKILLS
Languages: Python, JavaScript, Java, SQL
Frameworks: FastAPI, Django, React, Node.js
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS (EC2, S3, RDS), Docker, Kubernetes
''',
            'source': 'resume_john_doe.pdf',
            'type': 'pdf',
            'file_path': 'resume_john_doe.pdf',
            'num_pages': 2,
            'encoding': 'utf-8'
        },
        {
            'content': '''PROJECT: E-Commerce Platform
Timeline: 12 months (2020-2021)
Team Size: 4 engineers

Description:
Built a full-stack e-commerce application serving 10,000 concurrent users.

Key Achievements:
- Optimized database queries reducing response time from 2s to 200ms
- Implemented OAuth2 authentication with JWT tokens
- Set up CI/CD pipeline reducing deployment from 2 hours to 15 minutes
- Deployed on Docker and Kubernetes
- Achieved 99.9% uptime

Technologies:
Backend: Python, FastAPI, PostgreSQL, Redis
Frontend: React, TypeScript, Redux
DevOps: Docker, Kubernetes, GitHub Actions, AWS

Metrics:
- 1M+ transactions processed
- 100K+ active users
- 99.9% uptime SLA
- Response time < 200ms (P95)
''',
            'source': 'projects.txt',
            'type': 'text',
            'file_path': 'projects.txt'
        }
    ]
    
    return documents


def create_test_jsonl():
    """Create temporary test JSONL file"""
    
    documents = generate_fake_jsonl()
    
    # Create temp file
    fd, path = tempfile.mkstemp(suffix='.jsonl')
    
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        for doc in documents:
            f.write(json.dumps(doc) + '\n')
    
    logger.info(f"Created test JSONL: {path}")
    return path


def test_chunking():
    """Test chunking functionality"""
    
    print("\n" + "="*70)
    print("TEST 1: CHUNKING")
    print("="*70)
    
    chunker = TextChunker(chunk_size=300, overlap=50)
    
    text = '''FastAPI is a modern, fast web framework for building APIs with Python.
    It is based on standard Python type hints. The key features are:
    Very fast: Very high performance, on par with NodeJS and Go.
    Fast to code: Increase the speed to develop features by about 200%.
    Fewer bugs: Reduce about 40% of human induced errors.
    Intuitive: Great editor support.
    Easy: Designed to be easy to use and learn.
    Short: Minimize code duplication.
    Robust: Get production-ready code.
    Standards-based: Based on open standards for APIs.
    '''
    
    chunks = chunker.chunk_text(text)
    
    print(f"\nChunked into {len(chunks)} pieces:")
    for i, chunk in enumerate(chunks):
        words = len(chunk.split())
        print(f"\n  Chunk {i+1} ({words} words):")
        print(f"    {chunk[:80]}...")


def test_embeddings():
    """Test embedding generation"""
    
    print("\n" + "="*70)
    print("TEST 2: EMBEDDINGS")
    print("="*70)
    
    documents = [
        "FastAPI is a modern web framework",
        "Django is a web framework for Python",
        "Flask is a lightweight web framework",
        "Node.js is a JavaScript runtime",
        "React is a JavaScript library"
    ]
    
    embedding_gen = LSAEmbedding(n_components=50)  # Small dim for testing
    embeddings = embedding_gen.fit_transform(documents)
    
    print(f"\nGenerated {embeddings.shape[0]} embeddings")
    print(f"Dimension: {embeddings.shape[1]}")
    print(f"\nFirst embedding (first 10 values):")
    print(f"  {embeddings[0][:10]}")


def test_jsonl_loading():
    """Test loading from JSONL"""
    
    print("\n" + "="*70)
    print("TEST 3: JSONL LOADING")
    print("="*70)
    
    # Create test JSONL
    jsonl_path = create_test_jsonl()
    
    processor = Phase2Processor()
    documents = processor.load_jsonl(jsonl_path)
    
    print(f"\nLoaded {len(documents)} documents from JSONL:")
    for doc in documents:
        print(f"  - {doc['source']} ({doc['type']}, {len(doc['content'])} chars)")
    
    # Cleanup
    os.remove(jsonl_path)
    print(f"\nCleaned up test file")


def test_full_phase2():
    """Test complete Phase 2 workflow"""
    
    print("\n" + "="*70)
    print("TEST 4: FULL PHASE 2 WORKFLOW (JSONL → CHUNKS → EMBEDDINGS)")
    print("="*70)
    
    # Create test JSONL
    print("\n[1/4] Creating test JSONL...")
    jsonl_path = create_test_jsonl()
    
    # Run Phase 2
    print("\n[2/4] Running Phase 2 processor...")
    os.makedirs('./data/processed', exist_ok=True)
    
    processor = Phase2Processor(
        chunk_size=300,
        overlap=50,
        embedding_dim=300,
        output_dir='./data/processed'
    )
    
    result = processor.process_jsonl(jsonl_path)
    
    chunks = result['chunks']
    embeddings = result['embeddings']
    summary = result['summary']
    
    print(f"✓ Created {len(chunks)} chunks")
    print(f"✓ Generated embeddings: {embeddings.shape}")
    
    # Save outputs
    print("\n[3/4] Saving Phase 2 outputs...")
    processor.save()
    
    print("\nPhase 2 Summary:")
    print(f"  Input documents: {summary['input_documents']}")
    print(f"  Output chunks: {summary['output_chunks']}")
    print(f"  Total words: {summary['total_words']}")
    print(f"  Avg chunk size: {summary['avg_chunk_words']} words")
    print(f"  Min chunk: {summary['min_chunk_words']} words")
    print(f"  Max chunk: {summary['max_chunk_words']} words")
    
    print(f"\n  Embeddings shape: {summary['embeddings_shape']}")
    print(f"  Chunks by type:")
    for src_type, count in summary['chunks_by_type'].items():
        print(f"    {src_type}: {count}")
    
    # Show sample chunks
    print("\n[4/4] Sample Chunks:")
    for i, chunk in enumerate(chunks[:2]):
        print(f"\n  [{i+1}] {chunk['source']} (chunk {chunk['chunk_index']}/{chunk['total_chunks']-1})")
        print(f"      Type: {chunk['source_type']}")
        print(f"      Words: {chunk['word_count']}")
        print(f"      Text: {chunk['text'][:100]}...")
    
    print("\n" + "="*70)
    print("✓ PHASE 2 TEST COMPLETE")
    print("="*70)
    
    print("\nOutput files:")
    print("  ./data/processed/chunks.json")
    print("  ./data/processed/embeddings.npy")
    print("  ./data/processed/phase2_metadata.json")
    
    # Cleanup
    os.remove(jsonl_path)
    
    return processor


if __name__ == "__main__":
    print("\n" + "="*70)
    print("PHASE 2 TESTS")
    print("="*70)
    
    test_chunking()
    test_embeddings()
    test_jsonl_loading()
    processor = test_full_phase2()