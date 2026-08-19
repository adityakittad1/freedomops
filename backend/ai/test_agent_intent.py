from backend.ai.agent import understand_request, execute_tool


user_request = "Show me the status of freedomops-api."

ai_result = understand_request(user_request)

print("AI DECISION:")
print(ai_result)


tool_name = None
container_name = None

for line in ai_result.splitlines():
    if line.startswith("Tool:"):
        tool_name = line.split(":", 1)[1].strip()

    if line.startswith("Container:"):
        container_name = line.split(":", 1)[1].strip()


if tool_name:
    result = execute_tool(tool_name, container_name)

    print("\nDEVOPS RESULT:")
    print(result)
else:
    print("\nNo valid tool was selected.")