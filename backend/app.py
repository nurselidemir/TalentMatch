from fastapi import FastAPI, UploadFile, File, HTTPException
from pymongo import MongoClient
from datetime import datetime
from typing import List
import os
from parser import extract_text_with_pdfplumber, extract_text_from_docx, extract_email, extract_phone, extract_name, extract_keywords
from sectioner import segment_and_classify_sections
from embedding_utils import get_cv_embedding
from faiss_utils import load_embeddings_from_mongo, index

app = FastAPI()

# MongoDB bağlantısı
client = MongoClient("mongodb://localhost:27017")
db = client["talentmatch"]
cv_collection = db["cv_store"]

@app.on_event("startup")
async def load_faiss_index():
    # FAISS index'in yüklenmesi ve kontrol edilmesi
    global index
    if index is None:
        load_embeddings_from_mongo(cv_collection)

@app.post("/upload-cv/")
async def upload_cv(files: List[UploadFile] = File(...)):
    added_files = []

    for file in files:
        filename = file.filename
        extension = os.path.splitext(filename)[1].lower()

        if extension not in [".pdf", ".docx"]:
            continue  # desteklenmeyen uzantı

        contents = await file.read()
        temp_path = f"temp_{filename}"

        with open(temp_path, "wb") as f:
            f.write(contents)

        if extension == ".pdf":
            text = extract_text_with_pdfplumber(temp_path)
        else:
            text = extract_text_from_docx(temp_path)

        os.remove(temp_path)

        email = extract_email(text)
        phone = extract_phone(text)
        name = extract_name(text)
        sections = segment_and_classify_sections(text)
        embedding = get_cv_embedding(text)

        # Eğer index None ise, burada index'i başlatıyoruz
        if index is None:
            index = faiss.IndexFlatL2(embedding.shape[0])

        cv_doc = {
            "filename": filename,
            "text": text,
            "embedding": embedding.tolist(),
            "email": email,
            "phone": phone,
            "name": name,
            "sections": sections,
            "upload_time": datetime.utcnow()
        }

        cv_collection.insert_one(cv_doc)
        index.add(embedding.reshape(1, -1).astype("float32"))
        added_files.append(filename)

    if not added_files:
        raise HTTPException(status_code=400, detail="No valid files were uploaded.")

    return {
        "message": f"{len(added_files)} file(s) successfully uploaded.",
        "files": added_files
    }

@app.get("/uploaded-cvs/")
def list_uploaded_cvs():
    filenames = cv_collection.distinct("filename")
    return {"files": filenames}
