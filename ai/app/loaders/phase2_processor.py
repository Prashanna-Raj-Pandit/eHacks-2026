"""
Phase 2 Orchestrator: Chunking + Embedding
Fits into: ai/loaders/phase2_processor.py

Orchestrates:
1. Chunking (from chunking.py)
2. Embedding (from embeddings.py)
3. Saving to ai/app/data/
"""

import logging
import json
import os
import numpy as np
from typing import List, Dict, Optional
from .chunking import TextChunker
from .embeddings import LSAEmbedding

logger = logging.getLogger(__name__)


class Phase2Processor:
    """Process Phase 1 output through chunking and embedding"""
    
    def __init__(self, 
                 chunk_size: int = 300,
                 overlap: int = 50,
                 embedding_dim: int = 300,
                 output_dir: str = './ai/app/data'):
        """
        Initialize Phase 2 processor
        
        Args:
            chunk_size: Words per chunk
            overlap: Word overlap
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
    
    def process(self, documents: List[Dict]) -> Dict:
        """
        Process Phase 1 documents
        
        Args:
            documents: From Phase 1 ingest.py with:
                {
                    'content': str,
                    'source': str,
                    'type': str,
                    'file_path': str,
                    ...
                }
        
        Returns:
            {
                'chunks': List[Dict],
                'embeddings': np.ndarray,
                'summary': Dict
            }
        """
        logger.info(f"Processing {len(documents)} documents...")
        
        # Step 1: Chunk
        logger.info("Step 1: Chunking...")
        chunk_count_by_type = {}
        
        for doc_idx, doc in enumerate(documents):
            content = doc.get('content', '')
            if not content:
                logger.warning(f"Doc {doc_idx}: empty content")
                continue
            
            doc_type = doc.get('type', 'unknown')
            chunk_count_by_type[doc_type] = chunk_count_by_type.get(doc_type, 0)
            
            # Extract metadata
            metadata = {
                'doc_index': doc_idx,
                'source': doc.get('source', ''),
                'type': doc_type,
                'file_path': doc.get('file_path', ''),
                'repo': doc.get('repo', ''),
                'raw_url': doc.get('raw_url', ''),
                'num_pages': doc.get('num_pages'),
                'encoding': doc.get('encoding', 'utf-8')
            }
            
            # Chunk
            doc_chunks = self.chunker.chunk_document(content, metadata)
            self.chunks.extend(doc_chunks)
            chunk_count_by_type[doc_type] += len(doc_chunks)
            
            if (doc_idx + 1) % 10 == 0:
                logger.info(f"  {doc_idx + 1}/{len(documents)}")
        
        logger.info(f"✓ Created {len(self.chunks)} chunks")
        logger.info(f"  By type: {chunk_count_by_type}")
        
        # Step 2: Embed
        logger.info("Step 2: Generating embeddings...")
        
        chunk_texts = [chunk['text'] for chunk in self.chunks]
        
        self.embedding_gen = LSAEmbedding(
            n_components=self.embedding_dim,
            n_iter=60,
            random_state=42
        )
        
        self.embeddings = self.embedding_gen.fit_transform(chunk_texts)
        logger.info(f"✓ Embeddings: {self.embeddings.shape}")
        
        # Step 3: Summary
        logger.info("Step 3: Generating summary...")
        self.summary = self._generate_summary(documents, chunk_count_by_type)
        
        return {
            'chunks': self.chunks,
            'embeddings': self.embeddings,
            'summary': self.summary,
            'embedding_generator': self.embedding_gen
        }
    
    def _generate_summary(self, documents: List[Dict], chunk_counts: Dict) -> Dict:
        """Generate statistics"""
        
        total_words = sum(c['word_count'] for c in self.chunks)
        avg_words = total_words / len(self.chunks) if self.chunks else 0
        
        return {
            'input_documents': len(documents),
            'output_chunks': len(self.chunks),
            'total_words': total_words,
            'avg_chunk_words': round(avg_words, 2),
            'embeddings_shape': self.embeddings.shape,
            'chunks_by_type': chunk_counts,
            'chunk_size_config': self.chunker.chunk_size,
            'overlap_config': self.chunker.overlap
        }
    
    def save(self) -> None:
        """Save to ai/app/data/"""
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Save embeddings
        emb_path = os.path.join(self.output_dir, 'embeddings.npy')
        np.save(emb_path, self.embeddings)
        logger.info(f"✓ Saved embeddings: {emb_path}")
        
        # Save chunks
        chunks_path = os.path.join(self.output_dir, 'chunks.json')
        with open(chunks_path, 'w') as f:
            json.dump(self.chunks, f, indent=2)
        logger.info(f"✓ Saved chunks: {chunks_path}")
        
        # Save summary
        summary_path = os.path.join(self.output_dir, 'metadata.json')
        with open(summary_path, 'w') as f:
            json.dump(self.summary, f, indent=2)
        logger.info(f"✓ Saved metadata: {summary_path}")
    
    def load(self) -> None:
        """Load from ai/app/data/"""
        
        # Load embeddings
        emb_path = os.path.join(self.output_dir, 'embeddings.npy')
        self.embeddings = np.load(emb_path)
        logger.info(f"✓ Loaded embeddings: {self.embeddings.shape}")
        
        # Load chunks
        chunks_path = os.path.join(self.output_dir, 'chunks.json')
        with open(chunks_path, 'r') as f:
            self.chunks = json.load(f)
        logger.info(f"✓ Loaded {len(self.chunks)} chunks")
        
        # Load metadata
        summary_path = os.path.join(self.output_dir, 'metadata.json')
        with open(summary_path, 'r') as f:
            self.summary = json.load(f)
        logger.info(f"✓ Loaded metadata")