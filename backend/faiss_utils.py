import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import faiss

# FAISS index nesnesi (sunucu başladığında doldurulur)
index = None

def search_similar_candidates(query_embedding, cv_embeddings, top_k=None):
    """
    İş ilanı embedding'i ile tüm CV embedding'leri arasındaki benzerlik skorlarını hesaplar.
    """
    cv_embeddings_np = np.array(cv_embeddings)
    query = np.array(query_embedding).reshape(1, -1)

    similarities = cosine_similarity(query, cv_embeddings_np)[0]  # benzerlik skorları

    if top_k is None:
        top_k = len(similarities)

    indices = np.argsort(similarities)[::-1][:top_k]  # en yüksekten düşüğe sırala
    scores = similarities[indices]

    return scores, indices

def load_embeddings_from_mongo(cv_collection):
    """
    MongoDB'deki tüm CV embedding'lerini FAISS index'e yükler.
    Bu fonksiyon sunucu başlarken bir kez çalıştırılmalıdır.
    """
    all_cvs = list(cv_collection.find({}))
    if not all_cvs:
        return

    embeddings = [cv["embedding"] for cv in all_cvs]
    embeddings_np = np.array(embeddings).astype("float32")

    global index
    index = faiss.IndexFlatL2(embeddings_np.shape[1])
    index.add(embeddings_np)
