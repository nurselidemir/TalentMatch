from docx import Document
import pdfplumber
import re

def extract_text_with_pdfplumber(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text


def extract_text_from_docx(docx_path):
    doc = Document(docx_path) # docx dosyası açılır.
    text = "" 
    for paragraph in doc.paragraphs: # tüm paragraflarda döner
        text += paragraph.text + "\n"   # her paragrafı satır satır ekler.
    return text

def extract_email(text):
    pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    matches = re.findall(pattern,text)
    return matches[0] if matches else None

def extract_phone(text):
    pattern = r"((\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?){1,2}\d{3,4})"
    matches = re.findall(pattern, text)

    phones = [m[0] for m in matches if m[0].strip()]
    return phones[0] if phones else None
