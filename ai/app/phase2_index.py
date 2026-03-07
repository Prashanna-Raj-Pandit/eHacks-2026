"""
Phase 2 Orchestrator: Chunking + Embedding
Loads Phase 1 output from JSONL, chunks it, generates embeddings
"""

import logging
import json
import os
import numpy as np
from typing import List, Dict, Optional

from chunking import TextChunker
from embeddings import LSAEmbedding

logger = logging.getLogger(__name__)


class Phase2Processor:
    """Orchestrate Phase 2: Chunking + Embedding"""
    
    def __init__(self, 
                 chunk_size: int = 300,
                 overlap: int = 50,
                 embedding_dim: int = 300,
                 output_dir: str = './data/processed'):
        """
        Initialize Phase 2 processor
        
        Args:
            chunk_size: Words per chunk
            overlap: Word overlap between chunks
            embedding_dim: Embedding dimension
            output_dir: Where to save outputs
        """
        self.chunker = TextChunker(chunk_size=chunk_size, overlap=overlap)
        self.embedding_gen = None
        self.embedding_dim = embedding_dim
        self.output_dir = output_dir
        
        self.chunks = []
        self.embeddings = None
        self.summary = {}
        
        logger.info("Phase2Processor initialized")
    
    def load_jsonl(self, jsonl_path: str) -> List[Dict]:
        """
        Load documents from JSONL file (Phase 1 output)
        
        Args:
            jsonl_path: Path to phase1_documents.jsonl
        
        Returns:
            List of documents
        """
        documents = []
        
        logger.info(f"Loading JSONL from {jsonl_path}...")
        
        if not os.path.exists(jsonl_path):
            raise FileNotFoundError(f"JSONL file not found: {jsonl_path}")
        
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    line = line.strip()
                    if not line:
                        continue
                    
                    doc = json.loads(line)
                    documents.append(doc)
                except json.JSONDecodeError as e:
                    logger.error(f"Line {line_num}: Invalid JSON - {e}")
                    continue
        
        logger.info(f"✓ Loaded {len(documents)} documents from JSONL")
        
        # Show sample
        if documents:
            logger.info(f"Sample document keys: {list(documents[0].keys())}")
        
        return documents
    
    def process(self, documents: List[Dict]) -> Dict:
        """
        Process Phase 1 documents through Phase 2
        
        Args:
            documents: From Phase 1 JSONL with structure:
                {
                    'content': str,
                    'source': str,
                    'type': str (github/pdf/text),
                    'file_path': str,
                    'repo': str,
                    'raw_url': str,
                    ...
                }
        
        Returns:
            {
                'chunks': List[Dict],
                'embeddings': np.ndarray,
                'summary': Dict,
                'embedding_generator': LSAEmbedding
            }
        """
        logger.info(f"Phase 2: Processing {len(documents)} documents...")
        
        # ========== STEP 1: Chunking ==========
        logger.info("Step 1: Chunking documents...")
        chunk_count_by_type = {}
        skipped = 0
        
        for doc_idx, doc in enumerate(documents):
            # Handle JSONL format
            content = doc.get('content', '')
            
            if not content:
                logger.warning(f"Doc {doc_idx}: empty content, skipping")
                skipped += 1
                continue
            
            # Ensure content is string
            if not isinstance(content, str):
                logger.warning(f"Doc {doc_idx}: content is not string, converting")
                content = str(content)
            
            doc_type = doc.get('type', 'unknown')
            if doc_type not in chunk_count_by_type:
                chunk_count_by_type[doc_type] = 0
            
            # Extract metadata - preserve all JSONL fields
            metadata = {
                'doc_index': doc_idx,
                'source': doc.get('source', ''),
                'type': doc_type,
                'file_path': doc.get('file_path', ''),
                'repo': doc.get('repo', ''),
                'raw_url': doc.get('raw_url', ''),
                'num_pages': doc.get('num_pages'),
                'encoding': doc.get('encoding', 'utf-8'),
                # Preserve any other JSONL fields
                **{k: v for k, v in doc.items() 
                   if k not in ['content']}
            }
            
            # Chunk document
            doc_chunks = self.chunker.chunk_document(content, metadata)
            self.chunks.extend(doc_chunks)
            chunk_count_by_type[doc_type] += len(doc_chunks)
            
            if (doc_idx + 1) % 5 == 0:
                logger.info(f"  Processed {doc_idx + 1}/{len(documents)}")
        
        logger.info(f"✓ Created {len(self.chunks)} chunks from {len(documents) - skipped} documents")
        if skipped:
            logger.warning(f"  ({skipped} documents skipped - empty content)")
        logger.info(f"  Breakdown: {chunk_count_by_type}")
        
        # ========== STEP 2: Embedding ==========
        logger.info("Step 2: Generating embeddings...")
        
        chunk_texts = [chunk['text'] for chunk in self.chunks]
        
        self.embedding_gen = LSAEmbedding(
            n_components=self.embedding_dim,
            n_iter=60,
            random_state=42
        )
        
        self.embeddings = self.embedding_gen.fit_transform(chunk_texts)
        logger.info(f"✓ Generated embeddings: {self.embeddings.shape}")
        
        # ========== STEP 3: Summary ==========
        self.summary = self._generate_summary(documents, chunk_count_by_type)
        
        return {
            'chunks': self.chunks,
            'embeddings': self.embeddings,
            'summary': self.summary,
            'embedding_generator': self.embedding_gen
        }
    
    def process_jsonl(self, jsonl_path: str) -> Dict:
        """
        Load JSONL and process in one step
        
        Args:
            jsonl_path: Path to phase1_documents.jsonl
        
        Returns:
            Processing result dict
        """
        documents = self.load_jsonl(jsonl_path)
        return self.process(documents)
    
    def _generate_summary(self, documents: List[Dict], chunk_counts: Dict) -> Dict:
        """Generate processing statistics"""
        
        total_words = sum(c['word_count'] for c in self.chunks) if self.chunks else 0
        avg_words = total_words / len(self.chunks) if self.chunks else 0
        
        return {
            'timestamp': str(np.datetime64('now')),
            'input_documents': len(documents),
            'output_chunks': len(self.chunks),
            'total_words': total_words,
            'avg_chunk_words': round(avg_words, 2),
            'min_chunk_words': min((c['word_count'] for c in self.chunks), default=0),
            'max_chunk_words': max((c['word_count'] for c in self.chunks), default=0),
            'embeddings_shape': list(self.embeddings.shape),
            'chunks_by_type': chunk_counts,
            'chunk_size_config': self.chunker.chunk_size,
            'overlap_config': self.chunker.overlap,
            'embedding_dimension': self.embedding_dim
        }
    
    def save(self) -> None:
        """Save Phase 2 outputs to disk"""
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Save embeddings as numpy file
        emb_path = os.path.join(self.output_dir, 'embeddings.npy')
        np.save(emb_path, self.embeddings)
        logger.info(f"✓ Saved embeddings: {emb_path}")
        
        # Save chunks as JSON
        chunks_path = os.path.join(self.output_dir, 'chunks.json')
        with open(chunks_path, 'w', encoding='utf-8') as f:
            json.dump(self.chunks, f, indent=2, ensure_ascii=False)
        logger.info(f"✓ Saved chunks: {chunks_path}")
        
        # Save summary/metadata
        summary_path = os.path.join(self.output_dir, 'phase2_metadata.json')
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(self.summary, f, indent=2, ensure_ascii=False)
        logger.info(f"✓ Saved metadata: {summary_path}")
    
    def load(self) -> None:
        """Load Phase 2 outputs from disk"""
        
        # Load embeddings
        emb_path = os.path.join(self.output_dir, 'embeddings.npy')
        self.embeddings = np.load(emb_path)
        logger.info(f"✓ Loaded embeddings: {self.embeddings.shape}")
        
        # Load chunks
        chunks_path = os.path.join(self.output_dir, 'chunks.json')
        with open(chunks_path, 'r', encoding='utf-8') as f:
            self.chunks = json.load(f)
        logger.info(f"✓ Loaded {len(self.chunks)} chunks")
        
        # Load metadata
        summary_path = os.path.join(self.output_dir, 'phase2_metadata.json')
        with open(summary_path, 'r', encoding='utf-8') as f:
            self.summary = json.load(f)
        logger.info(f"✓ Loaded metadata")