from docx import Document
import pdfplumber

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