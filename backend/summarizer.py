from transformers import pipeline

# Model yükleme (ilk kullanımda indirir)
summarizer = pipeline("summarization", model="t5-small", tokenizer="t5-small")

def summarize_cv(text: str) -> str:
    """
    CV metnini özetler.
    Eğer metin çok kısaysa, orijinal metni döndürür.
    """
    if len(text) < 30:
        return text  #  çok kısa metin özetlenmez

    # T5 için input formatı
    prompt = "summarize: " + text.strip().replace("\n", " ")

    try:
        summary = summarizer(prompt, max_length=100, min_length=30, do_sample=False)[0]["summary_text"]
        return summary.strip()
    except Exception as e:
        return "[Summarization failed]"
