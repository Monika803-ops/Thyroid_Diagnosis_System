import requests
r = requests.post("http://127.0.0.1:11434/api/generate",
                  json={"model": "mistral", "prompt": "What is thyroid?", "stream": False})
print(r.json())
