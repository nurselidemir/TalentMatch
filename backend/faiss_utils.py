import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def search_similar_candidates(query_embedding, cv_embeddings, top_k=None):
    """
    query_embedding: Tek bir iş ilanı embedding'i (list or np.ndarray)
    cv_embeddings: MongoDB'den gelen tüm CV embedding listesi
    """
    cv_embeddings_np = np.array(cv_embeddings)
    query = np.array(query_embedding).reshape(1, -1)

    similarities = cosine_similarity(query, cv_embeddings_np)[0]  # 1D array

    if top_k is None:
        top_k = len(similarities)

    indices = np.argsort(similarities)[::-1][:top_k]
    scores = similarities[indices]

    return scores, indices
