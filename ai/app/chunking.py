"""
Phase 2: Text Chunking Module
Splits documents into meaningful chunks with overlap
"""

import logging
import re
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class TextChunker:
    """Split documents into overlapping chunks"""
    
    def __init__(self, chunk_size: int = 300, overlap: int = 50):
        """
        Initialize text chunker
        
        Args:
            chunk_size: Target words per chunk
            overlap: Words to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.overlap = overlap
        
        logger.info(f"TextChunker initialized: {chunk_size} words, {overlap} overlap")
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Chunk a single text into overlapping pieces
        
        Args:
            text: Text to chunk
        
        Returns:
            List of text chunks
        """
        # Clean and split into words
        text = self._clean_text(text)
        words = text.split()
        
        if len(words) <= self.chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_words = words[start:end]
            chunks.append(' '.join(chunk_words))
            
            # Move start position, accounting for overlap
            start = end - self.overlap
            
            # Avoid infinite loop if overlap >= chunk_size
            if start <= 0:
                break
        
        return chunks
    
    def chunk_document(self, content: str, metadata: Optional[Dict] = None) -> List[Dict]:
        """
        Chunk a document and return with metadata
        
        Args:
            content: Document content
            metadata: Document metadata (source, type, etc.)
        
        Returns:
            List of chunks with metadata
        """
        if metadata is None:
            metadata = {}
        
        text_chunks = self.chunk_text(content)
        
        chunks = []
        for chunk_idx, chunk_text in enumerate(text_chunks):
            word_count = len(chunk_text.split())
            
            chunk_dict = {
                'text': chunk_text,
                'word_count': word_count,
                'chunk_index': chunk_idx,
                'total_chunks': len(text_chunks),
                'source': metadata.get('source', 'unknown'),
                'source_type': metadata.get('type', 'unknown'),
                **metadata  # Include all metadata
            }
            
            chunks.append(chunk_dict)
        
        logger.debug(f"Chunked {metadata.get('source', 'doc')} into {len(chunks)} pieces")
        
        return chunks
    
    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Clean text for processing
        
        Args:
            text: Raw text
        
        Returns:
            Cleaned text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\!\?\,\-\:]', '', text)
        
        return text.strip()