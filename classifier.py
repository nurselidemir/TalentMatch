from transformers import pipeline


classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
# zero-shot-classification → yapmak istediğin görev tipi
# facebook/bart-large-mnli → kullanmak istediğin modelin adı

candidate_labels = [
  "Education",
  "Work Experience",
  "Technical Skills",
  "Personal Projects",
  "Certificates",
  "About Me",
  "Contact Info"
]

def classify_cv_section(text):
    """
    Verilen metni zero-shot classification ile etiketler.
    Dönüş: en yüksek olasılıklı etiket (örneğin 'Skills', 'Education' vb.)
    """
    result = classifier(text, candidate_labels)
    return result["labels"][0]  # en yüksek puanlı etiketi döndür
