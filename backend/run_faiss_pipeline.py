from parser import extract_text_with_pdfplumber
from embedding_utils import get_cv_embedding
from faiss_utils import add_cv_embedding_to_index, search_similar_candidates

# 1. CV dosyasının yolunu al
cv_path = "emilycarterCV.pdf"
cv_text = extract_text_with_pdfplumber(cv_path)

# 2. CV metnini vektöre çevir
cv_embedding = get_cv_embedding(cv_text)

# 3. FAISS index'e ekle
add_cv_embedding_to_index(cv_embedding)

# 4. İş ilanını gir
job_text = "We are hiring an NLP engineer experienced in Python and spaCy."
job_embedding = get_cv_embedding(job_text)

# 5. Benzer CV’leri ara
scores, indices = search_similar_candidates(job_embedding)

# 6. Sonucu yazdır
print("Benzerlik Skorları:", scores)
print("Eşleşen CV İndeksleri:", indices)
