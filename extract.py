import os
from docx import Document
import PyPDF2
import json

questions = []
skipped = []

def extract_from_word(file_path):
    doc = Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def process_folder(folder_path):
    files = os.listdir(folder_path)
    total = len(files)
    
    for index, filename in enumerate(files, 1):
        filepath = os.path.join(folder_path, filename)
        print(f"[{index}/{total}] Processing: {filename}")
        
        if filename.endswith(".docx"):
            try:
                text = extract_from_word(filepath)
                questions.append({
                    "source": filename,
                    "type": "word",
                    "content": text
                })
                print(f"✅ Done: {filename}")
            except Exception as e:
                print(f"⚠️ Skipped: {filename} → {e}")
                skipped.append(filename)

        elif filename.endswith(".pdf"):
            try:
                text = extract_from_pdf(filepath)
                questions.append({
                    "source": filename,
                    "type": "pdf",
                    "content": text
                })
                print(f"✅ Done: {filename}")
            except Exception as e:
                print(f"⚠️ Skipped: {filename} → {e}")
                skipped.append(filename)

        else:
            print(f"⏭️ Ignored: {filename}")

# Your folder path
folder = "data/questions_bank"

print("=" * 40)
print("Extracting all questions...")
print("=" * 40)

process_folder(folder)

# Save all questions
with open("data/questions.json", "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

# Save skipped files
with open("data/skipped.txt", "w") as f:
    for s in skipped:
        f.write(s + "\n")

print("=" * 40)
print(f"✅ Extracted: {len(questions)} documents")
print(f"⚠️ Skipped:   {len(skipped)} bad files")
print("📁 Saved to data/questions.json")
print("=" * 40)