from fastapi import FastAPI
from pydantic import BaseModel

from backend.ai.agent import understand_request, execute_tool, generate_final_response


app = FastAPI()


class ChatRequest(BaseModel):
    message: str


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "FreedomOps backend is running"
    }


@app.post("/api/chat")
def chat(request: ChatRequest):

    # Ask Qwen3 to understand the request
    ai_result = understand_request(request.message)

    print("\nAI DECISION:")
    print(ai_result)

    # Extract tool and container
    tool_name = None
    container_name = None

    for line in ai_result.splitlines():

        if line.startswith("Tool:"):
            tool_name = line.split(":", 1)[1].strip()

        if line.startswith("Container:"):
            container_name = line.split(":", 1)[1].strip()

    # Execute the selected DevOps tool
    if tool_name:
        devops_result = execute_tool(
            tool_name,
            container_name
        )
    else:
        devops_result = {
            "success": False,
            "error": {
                "type": "no_tool_selected",
                "message": "AI did not select a valid tool."
            }
        }

    print("\nDEVOPS RESULT:")
    print(devops_result)

    # Ask Qwen3 to generate the final response
    final_response = generate_final_response(
        request.message,
        devops_result
    )

    print("\nFINAL AI RESPONSE:")
    print(final_response)

    return {
        "status": "ok",
        "ai_decision": ai_result,
        "devops_result": devops_result,
        "final_response": final_response
    }