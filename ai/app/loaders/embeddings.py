"""
Phase 2: LSA Embedding Generation
Fits into: ai/loaders/embeddings.py

Input: Raw text chunks (from chunking.py)
Output: 300-dimensional LSA embeddings
"""

import logging
import numpy as np
import re
from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import nltk

logger = logging.getLogger(__name__)

# Download NLTK resources
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')


class LSAEmbedding:
    """Generate LSA embeddings for text chunks"""
    
    def __init__(self, 
                 n_components: int = 300,
                 n_iter: int = 60,
                 random_state: int = 42,
                 max_df: float = 0.75,
                 min_df: int = 1):
        """
        Initialize LSA embedding generator
        
        Args:
            n_components: Output embedding dimension
            n_iter: SVD iterations
            random_state: Random seed
            max_df: Max document frequency
            min_df: Min document frequency
        """
        self.n_components = n_components
        self.n_iter = n_iter
        self.random_state = random_state
        self.max_df = max_df
        self.min_df = min_df
        
        self.vectorizer = None
        self.lsa_model = None
        self.word_vectors = {}
        self.stop_words = set(stopwords.words('english'))
        self.is_fitted = False
        
        logger.info(f"LSAEmbedding initialized: {n_components} components")
    
    @staticmethod
    def _preprocess_text(text: str) -> str:
        """Clean and preprocess text"""
        text = text.lower()
        text = re.sub(r'[0-9]+', '', text)
        text = re.sub(r'[—–]', ' ', text)
        text = re.sub(r'[-()\"#/@;:<>{}`+=~|.!?,\'\'`]', ' ', text)
        text = re.sub(r'\[\]', '', text)
        text = text.replace('[', '').replace(']', '').replace("'", ' ')
        text = re.sub(r'\b(?=[ivxlcdm]+\b)([ivxlcdm]+)\b', '', text, flags=re.IGNORECASE)
        return text
    
    def _tokenize_text(self, text: str, remove_stopwords: bool = True) -> List[str]:
        """Tokenize text and optionally remove stopwords"""
        tokens = word_tokenize(text)
        if remove_stopwords:
            tokens = [w for w in tokens if w not in self.stop_words and len(w) > 2]
        return tokens
    
    def fit(self, documents: List[str]) -> 'LSAEmbedding':
        """
        Fit LSA model on documents
        
        Args:
            documents: List of text strings
        
        Returns:
            self
        """
        logger.info(f"Fitting LSA on {len(documents)} documents...")
        
        # Preprocess
        processed = [self._preprocess_text(doc) for doc in documents]
        
        # TF-IDF vectorization
        self.vectorizer = TfidfVectorizer(
            tokenizer=self._tokenize_text,
            max_df=self.max_df,
            min_df=self.min_df,
            token_pattern=None,
            lowercase=False,
            strip_accents=None
        )
        
        X = self.vectorizer.fit_transform(processed)
        logger.info(f"TF-IDF matrix: {X.shape}")
        
        # LSA fitting
        self.lsa_model = TruncatedSVD(
            n_components=self.n_components,
            n_iter=self.n_iter,
            random_state=self.random_state
        )
        
        _ = self.lsa_model.fit_transform(X)
        
        # Generate word embeddings
        V = self.lsa_model.components_.T
        singular_values = self.lsa_model.singular_values_
        VS = np.dot(V, np.diag(np.power(singular_values, 1.0)))
        word_embeddings = VS.T
        word_embeddings = normalize(word_embeddings, norm='l2')
        
        # Build word vector map
        feature_names = self.vectorizer.get_feature_names_out()
        for word, idx in zip(feature_names, range(len(feature_names))):
            self.word_vectors[word] = word_embeddings[:, idx]
        
        self.is_fitted = True
        logger.info(f"✓ LSA fitted. Vocabulary: {len(self.word_vectors)}")
        
        return self
    
    def get_vector(self, text: str) -> np.ndarray:
        """Get embedding for a single text"""
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        tokens = self._tokenize_text(self._preprocess_text(text))
        vectors = [self.word_vectors[t] for t in tokens if t in self.word_vectors]
        
        if not vectors:
            logger.warning(f"No known words in: {text[:50]}...")
            return np.zeros(self.n_components)
        
        avg = np.mean(vectors, axis=0)
        norm = np.linalg.norm(avg)
        
        return avg / norm if norm != 0 else avg
    
    def transform(self, documents: List[str]) -> np.ndarray:
        """Transform documents to embeddings"""
        if not self.is_fitted:
            raise ValueError("Model not fitted. Call fit() first.")
        
        logger.info(f"Generating embeddings for {len(documents)} documents...")
        embeddings = []
        
        for i, doc in enumerate(documents):
            embeddings.append(self.get_vector(doc))
            if (i + 1) % 100 == 0:
                logger.info(f"  {i + 1}/{len(documents)}")
        
        result = np.array(embeddings)
        logger.info(f"✓ Embeddings: {result.shape}")
        return result
    
    def fit_transform(self, documents: List[str]) -> np.ndarray:
        """Fit and transform in one step"""
        self.fit(documents)
        return self.transform(documents)