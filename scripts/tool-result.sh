#!/bin/bash

tool_result_success() {
    local tool="$1"
    local message="$2"

    printf '{\n'
    printf '  "success": true,\n'
    printf '  "tool": "%s",\n' "$tool"
    printf '  "message": "%s"\n' "$message"
    printf '}\n'
}

tool_result_failure() {
    local tool="$1"
    local message="$2"

    printf '{\n'
    printf '  "success": false,\n'
    printf '  "tool": "%s",\n' "$tool"
    printf '  "message": "%s"\n' "$message"
    printf '}\n'
}
