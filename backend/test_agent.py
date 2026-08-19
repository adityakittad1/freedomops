from backend.ai.agent import understand_request


request = "Show me the running containers."

result = understand_request(request)

print("\nAI AGENT RESULT:")
print(result)