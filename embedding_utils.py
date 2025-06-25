from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def get_cv_embedding(text: str):
    """
    CV içeriğini alır, embedding (vektör) olarak döner.
    """
    return model.encode(text, convert_to_numpy=True)
# sentence-transformers içindeki SBERT modeline bu metni verir. model bu metni sayısal vektör haline getirir.
# çıktıyı numpy array olarak verir.
