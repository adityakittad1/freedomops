#!/bin/bash

CONTAINER="freedomops-api"

echo "=================================="
echo " FreedomOps Container Processes"
echo "=================================="

if podman container exists "$CONTAINER"; then
    podman top "$CONTAINER"
else
    echo "Container $CONTAINER does not exist."
    exit 1
fi
