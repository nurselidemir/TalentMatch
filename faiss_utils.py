import faiss
import numpy as np

# SBERT modelimizin embedding boyutu: 384
dimension = 384
index = faiss.IndexFlatIP(dimension)  # Cosine similarity için inner product

def add_cv_embedding_to_index(embedding: np.ndarray):
    """
    Normalize edip FAISS index'e ekler
    """
    norm_embedding = embedding / np.linalg.norm(embedding)
    index.add(np.array([norm_embedding], dtype='float32'))

def search_similar_candidates(query_embedding: np.ndarray, top_k=5):
    """
    Normalize sorguyu alır ve en benzer top_k CV’yi döner
    """
    norm_query = query_embedding / np.linalg.norm(query_embedding)
    scores, indices = index.search(np.array([norm_query], dtype='float32'), top_k)
    return scores[0], indices[0]

