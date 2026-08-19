import subprocess
import json
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEVOPS_SCRIPT = PROJECT_ROOT / "scripts" / "devops-tool.sh"


def _to_bash_path(p: Path) -> str:
    r"""
    Convert a Windows path to a Git Bash / MSYS2 compatible path.

    On Windows: C:\Users\adity\freedomops\scripts\devops-tool.sh
           →    /c/Users/adity/freedomops/scripts/devops-tool.sh

    On Linux/macOS: path is returned as-is.
    """
    if sys.platform == "win32":
        posix = p.as_posix()  # C:/Users/adity/...
        # Convert drive letter: C:/ → /mnt/c/
        if len(posix) >= 3 and posix[1] == ":" and posix[2] == "/":
            drive = posix[0].lower()
            posix = f"/mnt/{drive}/{posix[3:]}"
        return posix
    return str(p)


def run_devops_tool(tool: str, container_name: str | None = None):
    script_path = _to_bash_path(DEVOPS_SCRIPT)
    command = ["bash", script_path, tool]

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