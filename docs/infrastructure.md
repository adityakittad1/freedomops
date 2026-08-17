# FreedomOps Infrastructure

## 1. Development Environment

FreedomOps is currently being developed using:

- Fedora Linux 44
- WSL2
- x86_64 architecture
- Python 3.14.3
- Git 2.55.0
- Podman 5.8.4
- Ansible Core 2.20.7

Note: Fedora WSL2 is the current development environment.
The target project architecture is intended for Linux/RHEL-compatible infrastructure.

---

## 2. Container Platform

FreedomOps uses Podman for container management.

Demo application:

`freedomops-api`

Container image:

`localhost/freedomops-api:latest`

Application port:

`8080`

Port mapping:

`8080:8080`

---

## 3. Demo Application

The demo application is a small Python HTTP server.

Health endpoint:

`http://localhost:8080`

Expected response:

`FreedomOps API is healthy.`

---

## 4. Useful Podman Commands

Check running containers:

```bash
podman ps
