#!/bin/bash

set -u

if [ "$#" -lt 1 ]; then
    echo "ERROR: FreedomOps tool name is required."
    echo
    echo "Usage:"
    echo "  $0 <tool> [container_name]"
    echo
    echo "Available tools:"
    echo "  get_container_status"
    echo "  get_container_logs"
    echo "  get_container_stats"
    echo "  get_container_processes"
    echo "  check_application_health"
    echo "  diagnose_application"
    echo "  restart_application"
    exit 1
fi

TOOL="$1"
CONTAINER="${2:-freedomops-api}"

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$TOOL" in

get_container_status)
    if ! "$BASE_DIR/validate-tool-input.sh" "$CONTAINER" >/dev/null; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_status",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "validation_error",\n'
        printf '    "message": "Container is not an approved FreedomOps resource."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    STATUS=$(podman inspect "$CONTAINER" --format '{{.State.Status}}' 2>/dev/null)

    if [ -z "$STATUS" ]; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_status",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "container_error",\n'
        printf '    "message": "Unable to inspect container."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "get_container_status",\n'
    printf '  "container": "%s",\n' "$CONTAINER"
    printf '  "data": {\n'
    printf '    "status": "%s"\n' "$STATUS"
    printf '  },\n'
    printf '  "error": null\n'
    printf '}\n'
    ;;    

get_container_logs)
    if ! "$BASE_DIR/validate-tool-input.sh" "$CONTAINER" >/dev/null 2>/dev/null; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_logs",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "validation_error",\n'
        printf '    "message": "Container is not an approved FreedomOps resource."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    LOGS=$(podman logs --tail 50 "$CONTAINER" 2>&1)

    if [ -z "$LOGS" ]; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_logs",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "log_error",\n'
        printf '    "message": "No logs were returned from the container."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    LOG_JSON=$(printf '%s\n' "$LOGS" | python3 -c '
import sys
import json

lines = sys.stdin.read().splitlines()
print(json.dumps(lines))
')

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "get_container_logs",\n'
    printf '  "container": "%s",\n' "$CONTAINER"
    printf '  "data": {\n'
    printf '    "lines": %s\n' "$LOG_JSON"
    printf '  },\n'
    printf '  "error": null\n'
    printf '}\n'
    ;;    

get_container_stats)
    if ! "$BASE_DIR/validate-tool-input.sh" "$CONTAINER" >/dev/null 2>/dev/null; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_stats",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "validation_error",\n'
        printf '    "message": "Container is not an approved FreedomOps resource."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    METRICS=$(podman stats --no-stream --format \
        'CPU={{.CPUPerc}}|MEMORY={{.MemUsage}}|MEMORY_PERCENT={{.MemPerc}}|NETWORK={{.NetIO}}|BLOCK_IO={{.BlockIO}}|PIDS={{.PIDS}}' \
        "$CONTAINER" 2>/dev/null)

    if [ -z "$METRICS" ]; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_stats",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "metrics_error",\n'
        printf '    "message": "Unable to retrieve container metrics. Container may not be running."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    CPU=$(echo "$METRICS" | sed 's/.*CPU=\([^|]*\).*/\1/')
    MEMORY=$(echo "$METRICS" | sed 's/.*MEMORY=\([^|]*\).*/\1/')
    MEMORY_PERCENT=$(echo "$METRICS" | sed 's/.*MEMORY_PERCENT=\([^|]*\).*/\1/')
    NETWORK=$(echo "$METRICS" | sed 's/.*NETWORK=\([^|]*\).*/\1/')
    BLOCK_IO=$(echo "$METRICS" | sed 's/.*BLOCK_IO=\([^|]*\).*/\1/')
    PIDS=$(echo "$METRICS" | sed 's/.*PIDS=\([^|]*\).*/\1/')

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "get_container_stats",\n'
    printf '  "container": "%s",\n' "$CONTAINER"
    printf '  "data": {\n'
    printf '    "cpu": "%s",\n' "$CPU"
    printf '    "memory": "%s",\n' "$MEMORY"
    printf '    "memory_percent": "%s",\n' "$MEMORY_PERCENT"
    printf '    "network": "%s",\n' "$NETWORK"
    printf '    "block_io": "%s",\n' "$BLOCK_IO"
    printf '    "pids": "%s"\n' "$PIDS"
    printf '  },\n'
    printf '  "error": null\n'
    printf '}\n'
    ;;    

get_container_processes)
    if ! "$BASE_DIR/validate-tool-input.sh" "$CONTAINER" >/dev/null 2>/dev/null; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_processes",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "validation_error",\n'
        printf '    "message": "Container is not an approved FreedomOps resource."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    PROCESSES=$(podman top "$CONTAINER" 2>/dev/null)

    if [ -z "$PROCESSES" ]; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "get_container_processes",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "process_error",\n'
        printf '    "message": "Unable to retrieve container processes. Container may not be running."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    PROCESS_COUNT=$(printf '%s\n' "$PROCESSES" | tail -n +2 | wc -l | tr -d ' ')

    PROCESS_JSON=$(printf '%s\n' "$PROCESSES" | python3 -c '
import sys
import json

lines = sys.stdin.read().splitlines()

if not lines:
    print("[]")
else:
    print(json.dumps(lines))
')

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "get_container_processes",\n'
    printf '  "container": "%s",\n' "$CONTAINER"
    printf '  "data": {\n'
    printf '    "process_count": %s,\n' "$PROCESS_COUNT"
    printf '    "processes": %s\n' "$PROCESS_JSON"
    printf '  },\n'
    printf '  "error": null\n'
    printf '}\n'
    ;;    

    check_application_health)
    if "$BASE_DIR/health-check.sh" >/tmp/freedomops-health-output.txt 2>&1; then
        RESPONSE=$(cat /tmp/freedomops-health-output.txt)

        printf '{\n'
        printf '  "success": true,\n'
        printf '  "tool": "check_application_health",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": {\n'
        printf '    "status": "healthy",\n'
        printf '    "response": "%s"\n' "$(printf '%s' "$RESPONSE" | tail -1)"
        printf '  },\n'
        printf '  "error": null\n'
        printf '}\n'
    else
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "check_application_health",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "health_check_failed",\n'
        printf '    "message": "Application health check failed."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi
    ;;
diagnose_application)
    if ! "$BASE_DIR/validate-tool-input.sh" "$CONTAINER" >/dev/null 2>/dev/null; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "diagnose_application",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "validation_error",\n'
        printf '    "message": "Container is not an approved FreedomOps resource."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    STATUS=$(podman inspect "$CONTAINER" \
        --format '{{.State.Status}}' 2>/dev/null || true)

    PROCESSES=$(podman top "$CONTAINER" 2>/dev/null || true)

    METRICS=$(podman stats --no-stream \
        --format 'CPU={{.CPUPerc}}|MEMORY={{.MemUsage}}|MEMORY_PERCENT={{.MemPerc}}|NETWORK={{.NetIO}}|BLOCK_IO={{.BlockIO}}|PIDS={{.PIDS}}' \
        "$CONTAINER" 2>/dev/null || true)

    LOGS=$(podman logs --tail 20 "$CONTAINER" 2>&1 || true)

    if curl -fsS http://127.0.0.1:8080 >/tmp/freedomops-diagnosis-health.txt 2>/dev/null; then
        HEALTH_STATUS="healthy"
        HEALTH_RESPONSE=$(cat /tmp/freedomops-diagnosis-health.txt)
    else
        HEALTH_STATUS="unhealthy"
        HEALTH_RESPONSE="Application is not responding."
    fi

    PROCESSES_JSON=$(printf '%s\n' "$PROCESSES" | python3 -c '
import sys
import json
print(json.dumps(sys.stdin.read().splitlines()))
')

    LOGS_JSON=$(printf '%s\n' "$LOGS" | python3 -c '
import sys
import json
print(json.dumps(sys.stdin.read().splitlines()))
')

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "diagnose_application",\n'
    printf '  "container": "%s",\n' "$CONTAINER"
    printf '  "data": {\n'
    printf '    "container_status": "%s",\n' "$STATUS"
    printf '    "processes": %s,\n' "$PROCESSES_JSON"
    printf '    "metrics": "%s",\n' "$METRICS"
    printf '    "logs": %s,\n' "$LOGS_JSON"
    printf '    "health": {\n'
    printf '      "status": "%s",\n' "$HEALTH_STATUS"
    printf '      "response": "%s"\n' "$HEALTH_RESPONSE"
    printf '    }\n'
    printf '  },\n'
    printf '  "error": null\n'
    printf '}\n'
    ;;    

restart_application)
    if ! "$BASE_DIR/validate-tool-input.sh" "$CONTAINER" >/dev/null 2>/dev/null; then
        printf '{\n'
        printf '  "success": false,\n'
        printf '  "tool": "restart_application",\n'
        printf '  "container": "%s",\n' "$CONTAINER"
        printf '  "operation": "write",\n'
        printf '  "data": null,\n'
        printf '  "error": {\n'
        printf '    "type": "validation_error",\n'
        printf '    "message": "Container is not an approved FreedomOps resource."\n'
        printf '  }\n'
        printf '}\n'
        exit 1
    fi

    podman restart "$CONTAINER" >/dev/null 2>&1
    sleep 2

    STATUS=$(podman inspect "$CONTAINER" \
        --format '{{.State.Status}}' 2>/dev/null || true)

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "restart_application",\n'
    printf '  "container": "%s",\n' "$CONTAINER"
    printf '  "operation": "write",\n'
    printf '  "data": {\n'
    printf '    "current_status": "%s",\n' "$STATUS"
    printf '    "action": "restarted"\n'
    printf '  },\n'
    printf '  "error": null\n'
    printf '}\n'
    ;;    

    *)
        echo "ERROR: Unknown FreedomOps tool: $TOOL"
        echo
        echo "Available tools:"
        echo "  get_container_status"
        echo "  get_container_logs"
        echo "  get_container_stats"
        echo "  get_container_processes"
        echo "  check_application_health"
        echo "  diagnose_application"
        echo "  restart_application"
        exit 1
        ;;

esac
