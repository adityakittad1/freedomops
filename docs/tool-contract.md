# FreedomOps DevOps Tool Contract

## Purpose

This document defines the controlled DevOps operations available
to the FreedomOps AI agent.

The AI agent must not execute arbitrary shell commands.

It may only request operations defined in this contract.

---

# Tool Categories

## Read-Only Tools

These tools inspect infrastructure and do not intentionally modify
infrastructure state.

1. get_container_status
2. get_container_logs
3. get_container_stats
4. get_container_processes
5. check_application_health
6. diagnose_application

## Write Tools

These tools can modify infrastructure state.

1. restart_application

Write operations require additional validation.

---

# 1. get_container_status

Implementation:

    scripts/container-status.sh

Purpose:

Check whether the FreedomOps application container exists and
inspect its current Podman status.

Input:

    container_name

Current MVP container:

    freedomops-api

Underlying operation:

    podman container exists
    podman ps -a

Risk:

    READ_ONLY

Possible states:

    running
    exited
    created
    stopped
    missing

Expected result:

    container name
    container ID
    image
    status
    ports

---

# 2. get_container_logs

Implementation:

    scripts/container-logs.sh

Purpose:

Retrieve recent application logs.

Input:

    container_name
    optional number of lines

Current implementation:

    50 lines

Underlying operation:

    podman logs

Risk:

    READ_ONLY

Expected result:

    recent container logs

Used for:

    error detection
    warning detection
    application troubleshooting

---

# 3. get_container_stats

Implementation:

    scripts/container-stats.sh

Purpose:

Retrieve container resource usage.

Input:

    container_name

Underlying operation:

    podman stats --no-stream

Risk:

    READ_ONLY

Expected result:

    CPU usage
    memory usage
    memory percentage
    network I/O
    block I/O
    process count

---

# 4. get_container_processes

Implementation:

    scripts/container-processes.sh

Purpose:

Inspect processes running inside the container.

Input:

    container_name

Underlying operation:

    podman top

Risk:

    READ_ONLY

Expected result:

    user
    PID
    PPID
    CPU
    elapsed time
    command

---

# 5. check_application_health

Implementation:

    scripts/health-check.sh

Purpose:

Check whether the FreedomOps application HTTP endpoint is
responding successfully.

Input:

    health_url

Current MVP URL:

    http://localhost:8080

Underlying operation:

    curl -fsS

Risk:

    READ_ONLY

Expected result:

    healthy
    unhealthy

A successful HTTP response should be treated as healthy.

A failed request should be treated as unhealthy.

---

# 6. diagnose_application

Implementation:

    scripts/diagnose-app.sh

Purpose:

Collect multiple infrastructure signals to help determine
why the application is unhealthy.

Input:

    container_name
    health_url

Current MVP values:

    container_name = freedomops-api
    health_url = http://localhost:8080

Operations performed:

    1. Container status
    2. Container processes
    3. Resource metrics
    4. Recent logs
    5. Application health

Risk:

    READ_ONLY

Expected result:

    combined diagnostic evidence

Important:

The diagnostic tool collects evidence.

It does not independently decide the final root cause.

The AI agent may reason over the collected evidence.

---

# 7. restart_application

Implementation:

    scripts/restart-application.sh

Preferred automation path:

    Ansible recovery playbook

    infrastructure/ansible/playbooks/recover-app.yml

Purpose:

Recover the FreedomOps application when the container is not
running.

Input:

    container_name

Current MVP container:

    freedomops-api

Operation:

    inspect current state
    start container when required
    wait for startup
    verify application health

Risk:

    WRITE

Expected result:

    previous state
    recovery action
    final state
    health result
    success / failure

Approval:

    Recommended before AI-triggered execution.

The AI must not claim recovery succeeded unless the tool
returns a successful health verification.

---

# Tool Safety Rules

## Rule 1

The AI agent must not execute arbitrary shell commands.

## Rule 2

Only registered tools may be invoked.

## Rule 3

Read-only tools must not intentionally modify infrastructure.

## Rule 4

Write operations require validation.

## Rule 5

Container names must be validated against approved resources.

## Rule 6

Tool execution errors must be returned to the AI agent.

## Rule 7

The AI must not claim an action succeeded without receiving
a successful result from the tool.

## Rule 8

Diagnostic evidence and AI conclusions must remain separate.

## Rule 9

Recovery should verify application health after the action.

## Rule 10

The tool layer should follow least-privilege principles.

---

# FreedomOps Diagnostic Flow

User request:

    "Why is my application down?"

Expected investigation:

    get_container_status
            ↓
    get_container_logs
            ↓
    get_container_processes
            ↓
    get_container_stats
            ↓
    check_application_health
            ↓
    diagnose_application
            ↓
    AI analyzes evidence
            ↓
    AI explains diagnosis

If recovery is appropriate:

    AI proposes recovery
            ↓
    User approval
            ↓
    restart_application
            ↓
    health verification
            ↓
    AI reports result
