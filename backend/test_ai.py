from ai.ollama_client import ask_ollama


response = ask_ollama(
    "Explain in one simple sentence what FreedomOps is."
)

print("\nAI RESPONSE:")
print(response)