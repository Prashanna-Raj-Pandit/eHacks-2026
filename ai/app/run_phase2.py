"""
Main script to run Phase 2
From: ai/app/run_phase2.py
Loads Phase 1 JSONL output and processes it
"""

import sys
import os
import logging

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from phase2_processor import Phase2Processor

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def run_phase2(jsonl_path: str = './data/processed/phase1_documents.jsonl'):
    """
    Run complete Phase 2 workflow from Phase 1 JSONL output
    
    Args:
        jsonl_path: Path to Phase 1 JSONL file
    """
    
    print("\n" + "="*80)
    print(" "*20 + "PHASE 2: CHUNKING & EMBEDDING")
    print("="*80)
    
    # Check if file exists
    if not os.path.exists(jsonl_path):
        print(f"\n❌ ERROR: JSONL file not found: {jsonl_path}")
        print("\nMake sure you've run Phase 1 first:")
        print("  python run_ingest.py")
        return None
    
    # ========== PHASE 2: Process ==========
    print(f"\n[PHASE 2] Processing documents from {jsonl_path}...")
    
    os.makedirs('./data/processed', exist_ok=True)
    
    processor = Phase2Processor(
        chunk_size=300,
        overlap=50,
        embedding_dim=300,
        output_dir='./data/processed'
    )
    
    try:
        result = processor.process_jsonl(jsonl_path)
    except Exception as e:
        logger.error(f"Error processing JSONL: {e}")
        import traceback
        traceback.print_exc()
        return None
    
    # ========== RESULTS ==========
    print("\n" + "="*80)
    print("RESULTS")
    print("="*80)
    
    summary = result['summary']
    
    print(f"\nDocuments:")
    print(f"  Input: {summary['input_documents']}")
    print(f"  Output chunks: {summary['output_chunks']}")
    
    print(f"\nStatistics:")
    print(f"  Total words: {summary['total_words']:,}")
    print(f"  Avg chunk: {summary['avg_chunk_words']} words")
    print(f"  Range: {summary['min_chunk_words']}-{summary['max_chunk_words']} words")
    
    print(f"\nEmbeddings:")
    print(f"  Shape: {summary['embeddings_shape']}")
    print(f"  Dimension: {summary['embedding_dimension']}")
    
    print(f"\nChunks by type:")
    for src_type, count in summary['chunks_by_type'].items():
        print(f"  {src_type}: {count}")
    
    # ========== SAVE ==========
    print("\n[SAVING] Outputs to ./data/processed/")
    processor.save()
    
    print("\nFiles created:")
    print("  ✓ chunks.json")
    print("  ✓ embeddings.npy")
    print("  ✓ phase2_metadata.json")
    
    # Show sample chunks
    print("\n" + "="*80)
    print("SAMPLE CHUNKS")
    print("="*80)
    
    chunks = result['chunks']
    for i, chunk in enumerate(chunks[:3]):
        print(f"\n[Chunk {i+1}]")
        print(f"  Source: {chunk['source']}")
        print(f"  Type: {chunk['source_type']}")
        print(f"  Words: {chunk['word_count']}")
        print(f"  Index: {chunk['chunk_index']}/{chunk['total_chunks']-1}")
        print(f"  Text: {chunk['text'][:150]}...")
    
    print("\n" + "="*80)
    print("✓ PHASE 2 COMPLETE")
    print("="*80)
    
    print("\nNext step: Run Phase 3 to store in ChromaDB")
    print("  python run_phase3.py")
    
    return processor


if __name__ == "__main__":
    # Try different path options
    possible_paths = [
        './data/processed/phase1_documents.jsonl',
        '../data/processed/phase1_documents.jsonl',
        '../../data/processed/phase1_documents.jsonl',
    ]
    
    jsonl_path = None
    for path in possible_paths:
        if os.path.exists(path):
            jsonl_path = path
            print(f"Found JSONL at: {path}")
            break
    
    if not jsonl_path:
        print("Could not find phase1_documents.jsonl")
        print("Searched paths:")
        for path in possible_paths:
            print(f"  - {path}")
        print("\nPlease run Phase 1 first or provide the correct path")
        sys.exit(1)
    
    processor = run_phase2(jsonl_path)