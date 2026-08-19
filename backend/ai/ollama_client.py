import os
from ollama import Client

MODEL = "qwen3"

OLLAMA_URL = os.environ.get(
    "OLLAMA_URL",
    "http://127.0.0.1:11434"
)

client = Client(host=OLLAMA_URL)


def ask_ollama(prompt: str) -> str:
    response = client.chat(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        think=False
    )

    return response["message"]["content"]
