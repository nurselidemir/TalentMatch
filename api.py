from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import os

from parser import extract_text_with_pdfplumber, extract_text_from_docx
from embedding_utils import get_cv_embedding
from faiss_utils import add_cv_embedding_to_index, search_similar_candidates

app = FastAPI()

# CV içeriklerini bellekte saklamak için liste
cv_store = []

@app.get("/")
def home():
    return {"message": "TalentMatch API is running 🎯"}

#  Tekli ve çoklu CV yüklemeyi aynı anda destekler
@app.post("/upload-cv/")
async def upload_cv(files: List[UploadFile] = File(...)):
    added_files = []

    for file in files:
        filename = file.filename
        extension = os.path.splitext(filename)[1].lower()

        # ❗ Yinelenen dosya kontrolü
        if any(cv["filename"] == filename for cv in cv_store):
            continue  # aynı dosya varsa atla

        if extension not in [".pdf", ".docx"]:
            continue

        contents = await file.read()
        temp_path = f"temp_{filename}"
        with open(temp_path, "wb") as f:
            f.write(contents)

        if extension == ".pdf":
            text = extract_text_with_pdfplumber(temp_path)
        else:
            text = extract_text_from_docx(temp_path)

        os.remove(temp_path)

        embedding = get_cv_embedding(text)
        add_cv_embedding_to_index(embedding)

        cv_store.append({
            "filename": filename,
            "text": text
        })

        added_files.append(filename)

    if not added_files:
        raise HTTPException(status_code=400, detail="No new valid files uploaded.")

    return {
        "message": f"{len(added_files)} dosya başarıyla yüklendi.",
        "files": added_files
    }
