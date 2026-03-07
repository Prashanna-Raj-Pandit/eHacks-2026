"""
Phase 2: Chunk content into meaningful pieces
Fits into: ai/loaders/chunking.py

Input: Phase 1 documents (from ingest.py)
Output: List of chunks with metadata
"""

import logging
from typing import List, Dict
from nltk.tokenize import sent_tokenize
import nltk

logger = logging.getLogger(__name__)

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')


class TextChunker:
    """Chunk documents into meaningful pieces"""
    
    def __init__(self, chunk_size: int = 300, overlap: int = 50):
        """
        Initialize chunker
        
        Args:
            chunk_size: Target words per chunk
            overlap: Words to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.overlap = overlap
        logger.info(f"TextChunker: size={chunk_size}, overlap={overlap}")
    
    @staticmethod
    def _split_sentences(text: str) -> List[str]:
        """Split text into sentences"""
        try:
            return [s.strip() for s in sent_tokenize(text) if s.strip()]
        except:
            # Fallback
            return [s.strip() + '.' for s in text.split('.') if s.strip()]
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Chunk text while preserving sentence boundaries
        
        Args:
            text: Input text
        
        Returns:
            List of chunks
        """
        sentences = self._split_sentences(text)
        
        if not sentences:
            logger.warning("No sentences found")
            return []
        
        chunks = []
        current_chunk = []
        word_count = 0
        overlap_buffer = []
        
        for sentence in sentences:
            sent_words = len(sentence.split())
            
            if word_count + sent_words <= self.chunk_size:
                current_chunk.append(sentence)
                word_count += sent_words
            else:
                if current_chunk:
                    chunk_text = ' '.join(current_chunk)
                    chunks.append(chunk_text)
                    
                    # Prepare overlap
                    if self.overlap > 0:
                        overlap_buffer = self._get_overlap_sentences(
                            current_chunk, 
                            self.overlap
                        )
                
                current_chunk = overlap_buffer + [sentence]
                word_count = len(' '.join(current_chunk).split())
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    @staticmethod
    def _get_overlap_sentences(sentences: List[str], target_words: int) -> List[str]:
        """Get last N sentences for overlap"""
        overlap = []
        word_count = 0
        
        for sentence in reversed(sentences):
            word_count += len(sentence.split())
            overlap.insert(0, sentence)
            if word_count >= target_words:
                break
        
        return overlap
    
    def chunk_document(self, text: str, metadata: Dict) -> List[Dict]:
        """
        Chunk a document with metadata
        
        Args:
            text: Document content
            metadata: Dict with source, type, etc.
        
        Returns:
            List of chunk dicts
        """
        chunks = self.chunk_text(text)
        
        chunk_list = []
        for idx, chunk_text in enumerate(chunks):
            chunk_list.append({
                'text': chunk_text,
                'chunk_index': idx,
                'total_chunks': len(chunks),
                'word_count': len(chunk_text.split()),
                'char_count': len(chunk_text),
                'source': metadata.get('source', 'unknown'),
                'source_type': metadata.get('type', 'unknown'),
                'file_path': metadata.get('file_path', ''),
                'repo': metadata.get('repo', ''),
                'raw_url': metadata.get('raw_url', ''),
                'metadata': {
                    k: v for k, v in metadata.items() 
                    if k not in ['content']
                }
            })
        
        return chunk_list