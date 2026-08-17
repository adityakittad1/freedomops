#!/bin/bash

CONTAINER="freedomops-api"

echo "=================================="
echo " FreedomOps Container Metrics"
echo "=================================="

podman stats --no-stream --format "Container: {{.Name}}
CPU: {{.CPUPerc}}
Memory: {{.MemUsage}}
Memory %: {{.MemPerc}}
Network: {{.NetIO}}
Block I/O: {{.BlockIO}}
PIDs: {{.PIDS}}" "$CONTAINER"
