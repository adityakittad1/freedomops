from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from backend.ai.agent import understand_request, execute_tool, generate_final_response
from backend.ai.devops_client import run_devops_tool


app = FastAPI(title="FreedomOps API", version="1.0.0")

# Allow the Vite dev server (and any local origin) to call the API.
# In production, restrict allow_origins to the actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── WRITE tools that always require explicit human approval ──────────────────
WRITE_TOOLS = {"restart_application"}


class ChatRequest(BaseModel):
    message: str


class ApproveRequest(BaseModel):
    tool: str
    container: str


@app.get("/api/health")
def health_check():
    """
    Health probe used by the frontend connection indicator.

    Returns:
      status  : "ok"
      message : human-readable description
      ollama  : bool — whether Ollama is reachable right now
      model   : str  — the configured model name (e.g. "qwen3")
    """
    from backend.ai.ollama_client import client, MODEL
    ollama_ok = False
    try:
        # Lightweight list call — does not run inference
        client.list()
        ollama_ok = True
    except Exception:
        ollama_ok = False

    return {
        "status": "ok",
        "message": "FreedomOps backend is running",
        "ollama": ollama_ok,
        "model": MODEL,
    }



@app.post("/api/chat")
def chat(request: ChatRequest):
    """
    Primary chat endpoint.

    READ tools  → execute immediately and return result.
    WRITE tools → NEVER execute here. Return approval_required so the
                  frontend can display the approval dialog. The actual
                  execution only happens through POST /api/approve.

    A direct curl request targeting restart_application will always receive
    approval_required — the container is never touched by this endpoint.
    """

    # Step 1: Ask Qwen3 to understand the intent
    ai_result = understand_request(request.message)

    print("\nAI DECISION:")
    print(ai_result)

    # Step 2: Parse the structured response from the AI
    tool_name = None
    container_name = None
    operation = None

    for line in ai_result.splitlines():
        line = line.strip()
        if line.startswith("Tool:"):
            tool_name = line.split(":", 1)[1].strip()
        elif line.startswith("Container:"):
            container_name = line.split(":", 1)[1].strip()
        elif line.startswith("Operation:"):
            operation = line.split(":", 1)[1].strip().lower()

    if not tool_name:
        return {
            "status": "error",
            "ai_decision": ai_result,
            "devops_result": None,
            "final_response": "I could not determine which DevOps tool to use for that request."
        }

    # Step 3: WRITE gate — never execute WRITE tools from /api/chat
    # This is enforced regardless of how the request is formed.
    # Even if someone crafts a curl request saying "restart", the
    # container will NOT be touched by this endpoint.
    if tool_name in WRITE_TOOLS or operation == "write":
        print(f"\nWRITE GATE: {tool_name} on {container_name} — returning approval_required")
        return {
            "status": "approval_required",
            "tool": tool_name,
            "container": container_name or "freedomops-api",
            "ai_decision": ai_result,
            "message": (
                f"Executing '{tool_name}' on '{container_name}' is a WRITE operation "
                f"and requires explicit user approval. "
                f"No changes have been made to the infrastructure."
            )
        }

    # Step 4: READ tool — execute through the DevOps router
    devops_result = execute_tool(tool_name, container_name)

    print("\nDEVOPS RESULT:")
    print(devops_result)

    # Step 5: Ask Qwen3 to generate a human-readable final response
    final_response = generate_final_response(request.message, devops_result)

    print("\nFINAL AI RESPONSE:")
    print(final_response)

    return {
        "status": "ok",
        "ai_decision": ai_result,
        "devops_result": devops_result,
        "final_response": final_response
    }


@app.post("/api/approve")
def approve(request: ApproveRequest):
    """
    Approval endpoint — the ONLY path that executes WRITE operations.

    Validates that:
    1. The requested tool is actually a WRITE tool (not an arbitrary shell call).
    2. The container is the approved FreedomOps target (enforced by the DevOps script).

    This endpoint is separate from /api/chat so that approval cannot be bypassed
    by crafting a clever chat message. The DevOps router script also independently
    validates the container name against the allowed list.
    """

    # Validate that this is a known WRITE tool — reject anything else
    if request.tool not in WRITE_TOOLS:
        raise HTTPException(
            status_code=400,
            detail=f"Tool '{request.tool}' is not a WRITE operation or is not recognized."
        )

    print(f"\nAPPROVAL CONFIRMED: executing {request.tool} on {request.container}")

    # Execute the WRITE operation through the DevOps router
    devops_result = run_devops_tool(request.tool, request.container)

    print("\nWRITE RESULT:")
    print(devops_result)

    # Run a health check after the WRITE to confirm recovery
    health_result = run_devops_tool("check_application_health", request.container)

    print("\nPOST-WRITE HEALTH:")
    print(health_result)

    return {
        "status": "ok",
        "tool": request.tool,
        "container": request.container,
        "devops_result": devops_result,
        "health_result": health_result
    }