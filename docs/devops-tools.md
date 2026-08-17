# FreedomOps DevOps Tool Registry

## Purpose

This document defines the controlled DevOps operations that the FreedomOps AI agent can request.

The AI agent must not receive unrestricted shell access.

Each operation must be explicitly defined and validated.

---

## 1. get_container_status

### Purpose

Check whether the FreedomOps application container exists and determine its current state.

### Target

`freedomops-api`

### Underlying technology

Podman

### Current implementation

`scripts/container-status.sh`

### Expected information

- Container ID
- Image
- Status
- Port mapping
- Container name

### Operation type

READ

### Risk

LOW

---

## 2. get_container_logs

### Purpose

Retrieve recent logs from the application container.

### Target

`freedomops-api`

### Underlying technology

Podman

### Current implementation

`scripts/container-logs.sh`

### Expected information

- Application startup messages
- HTTP requests
- Errors
- Runtime messages

### Operation type

READ

### Risk

LOW

---

## 3. check_application_health

### Purpose

Verify whether the application is responding to HTTP requests.

### Target

`http://localhost:8080`

### Current implementation

`scripts/health-check.sh`

### Expected result

Healthy:

`FreedomOps API is healthy.`

Unhealthy:

HTTP request fails.

### Operation type

READ

### Risk

LOW

---

## 4. get_container_stats

### Purpose

Collect resource usage information from the application container.

### Target

`freedomops-api`

### Underlying technology

Podman

### Current implementation

`scripts/container-stats.sh`

### Metrics

- CPU
- Memory
- Memory percentage
- Network I/O
- Block I/O
- PIDs

### Operation type

READ

### Risk

LOW

---

## 5. get_container_processes

### Purpose

Inspect processes running inside the application container.

### Target

`freedomops-api`

### Underlying technology

Podman

### Current implementation

`scripts/container-processes.sh`

### Operation type

READ

### Risk

LOW

---

## 6. restart_application

### Purpose

Recover the application when the container is stopped.

### Target

`freedomops-api`

### Current implementation

`scripts/restart-application.sh`

### Workflow

1. Inspect container state.
2. Determine whether the container is running.
3. Start the container if required.
4. Wait for startup.
5. Perform HTTP health verification.
6. Report success or failure.

### Operation type

WRITE

### Risk

MEDIUM

### Approval

The final FreedomOps architecture should require user approval before executing this operation when initiated by the AI agent.

---

# Safety Rules

The FreedomOps AI agent must NOT:

- Execute arbitrary shell commands.
- Modify arbitrary files.
- Delete containers without explicit authorization.
- Delete images.
- Execute unrestricted `sudo`.
- Execute arbitrary Ansible commands.
- Perform destructive infrastructure operations automatically.

The AI agent should only invoke explicitly registered tools.

---

# Current Tool Set

| Tool | Type | Risk |
|---|---|---|
| get_container_status | READ | LOW |
| get_container_logs | READ | LOW |
| check_application_health | READ | LOW |
| get_container_stats | READ | LOW |
| get_container_processes | READ | LOW |
| restart_application | WRITE | MEDIUM |

---

# Intended AI Flow

User request:

"My application is down."

↓

AI agent

↓

get_container_status

↓

get_container_logs

↓

check_application_health

↓

AI diagnosis

↓

If remediation is required:

restart_application

↓

check_application_health

↓

Return result to user
