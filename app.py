import os # dosya uzantısı alabilmek için
#  dosyanın .pdf mi .docx mi olduğunu ayırt etmek için
from parser import extract_text_from_docx, extract_text_with_pdfplumber,extract_email, extract_phone

file_path = input("Enter the file path (.pdf or .docx):").strip()
extension = os.path.splitext(file_path)[1].lower()

if extension == ".pdf":
    text = extract_text_with_pdfplumber(file_path)
elif extension == ".docx":
    text = extract_text_from_docx(file_path)
else:
    raise ValueError("Only .pdf or .docx files are supported")

print("\n--- Extracted Information ---")
print(text[:500]) # 0 dan 500'e
print("📧 Email:", extract_email(text))
print("📞 Phone:", extract_phone(text))