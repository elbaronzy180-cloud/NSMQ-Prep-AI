from flask import Flask, render_template, request, Response
import ollama
import json

app = Flask(__name__)

# Load all questions
with open("data/questions.json", encoding="utf-8") as f:
    data = json.load(f)

def search_questions(query, top=3):
    results = []
    query_words = query.lower().split()
    
    for doc in data:
        content = doc["content"].lower()
        score = sum(1 for word in query_words if word in content)
        if score > 0:
            results.append((score, doc["content"][:300]))
    
    results.sort(reverse=True)
    return [r[1] for r in results[:top]]

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    question = request.json.get("question")
    relevant = search_questions(question)
    context = "\n".join(relevant)

    def generate():
        stream = ollama.chat(
            model="tinyllama",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an NSMQ exam expert. Answer clearly and concisely. Use this context:\n{context}"
                },
                {
                    "role": "user",
                    "content": question
                }
            ],
            stream=True
        )
        for chunk in stream:
            yield chunk['message']['content']

    return Response(generate(), mimetype="text/plain")

if __name__ == "__main__":
    app.run(debug=True)