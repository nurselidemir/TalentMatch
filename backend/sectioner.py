from classifier import classify_cv_section
import re

def segment_and_classify_sections(text):
    """
    CV metnini bölümlere ayırır ve her bölümü etiketler.
    """
    labeled_sections = {}
    current_block = []

    for line in text.splitlines():
        line = line.strip()

        if not line:
            continue
        if line.isupper() and len(line.split()) <= 5:
            if current_block:
                block_text = "\n".join(current_block).strip()
                label = classify_cv_section(block_text)
                labeled_sections.setdefault(label, []).append(block_text)
                current_block = []
            current_block.append(line)
        else:
            current_block.append(line)

    if current_block:
        block_text = "\n".join(current_block).strip()
        label = classify_cv_section(block_text)
        labeled_sections.setdefault(label, []).append(block_text)

    return labeled_sections
