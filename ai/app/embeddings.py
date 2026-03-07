"""
Phase 2: Embedding Generation Module
Uses LSA (Latent Semantic Analysis) for document embedding
"""

import logging
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
from typing import List, Optional

logger = logging.getLogger(__name__)


class LSAEmbedding:
    """Generate embeddings using Latent Semantic Analysis (LSA)"""
    
    def __init__(self, 
                 n_components: int = 300,
                 n_iter: int = 60,
                 random_state: int = 42,
                 max_df: float = 0.95,
                 min_df: int = 2):
        """
        Initialize LSA embedding generator
        
        Args:
            n_components: Embedding dimension
            n_iter: SVD iterations
            random_state: Random seed
            max_df: Max document frequency (0-1)
            min_df: Min document frequency (count)
        """
        self.n_components = n_components
        self.n_iter = n_iter
        self.random_state = random_state
        self.max_df = max_df
        self.min_df = min_df
        
        self.vectorizer = None
        self.lsa = None
        self.fitted = False
        
        logger.info(f"LSAEmbedding initialized: dim={n_components}, iter={n_iter}")
    
    def fit_transform(self, documents: List[str]) -> np.ndarray:
        """
        Fit LSA on documents and return embeddings
        
        Args:
            documents: List of text documents (chunks)
        
        Returns:
            Embedding matrix (n_docs, n_components)
        """
        logger.info(f"Fitting LSA on {len(documents)} documents...")
        
        # Step 1: TF-IDF vectorization
        self.vectorizer = TfidfVectorizer(
            max_df=self.max_df,
            min_df=self.min_df,
            token_pattern=r'(?u)\b\w\w+\b',
            lowercase=True,
            stop_words='english'
        )
        
        logger.info("Computing TF-IDF vectors...")
        tfidf_matrix = self.vectorizer.fit_transform(documents)
        logger.info(f"TF-IDF shape: {tfidf_matrix.shape}")
        
        # Step 2: LSA dimensionality reduction
        n_components_actual = min(self.n_components, tfidf_matrix.shape[1] - 1)
        
        self.lsa = TruncatedSVD(
            n_components=n_components_actual,
            n_iter=self.n_iter,
            random_state=self.random_state
        )
        
        logger.info("Computing LSA decomposition...")
        embeddings = self.lsa.fit_transform(tfidf_matrix)
        
        # Step 3: L2 normalization
        embeddings = normalize(embeddings, norm='l2')
        
        self.fitted = True
        
        logger.info(f"✓ LSA complete: {embeddings.shape}")
        logger.info(f"  Explained variance: {self.lsa.explained_variance_ratio_.sum():.4f}")
        
        return embeddings
    
    def transform(self, documents: List[str]) -> np.ndarray:
        """
        Transform new documents using fitted LSA
        
        Args:
            documents: List of new documents
        
        Returns:
            Embedding matrix
        """
        if not self.fitted:
            raise ValueError("LSA not fitted yet. Call fit_transform first.")
        
        logger.info(f"Transforming {len(documents)} new documents...")
        
        # Vectorize with fitted vectorizer
        tfidf_matrix = self.vectorizer.transform(documents)
        
        # Apply LSA
        embeddings = self.lsa.transform(tfidf_matrix)
        
        # Normalize
        embeddings = normalize(embeddings, norm='l2')
        
        logger.info(f"✓ Transform complete: {embeddings.shape}")
        
        return embeddings
    
    def get_feature_names(self) -> List[str]:
        """Get vocabulary from vectorizer"""
        if self.vectorizer is None:
            raise ValueError("Vectorizer not fitted")
        return self.vectorizer.get_feature_names_out().tolist()
    
    def get_components(self) -> np.ndarray:
        """Get LSA components (topics)"""
        if self.lsa is None:
            raise ValueError("LSA not fitted")
        return self.lsa.components_
    
    def get_explained_variance(self) -> float:
        """Get explained variance ratio"""
        if self.lsa is None:
            raise ValueError("LSA not fitted")
        return self.lsa.explained_variance_ratio_.sum()