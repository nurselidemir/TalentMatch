from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import re
import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

from parser import extract_text_with_pdfplumber, extract_text_from_docx
from embedding_utils import get_cv_embedding
from faiss_utils import search_similar_candidates
from sectioner import segment_and_classify_sections

from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Query

# FastAPI uygulaması
app = FastAPI()

# CORS ayarları – frontend erişimi için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB bağlantısı
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["talentmatch"]
cv_collection = db["cv_collection"]

# Gereksiz kelimeler
CUSTOM_EXCLUDE_WORDS = {
    "candidate", "company", "description", "position", "ideal", "inc", "should", "via",
    "hands", "expose", "comfortable", "preferred", "seeking", "required", "responsible",
    "solutions", "team", "plus", "looking", "we", "our", "you", "your"
}

def extract_keywords(text: str):
    all_words = set(re.findall(r"\b\w+\b", text.lower()))
    return {
        word for word in all_words
        if word not in ENGLISH_STOP_WORDS
        and word not in CUSTOM_EXCLUDE_WORDS
        and len(word) > 2
    }

def extract_required_skills(job_description: str) -> List[str]:
    pattern = r"Required Skills:\s*(.+)"
    match = re.search(pattern, job_description, re.IGNORECASE | re.DOTALL)
    if match:
        skill_line = match.group(1).strip()
        skill_line = skill_line.replace("\n", " ").strip()
        return [s.strip() for s in skill_line.split(",") if s.strip()]
    return []

def extract_missing_skills(required_skills: List[str], cv_text: str) -> List[str]:
    cv_text_clean = cv_text.lower()
    missing = []
    for skill in required_skills:
        skill_clean = re.sub(r"[^\w\s]", "", skill.lower()).strip()
        if skill_clean not in cv_text_clean:
            missing.append(skill)
    return missing

@app.get("/")
def home():
    return {"message": "TalentMatch API is running 🎯"}

@app.post("/upload-cv/")
async def upload_cv(files: List[UploadFile] = File(...)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="En fazla 10 dosya yükleyebilirsiniz.")

    added_files = []

    for file in files:
        filename = file.filename
        extension = os.path.splitext(filename)[1].lower()

        existing = await cv_collection.find_one({"filename": filename})
        if existing:
            continue

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
        sections = segment_and_classify_sections(text)  # 🆕 bölümleri etiketle
        print("Sections preview:", sections)

        await cv_collection.insert_one({
            "filename": filename,
            "text": text,
            "embedding": embedding.tolist(),
            "sections": sections  # 🆕 bölümleri kaydet
        })

        added_files.append(filename)

    if not added_files:
        raise HTTPException(status_code=400, detail="No new valid files uploaded.")

    return {
        "message": f"{len(added_files)} file(s) successfully uploaded.",
        "files": added_files
    }

@app.get("/uploaded-cvs/")
async def list_uploaded_cvs():
    cvs = await cv_collection.find().to_list(length=100)
    return {"files": [cv["filename"] for cv in cvs]}

@app.post("/match-job/")
async def match_job(
    job_description: str = Body(..., embed=True),
    threshold: float = Query(0.0, ge=0.0, le=1.0, description="Benzerlik eşiği (0.0 - 1.0)")
):
    cvs = await cv_collection.find().to_list(length=100)

    if not cvs:
        raise HTTPException(status_code=404, detail="No CVs in the system.")

    required_skills = extract_required_skills(job_description)
    job_embedding = get_cv_embedding(job_description)
    cv_embeddings = [cv["embedding"] for cv in cvs]

    scores, indices = search_similar_candidates(job_embedding, cv_embeddings)

    matched = []
    for idx, score in zip(indices, scores):
        if score < threshold:
            continue  # eşik altındaysa geç
        cv = cvs[idx]
        cv_text = cv["text"]
        missing = extract_missing_skills(required_skills, cv_text)
        summary = "Summary:\n\n" + "\n".join(cv_text.strip().splitlines()[:12])

        matched.append({
            "filename": cv["filename"],
            "similarity_score": round(float(score), 3),
            "missing_skills": missing,
            "text_snippet": summary
        })

    return {
        "job_description": job_description,
        "required_skills": required_skills,
        "matched_candidates": matched
    }


@app.delete("/delete-cv/")
async def delete_cv(filename: str = Query(..., description="Filename to delete")):
    result = await cv_collection.delete_one({"filename": filename})
    if result.deleted_count == 1:
        return {"message": f"{filename} deleted successfully."}
    else:
        raise HTTPException(status_code=404, detail="File not found.")

@app.post("/submit-job/")
async def submit_job(job_description: str = Body(..., embed=True)):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    
    await db["job_collection"].insert_one({
        "description": job_description
    })
    return {"message": "Job description submitted successfully."}

@app.get("/saved-jobs/")
async def list_saved_jobs():
    jobs = await db["job_collection"].find().to_list(length=100)
    return [
        {
            "id": str(job["_id"]),
            "description": job["description"]
        }
        for job in jobs
    ]

@app.get("/cv-details/")
async def get_cv_details(filename: str = Query(..., description="Filename of the CV")):
    cv = await cv_collection.find_one({"filename": filename})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found.")
    
    return {
        "filename": cv["filename"],
        "sections": cv.get("sections", {})
    }
