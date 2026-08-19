from backend.ai.ollama_client import ask_ollama
from backend.ai.devops_client import run_devops_tool


ALLOWED_TOOLS = {
    "get_container_status",
    "get_container_logs",
    "get_container_stats",
    "get_container_processes",
    "check_application_health",
    "diagnose_application",
    "restart_application",
}


def understand_request(user_message: str) -> str:
    prompt = f"""
You are the AI agent of FreedomOps.

Your job is to understand the user's DevOps request.

User request:
{user_message}

Identify:
1. What the user wants
2. Whether it is a read or write operation
3. Which FreedomOps tool should be used
4. Which container is involved

Available FreedomOps tools:

READ:
- get_container_status
- get_container_logs
- get_container_stats
- get_container_processes
- check_application_health
- diagnose_application

WRITE:
- restart_application
Tool selection rules:

- If the user asks for the status, state, or running state of a container, use get_container_status.
- If the user asks for application health or a health check, use check_application_health.
- If the user asks for logs, use get_container_logs.
- If the user asks for CPU, memory, statistics, or resource usage, use get_container_stats.
- If the user asks for processes, use get_container_processes.
- If the user asks to diagnose a problem, use diagnose_application.
- If the user asks to restart an application, use restart_application.

IMPORTANT:
If the user says "status of <container>" or "is <container> running", ALWAYS select get_container_status.




You MUST choose exactly one tool from the list above.

Do NOT answer with Docker, Kubernetes, shell commands, or any other tool name.

If the user mentions a specific container name, identify it.
If no container name is mentioned, use: freedomops-api

Return your answer clearly in this format:

Intent: <intent>
Operation: <read/write>
Tool: <tool_name>
Container: <container_name>
"""

    return ask_ollama(prompt)


def execute_tool(tool_name: str, container_name: str | None = None):
    if tool_name not in ALLOWED_TOOLS:
        return {
            "success": False,
            "error": {
                "type": "unauthorized_tool",
                "message": f"Tool '{tool_name}' is not allowed."
            }
        }

    return run_devops_tool(tool_name, container_name)
def generate_final_response(user_message: str, devops_result: dict) -> str:
    prompt = f"""
You are the FreedomOps AI agent.

The user asked:
{user_message}

The DevOps tool was executed and returned this result:
{devops_result}

Give the user a short, clear final answer based ONLY on the DevOps result.

Do not invent information.
Do not mention internal implementation details.
If the operation succeeded, clearly tell the user the result.
If the operation failed, clearly explain the error.
"""

    return ask_ollama(prompt)