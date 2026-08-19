from backend.ai.devops_client import run_devops_tool


result = run_devops_tool(
    "get_container_status",
    "freedomops-api"
)

print(result)