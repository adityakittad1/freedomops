from ollama import Client


MODEL = "qwen3:latest"

client = Client(host="http://127.0.0.1:11434")


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