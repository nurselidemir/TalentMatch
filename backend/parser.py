from docx import Document
import pdfplumber
import re
import spacy

def extract_text_with_pdfplumber(pdf_path):
    """
    PDF dosyasındaki metni çıkarır.
    """
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text


def extract_text_from_docx(docx_path):
    """
    DOCX dosyasındaki metni çıkarır.
    """
    doc = Document(docx_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_email(text):
    """
    Metinden e-posta adresini çıkarır.
    """
    match = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if match:
        return match.group(0)
    else:
        return None


def extract_phone(text):
    """
    Metinden telefon numarasını çıkarır.
    """
    pattern = r"((\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?){1,2}\d{3,4})"
    matches = re.findall(pattern, text)

    phones = [m[0] for m in matches if m[0].strip()]
    return phones[0] if phones else None

nlp = spacy.load("en_core_web_sm")

def extract_name(text):
    """
    Metinden kişisel adı çıkarır (spacy kullanarak).
    """
    parsed_text = nlp(text)
    for ent in parsed_text.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return None

from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

CUSTOM_EXCLUDE_WORDS = {
    "candidate", "company", "description", "position", "ideal", "inc", "should", "via",
    "hands", "expose", "comfortable", "preferred", "seeking", "required", "responsible",
    "solutions", "team", "plus", "looking", "we", "our", "you", "your"
}

def extract_keywords(text: str):
    """
    Metinden anahtar kelimeleri çıkarır (stop words ve özel kelimeler hariç).
    """
    all_words = set(re.findall(r"\b\w+\b", text.lower()))
    return {
        word for word in all_words
        if word not in ENGLISH_STOP_WORDS
        and word not in CUSTOM_EXCLUDE_WORDS
        and len(word) > 2
    }
