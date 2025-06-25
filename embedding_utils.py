from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def get_cv_embedding(text: str):
    """
    CV içeriğini alır, embedding (vektör) olarak döner.
    """
    return model.encode(text, convert_to_numpy=True)
# sentence-transformers içindeki SBERT modeline bu metni verir. model bu metni sayısal vektör haline getirir.
# çıktıyı numpy array olarak verir.

from numpy import dot
from numpy.linalg import norm

def calculate_similarity(embedding1, embedding2):
     """
    İki embedding arasındaki cosine similarity oranını hesaplar.
    1.0 → tamamen aynı, 0.0 → alakasız
    """
    return dot(embedding1, embedding2) / (norm(embedding1) * norm(embedding2))