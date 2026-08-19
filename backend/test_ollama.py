from ollama import chat

response = chat(
    model="qwen3",
    messages=[
        {
            "role": "user",
            "content": "Say exactly: FreedomOps local AI is working."
        }
    ]
)

print(response["message"]["content"])