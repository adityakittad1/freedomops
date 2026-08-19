import subprocess
import json
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEVOPS_SCRIPT = PROJECT_ROOT / "scripts" / "devops-tool.sh"


def run_devops_tool(tool: str, container_name: str | None = None):
    command = ["bash", str(DEVOPS_SCRIPT), tool]

    if container_name:
        command.append(container_name)

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {
            "success": False,
            "error": {
                "type": "invalid_json",
                "message": result.stdout or result.stderr
            }
        }