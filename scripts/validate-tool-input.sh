#!/bin/bash

ALLOWED_CONTAINER="freedomops-api"

validate_container() {
    local container="$1"

    if [ -z "$container" ]; then
        echo "ERROR: container name is required." >&2
        return 1
    fi

    if [ "$container" != "$ALLOWED_CONTAINER" ]; then
        echo "ERROR: container '$container' is not an approved FreedomOps resource." >&2
        return 1
    fi

    echo "OK: container '$container' is approved."
    return 0
}

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <container_name>" >&2
    exit 1
fi

validate_container "$1"
