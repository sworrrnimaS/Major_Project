# import logging
# import json
# import os
# from typing import List, Dict, Optional
# from dataclasses import dataclass
# from sentence_transformers import SentenceTransformer, CrossEncoder
# import numpy as np
# import faiss
# from threading import Lock
# import unicodedata
# import re
# from concurrent.futures import ThreadPoolExecutor

# # Setup logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     handlers=[
#         logging.FileHandler('search.log'),
#         logging.StreamHandler()
#     ]
# )
# logger = logging.getLogger(__name__)

# @dataclass
# class SearchResult:
#     """Data class to store search results with additional metadata"""
#     content: str
#     source: str
#     score: float
#     similarity: float
#     rank: int

# class SemanticSearch:
#     def __init__(
#         self,
#         model_name: str = 'all-mpnet-base-v2',
#         top_k: int = 10,
#         threshold: float = 0.3
#     ):
#         """
#         Initialize the semantic search engine with configurable parameters
#         """
#         try:
#             self.model = SentenceTransformer(model_name)
#             self.cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-12-v2")
#             self.dimension = self.model.get_sentence_embedding_dimension()
            
#             self.top_k = top_k
#             self.threshold = threshold
            
#             self.index = None
#             self.keys = None
#             self.lock = Lock()
            
#             logger.info(f"Initialized SemanticSearch with model {model_name}")
#             logger.info(f"Embedding dimension: {self.dimension}")
        
#         except Exception as e:
#             logger.error(f"Failed to initialize SemanticSearch: {str(e)}")
#             raise

#     def clean_text(self, text: str) -> str:
#         """Clean and normalize text"""
#         try:
#             text = unicodedata.normalize('NFKD', str(text))
#             text = re.sub(r'[^\x20-\x7E]', '', text)
#             text = re.sub(r'\s+', ' ', text)
#             return text.strip()
#         except Exception as e:
#             logger.warning(f"Error cleaning text: {str(e)}")
#             return str(text).strip()

#     def load_index_and_keys(
#         self,
#         faiss_file: str = 'embeddings/vector_database.faiss',
#         key_file: str = 'embeddings/key_mapping.json'
#     ):
#         """Load the FAISS index and keys"""
#         with self.lock:
#             try:
#                 if not os.path.exists(faiss_file) or not os.path.exists(key_file):
#                     logger.warning("Index or key file not found. Starting with empty index.")
#                     return

#                 self.index = faiss.read_index(faiss_file)
                
#                 with open(key_file, 'r', encoding='utf-8') as f:
#                     raw_keys = json.load(f)
                
#                 self.keys = [
#                     tuple(self.clean_text(str(item)) for item in key_pair)
#                     for key_pair in raw_keys
#                 ]
                
#                 if self.index.ntotal != len(self.keys):
#                     logger.warning(f"Mismatch between index vectors ({self.index.ntotal}) and keys ({len(self.keys)})")
                
#                 logger.info(f"Loaded index with {self.index.ntotal} vectors")
            
#             except Exception as e:
#                 logger.error(f"Error loading index and keys: {str(e)}")
#                 raise

#     def search(
#         self,
#         query: str,
#         top_k: Optional[int] = None,
#         threshold: Optional[float] = None
#     ) -> List[SearchResult]:
#         """Perform semantic search with cross-encoder reranking"""
#         search_top_k = top_k or self.top_k
#         search_threshold = threshold or self.threshold
        
#         try:
#             with self.lock:
#                 if not self.index or not self.keys:
#                     raise ValueError("Index and keys must be loaded first")
                
#                 # Initial bi-encoder search
#                 query_embedding = self.model.encode([self.clean_text(query)])
#                 distances, indices = self.index.search(query_embedding, search_top_k)
                
#                 # Process initial results
#                 results = []
#                 for rank, (dist, idx) in enumerate(zip(distances[0], indices[0]), 1):
#                     if idx >= len(self.keys):
#                         continue
                    
#                     content, source = self.keys[idx]
#                     similarity = 1 - (dist / 2.0)
                    
#                     if similarity >= search_threshold:
#                         results.append(SearchResult(
#                             content=content,
#                             source=source,
#                             score=similarity,
#                             similarity=similarity,
#                             rank=rank
#                         ))
                
#                 # Rerank with cross-encoder if we have results
#                 if results:
#                     pairs = [(query, r.content) for r in results]
#                     cross_scores = self.cross_encoder.predict(pairs)
                    
#                     # Update scores and sort
#                     for result, cross_score in zip(results, cross_scores):
#                         result.score = cross_score
                    
#                     results.sort(key=lambda x: x.score, reverse=True)
                    
#                     # Update ranks after sorting
#                     for i, result in enumerate(results, 1):
#                         result.rank = i
                
#                 logger.info(f"Search Results for Query: '{query}'")
#                 for result in results:
#                     logger.info(
#                         f"Rank: {result.rank}, Score: {result.score:.4f}, "
#                         f"Similarity: {result.similarity:.4f}, Content: {result.content[:1000]}"
#                     )
                
#                 return results
        
#         except Exception as e:
#             logger.error(f"Error during search: {str(e)}")
#             return []

#     def batch_search(
#         self,
#         queries: List[str],
#         top_k: Optional[int] = None,
#         threshold: Optional[float] = None
#     ) -> List[List[SearchResult]]:
#         """Perform batch semantic search"""
#         with ThreadPoolExecutor() as executor:
#             results = list(executor.map(
#                 lambda q: self.search(q, top_k, threshold),
#                 queries
#             ))
#         return results


# wihtout cross encoder reranking

import logging
import json
import os
from typing import List, Dict, Optional
from dataclasses import dataclass
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
from threading import Lock
import unicodedata
import re
from concurrent.futures import ThreadPoolExecutor
from collections import Counter
import math

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('search.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class SearchResult:
    content: str
    source: str
    score: float
    similarity: float
    rank: int

class CustomRanker:
    """Simple implementation of keyword-based scoring"""
    def __init__(self):
        self.doc_freqs = Counter()
        self.doc_lengths = []
        self.avg_doc_length = 0
        self.total_docs = 0
        
    def preprocess(self, text: str) -> List[str]:
        """Tokenize text into words"""
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        return text.split()
    
    def fit(self, documents: List[str]):
        """Compute document frequencies and lengths"""
        self.total_docs = len(documents)
        
        # Compute document frequencies and lengths
        for doc in documents:
            tokens = self.preprocess(doc)
            self.doc_lengths.append(len(tokens))
            
            # Count unique terms in document
            for term in set(tokens):
                self.doc_freqs[term] += 1
        
        self.avg_doc_length = sum(self.doc_lengths) / self.total_docs
    
    def score(self, query: str, documents: List[str]) -> np.ndarray:
        """Score documents using TF-IDF like scoring"""
        query_tokens = self.preprocess(query)
        scores = np.zeros(len(documents))
        
        for i, doc in enumerate(documents):
            doc_tokens = self.preprocess(doc)
            doc_len = len(doc_tokens)
            term_freqs = Counter(doc_tokens)
            
            score = 0
            for term in query_tokens:
                if term in term_freqs:
                    tf = term_freqs[term]
                    df = self.doc_freqs[term]
                    if df > 0:
                        idf = math.log((self.total_docs + 1) / (df + 0.5))
                        score += (tf * idf) * (2.2 / (1.2 + 0.3 * (doc_len / self.avg_doc_length)))
            
            scores[i] = score
        
        # Normalize scores to [0, 1]
        if scores.max() > 0:
            scores = scores / scores.max()
        
        return scores

class SemanticSearch:
    def __init__(
        self,
        model_name: str = 'all-mpnet-base-v2',
        top_k: int = 15,
        threshold: float = 0.3,
        semantic_weight: float = 0.7,
        keyword_weight: float = 0.3
    ):
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.top_k = top_k
        self.threshold = threshold
        
        self.semantic_weight = semantic_weight
        self.keyword_weight = keyword_weight
        
        self.index = None
        self.keys = None
        self.ranker = CustomRanker()
        self.lock = Lock()
        
        logger.info(f"Initialized SemanticSearch with model {model_name}")
        logger.info(f"Embedding dimension: {self.dimension}")

    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        text = unicodedata.normalize('NFKD', str(text))
        text = re.sub(r'[^\x20-\x7E]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def load_index_and_keys(
        self,
        faiss_file: str = 'python/embeddings/vector_database.faiss',
        key_file: str = 'python/embeddings/key_mapping.json'
    ):
        """Load index and prepare ranker"""
        with self.lock:
            try:
                if not os.path.exists(faiss_file) or not os.path.exists(key_file):
                    logger.warning("Index or key file not found. Starting with empty index.")
                    return

                self.index = faiss.read_index(faiss_file)
                
                with open(key_file, 'r', encoding='utf-8') as f:
                    raw_keys = json.load(f)
                
                self.keys = [
                    tuple(self.clean_text(str(item)) for item in key_pair)
                    for key_pair in raw_keys
                ]
                
                # Prepare ranker with documents
                documents = [content for content, _ in self.keys]
                self.ranker.fit(documents)
                
                logger.info(f"Loaded index with {self.index.ntotal} vectors")
            
            except Exception as e:
                logger.error(f"Error loading index and keys: {str(e)}")
                raise

    def search(
        self,
        query: str,
        top_k: Optional[int] = None,
        threshold: Optional[float] = None
    ) -> List[SearchResult]:
        search_top_k = top_k or self.top_k
        search_threshold = threshold or self.threshold
        
        try:
            with self.lock:
                if not self.index or not self.keys:
                    raise ValueError("Index and keys must be loaded first")
                
                # Clean query
                cleaned_query = self.clean_text(query)
                
                # Semantic search
                query_embedding = self.model.encode([cleaned_query], normalize_embeddings=True)
                distances, indices = self.index.search(query_embedding, search_top_k * 2)
                
                # Convert distances to similarities
                similarities = 1 - (distances[0] / 2.0)
                
                # Get candidate documents
                candidate_docs = [self.keys[idx][0] for idx in indices[0]]
                
                # Get keyword-based scores
                keyword_scores = self.ranker.score(cleaned_query, candidate_docs)
                
                # Combine scores
                final_scores = (
                    self.semantic_weight * similarities +
                    self.keyword_weight * keyword_scores
                )
                
                # Sort by combined scores
                sorted_indices = np.argsort(-final_scores)
                
                # Create results
                results = []
                for rank, idx in enumerate(sorted_indices[:search_top_k], 1):
                    if final_scores[idx] < search_threshold:
                        continue
                        
                    orig_idx = indices[0][idx]
                    if orig_idx >= len(self.keys) or orig_idx < 0:
                        continue
                    
                    content, source = self.keys[orig_idx]
                    
                    results.append(SearchResult(
                        content=content,
                        source=source,
                        score=final_scores[idx],
                        similarity=similarities[idx],
                        rank=rank
                    ))
                
                logger.info(f"Search Results for Query: '{query}'")
                for result in results:
                    logger.info(
                        f"Rank: {result.rank}, Score: {result.score:.4f}, "
                        f"Similarity: {result.similarity:.4f}, Content: {result.content[:1000]}"
                    )
                
                return results
        
        except Exception as e:
            logger.error(f"Error during search: {str(e)}")
            return []

    def batch_search(
        self,
        queries: List[str],
        top_k: Optional[int] = None,
        threshold: Optional[float] = None
    ) -> List[List[SearchResult]]:
        with ThreadPoolExecutor() as executor:
            results = list(executor.map(
                lambda q: self.search(q, top_k, threshold),
                queries
            ))
        return results