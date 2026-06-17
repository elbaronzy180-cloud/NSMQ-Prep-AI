import ollama
import json

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

print("NSMQ Prep Hub AI Agent")
print("Powered by TinyLlama + Question Bank")
print("Type quit to exit")
print("-" * 40)

while True:
    question = input("\nYour Question: ")
    
    if question.lower() == "quit":
        print("Goodbye! Keep studying!")
        break
    
    print("Searching question bank...")
    relevant = search_questions(question)
    context = "\n".join(relevant)
    
    print("\nAnswer:")
    print("-" * 40)
    
    # Stream the response word by word
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
        print(chunk['message']['content'], end="", flush=True)
    
    print("\n" + "-" * 40)