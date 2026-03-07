"""
Phase 3: Store embeddings in ChromaDB
Input: Chunks + Embeddings from Phase 2
Output: ChromaDB instance with indexed embeddings for similarity search
"""

import logging
import json
import os
import chromadb
from typing import List, Dict, Optional, Tuple
import numpy as np

logger = logging.getLogger(__name__)


class ChromaDBStorage:
    """Store and retrieve embeddings using ChromaDB"""
    
    def __init__(self, db_path: str = './data/chroma_db', collection_name: str = 'skill_chunks'):
        """
        Initialize ChromaDB storage
        
        Args:
            db_path: Path to store ChromaDB files
            collection_name: Name of the collection to create/use
        """
        self.db_path = db_path
        self.collection_name = collection_name
        
        # Create directory if needed
        os.makedirs(db_path, exist_ok=True)
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=db_path)
        
        self.collection = None
        self.chunk_metadata = {}
        
        logger.info(f"ChromaDBStorage initialized: {db_path}")
    
    def create_collection(self) -> None:
        """Create a new collection (overwrites if exists)"""
        try:
            self.client.delete_collection(name=self.collection_name)
            logger.info(f"Deleted existing collection: {self.collection_name}")
        except:
            pass
        
        self.collection = self.client.create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"✓ Created collection: {self.collection_name}")
    
    def get_or_create_collection(self) -> None:
        """Get collection if exists, create if not"""
        try:
            self.collection = self.client.get_collection(name=self.collection_name)
            logger.info(f"✓ Loaded existing collection: {self.collection_name}")
        except:
            self.create_collection()
    
    def store_chunks(self, 
                     chunks: List[Dict],
                     embeddings: np.ndarray) -> Dict:
        """
        Store chunks and embeddings in ChromaDB
        
        Args:
            chunks: List of chunk dicts from Phase 2
            embeddings: np.ndarray of shape (n_chunks, embedding_dim)
        
        Returns:
            Summary dict with storage stats
        """
        logger.info(f"Storing {len(chunks)} chunks in ChromaDB...")
        
        if not self.collection:
            self.get_or_create_collection()
        
        # Prepare data for ChromaDB
        ids = []
        documents = []
        metadatas = []
        embeddings_list = []
        
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            # Create unique ID
            chunk_id = f"{chunk['source']}#chunk_{chunk['chunk_index']}"
            ids.append(chunk_id)
            
            # Store text
            documents.append(chunk['text'])
            
            # Store metadata
            metadata = {
                'source': chunk['source'],
                'source_type': chunk['source_type'],
                'file_path': chunk['file_path'],
                'repo': chunk['repo'],
                'chunk_index': chunk['chunk_index'],
                'total_chunks': chunk['total_chunks'],
                'word_count': chunk['word_count'],
                'char_count': chunk['char_count'],
            }
            
            # Add optional metadata
            if chunk.get('raw_url'):
                metadata['raw_url'] = chunk['raw_url']
            if chunk.get('metadata'):
                metadata.update({
                    f"meta_{k}": str(v) 
                    for k, v in chunk['metadata'].items()
                })
            
            metadatas.append(metadata)
            
            # Store embedding
            embeddings_list.append(embedding.tolist())
            
            # Store for later reference
            self.chunk_metadata[chunk_id] = {
                'chunk': chunk,
                'embedding': embedding
            }
        
        # Add to ChromaDB
        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings_list
        )
        
        logger.info(f"✓ Stored {len(chunks)} chunks")
        
        return {
            'total_stored': len(chunks),
            'collection_name': self.collection_name,
            'db_path': self.db_path
        }
    
    def search_by_similarity(self,
                           query_embedding: np.ndarray,
                           n_results: int = 5,
                           where_filter: Optional[Dict] = None) -> List[Dict]:
        """
        Search for similar chunks by embedding
        
        Args:
            query_embedding: 1D embedding vector (or 2D array with 1 row)
            n_results: Number of results to return
            where_filter: ChromaDB where filter dict (optional)
        
        Returns:
            List of matching chunks with scores
        """
        if not self.collection:
            raise ValueError("Collection not initialized. Call store_chunks() first.")
        
        # Ensure embedding is 2D (ChromaDB expects list of embeddings)
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
        
        # Query ChromaDB
        results = self.collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=n_results,
            where=where_filter,
            include=['embeddings', 'metadatas', 'documents', 'distances']
        )
        
        # Format results
        formatted_results = []
        
        if results['ids'] and len(results['ids']) > 0:
            for idx, chunk_id in enumerate(results['ids'][0]):
                result = {
                    'id': chunk_id,
                    'text': results['documents'][0][idx],
                    'similarity_score': 1 - results['distances'][0][idx],  # Convert distance to similarity
                    'metadata': results['metadatas'][0][idx],
                    'embedding': results['embeddings'][0][idx] if results['embeddings'] else None
                }
                formatted_results.append(result)
        
        logger.info(f"Found {len(formatted_results)} similar chunks")
        return formatted_results
    
    def search_by_text(self,
                      query_text: str,
                      n_results: int = 5,
                      embedding_generator=None) -> List[Dict]:
        """
        Search by text query (requires embedding generator)
        
        Args:
            query_text: Text to search for
            n_results: Number of results
            embedding_generator: LSA embedding generator from Phase 2
        
        Returns:
            List of matching chunks
        """
        if not embedding_generator:
            raise ValueError("embedding_generator required for text search")
        
        if not embedding_generator.is_fitted:
            raise ValueError("Embedding generator not fitted")
        
        # Generate embedding for query
        query_embedding = embedding_generator.get_vector(query_text)
        
        logger.info(f"Searching for: '{query_text}'")
        
        # Search by embedding
        return self.search_by_similarity(query_embedding, n_results=n_results)
    
    def search_by_filter(self,
                        n_results: int = 10,
                        source_type: Optional[str] = None,
                        repo: Optional[str] = None,
                        source: Optional[str] = None) -> List[Dict]:
        """
        Search chunks by metadata filter
        
        Args:
            n_results: Max results to return
            source_type: Filter by source type (github, pdf, text)
            repo: Filter by repository
            source: Filter by source
        
        Returns:
            List of matching chunks
        """
        if not self.collection:
            raise ValueError("Collection not initialized")
        
        # Build ChromaDB where filter
        filters = []
        
        if source_type:
            filters.append({'source_type': {'$eq': source_type}})
        if repo:
            filters.append({'repo': {'$eq': repo}})
        if source:
            filters.append({'source': {'$eq': source}})
        
        # Combine filters with AND logic
        where_filter = None
        if filters:
            if len(filters) == 1:
                where_filter = filters[0]
            else:
                where_filter = {'$and': filters}
        
        # Get all matching documents (use dummy embedding)
        dummy_embedding = np.zeros(300).reshape(1, -1).tolist()
        
        try:
            results = self.collection.query(
                query_embeddings=dummy_embedding,
                n_results=n_results,
                where=where_filter,
                include=['metadatas', 'documents']
            )
            
            formatted_results = []
            if results['ids'] and len(results['ids']) > 0:
                for idx, chunk_id in enumerate(results['ids'][0]):
                    result = {
                        'id': chunk_id,
                        'text': results['documents'][0][idx],
                        'metadata': results['metadatas'][0][idx]
                    }
                    formatted_results.append(result)
            
            logger.info(f"Found {len(formatted_results)} chunks with filter")
            return formatted_results
        except Exception as e:
            logger.error(f"Filter search failed: {e}")
            return []
    
    def get_collection_info(self) -> Dict:
        """Get information about stored collection"""
        if not self.collection:
            return {'status': 'No collection loaded'}
        
        count = self.collection.count()
        
        return {
            'collection_name': self.collection_name,
            'db_path': self.db_path,
            'chunk_count': count,
            'embedding_dimension': 300
        }
    
    def delete_collection(self) -> None:
        """Delete the collection"""
        try:
            self.client.delete_collection(name=self.collection_name)
            self.collection = None
            logger.info(f"✓ Deleted collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
    
    def save_metadata(self, output_path: str = './data/chroma_metadata.json') -> None:
        """Save chunk metadata to JSON file"""
        metadata_dict = {
            chunk_id: {
                'text': data['chunk']['text'],
                'source': data['chunk']['source'],
                'source_type': data['chunk']['source_type'],
                'file_path': data['chunk']['file_path'],
                'chunk_index': data['chunk']['chunk_index']
            }
            for chunk_id, data in self.chunk_metadata.items()
        }
        
        with open(output_path, 'w') as f:
            json.dump(metadata_dict, f, indent=2)
        
        logger.info(f"✓ Saved metadata to {output_path}")
    
    def load_from_disk(self) -> None:
        """Load stored collection from disk"""
        try:
            self.collection = self.client.get_collection(name=self.collection_name)
            count = self.collection.count()
            logger.info(f"✓ Loaded collection from disk: {count} chunks")
        except Exception as e:
            logger.error(f"Error loading from disk: {e}")