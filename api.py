from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from pydantic import BaseModel
from typing import List
import os
import re

from parser import extract_text_with_pdfplumber, extract_text_from_docx
from embedding_utils import get_cv_embedding
from faiss_utils import add_cv_embedding_to_index, search_similar_candidates

app = FastAPI()

# CV içeriklerini bellekte tut
cv_store = []

#  Basit kelime çıkarımı (anahtar kelime seti)
def extract_keywords(text: str):
    stopwords = {
        "a", "an", "and", "the", "with", "of", "for", "in", "on", "at", "to", "from",
        "by", "is", "are", "as", "that", "this", "these", "those", "be", "have", "has",
        "looking", "we", "our", "you", "your"
    }

    all_words = set(re.findall(r"\b\w+\b", text.lower()))
    keywords = all_words - stopwords
    return keywords


@app.get("/")
def home():
    return {"message": "TalentMatch API is running 🎯"}

# CV yükleme endpoint'i
@app.post("/upload-cv/")
async def upload_cv(files: List[UploadFile] = File(...)):
    added_files = []

    for file in files:
        filename = file.filename
        extension = os.path.splitext(filename)[1].lower()

        if any(cv["filename"] == filename for cv in cv_store):
            continue  # yinelenen dosya varsa atla

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
        "message": f"{len(added_files)} file(s) successfully uploaded.",
        "files": added_files
    }

#  Eşleştirme ve eksik beceri analizi
@app.post("/match-job/")
async def match_job(job_description: str = Body(..., embed=True)):
    if not cv_store:
        raise HTTPException(status_code=404, detail="No CVs in the system.")

    job_embedding = get_cv_embedding(job_description)

    top_k = len(cv_store)
    scores, indices = search_similar_candidates(job_embedding, top_k=top_k)

    job_keywords = extract_keywords(job_description)

    matched = []
    for idx, score in zip(indices, scores):
        if idx < len(cv_store):
            cv_text = cv_store[idx]["text"]
            cv_keywords = extract_keywords(cv_text)

            missing = sorted(list(job_keywords - cv_keywords))

            matched.append({
                "filename": cv_store[idx]["filename"],
                "similarity_score": round(float(score), 3),
                "missing_skills": missing,
                "text_snippet": cv_text[:300]
            })

    return {
        "job_description": job_description,
        "matched_candidates": matched
    }
