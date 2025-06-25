from pypdf import PdfReader
from docx import Document

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path) # pdf dosyası açılır
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(docx_path):
    doc = Document(docx_path) # docx dosyası açılır.
    text = "" 
    for paragraph in doc.paragraphs: # tüm paragraflarda döner
        text += paragraph.text + "\n"   # her paragrafı satır satır ekler.
    return text