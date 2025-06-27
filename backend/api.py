from fastapi import FastAPI, UploadFile, File, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import re
import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

from parser import extract_text_with_pdfplumber, extract_text_from_docx, extract_email, extract_phone, extract_name
from embedding_utils import get_cv_embedding
from faiss_utils import search_similar_candidates
from sectioner import segment_and_classify_sections
from summarizer import summarize_cv
from email_utils import send_match_email

from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["talentmatch"]
cv_collection = db["cv_collection"]

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
        skill_line = match.group(1).replace("\n", " ").strip()
        return [s.strip() for s in skill_line.split(",") if s.strip()]
    return []

def extract_missing_skills(required_skills: List[str], cv_text: str) -> List[str]:
    cv_text_clean = cv_text.lower()
    return [
        skill for skill in required_skills
        if re.sub(r"[^\w\s]", "", skill.lower()).strip() not in cv_text_clean
    ]

@app.get("/")
def home():
    return {"message": "TalentMatch API is running 🎯"}

@app.post("/upload-cv/")
async def upload_cv(files: List[UploadFile] = File(...)):
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed.")

    added_files = []

    for file in files:
        filename = file.filename
        extension = os.path.splitext(filename)[1].lower()

        existing = await cv_collection.find_one({"filename": filename})
        if existing or extension not in [".pdf", ".docx"]:
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

        email = extract_email(text)
        phone = extract_phone(text)
        name = extract_name(text)

        embedding = get_cv_embedding(text)
        summary = summarize_cv(text)
        sections = segment_and_classify_sections(text)

        await cv_collection.insert_one({
            "filename": filename,
            "text": text,
            "embedding": embedding.tolist(),
            "email": email,
            "phone": phone,
            "name": name,
            "summary": summary,
            "sections": sections
        })

        added_files.append(filename)

    if not added_files:
        raise HTTPException(status_code=400, detail="No valid CVs uploaded.")

    return {"message": f"{len(added_files)} file(s) uploaded.", "files": added_files}

@app.get("/uploaded-cvs/")
async def list_uploaded_cvs():
    cvs = await cv_collection.find().to_list(length=100)
    return {"files": [cv["filename"] for cv in cvs]}

@app.post("/match-job/")
async def match_job(
    job_description: str = Body(..., embed=True),
    threshold: float = Query(0.0, ge=0.0, le=1.0)
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
            continue
        cv = cvs[idx]
        cv_text = cv["text"]
        missing = extract_missing_skills(required_skills, cv_text)
        summary = cv.get("summary") or "No summary available."
        email = cv.get("email")

        matched.append({
            "filename": cv["filename"],
            "similarity_score": round(float(score), 3),
            "missing_skills": missing,
            "text_snippet": summary,
            "email": email
        })

    return {
        "job_description": job_description,
        "required_skills": required_skills,
        "matched_candidates": matched
    }

@app.post("/send-emails/")
async def send_bulk_emails(data: dict = Body(...)):
    job_description = data.get("job_description")
    candidates = data.get("candidates", [])
    if not job_description or not candidates:
        raise HTTPException(status_code=400, detail="Missing data.")

    sent_to = []
    for c in candidates:
        email = c.get("email")
        score = c.get("similarity_score")
        if email:
            try:
                send_match_email(email, job_description, score)
                sent_to.append(email)
            except Exception:
                continue

    return {"sent_count": len(sent_to), "sent_to": sent_to}

@app.post("/submit-job/")
async def submit_job(job_description: str = Body(..., embed=True)):
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    await db["job_collection"].insert_one({"description": job_description})
    return {"message": "Job description submitted successfully."}

@app.get("/saved-jobs/")
async def list_saved_jobs():
    jobs = await db["job_collection"].find().to_list(length=100)
    return [{"id": str(job["_id"]), "description": job["description"]} for job in jobs]

@app.get("/cv-details/")
async def get_cv_details(filename: str = Query(...)):
    cv = await cv_collection.find_one({"filename": filename})
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found.")
    return {
        "filename": cv["filename"],
        "email": cv.get("email"),
        "phone": cv.get("phone"),
        "name": cv.get("name"),
        "sections": cv.get("sections", {}),
        "summary": cv.get("summary", "No summary available.")
    }

@app.delete("/delete-cv/")
async def delete_cv(filename: str = Query(...)):
    result = await cv_collection.delete_one({"filename": filename})
    if result.deleted_count == 1:
        return {"message": f"{filename} deleted successfully."}
    else:
        raise HTTPException(status_code=404, detail="File not found.")
