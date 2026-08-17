#!/bin/bash

set -e

echo "=================================="
echo " FreedomOps Failure Simulation"
echo "=================================="

echo "Stopping freedomops-api..."

podman kill freedomops-api

echo
echo "Application intentionally stopped."
echo "Run 'podman ps -a' to inspect the failure."
