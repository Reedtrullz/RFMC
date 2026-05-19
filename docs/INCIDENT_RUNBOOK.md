# Incident Runbook

This document provides procedures for handling common production issues.

## 1. Application is Offline (5xx Errors)

- **Check**: Is the container running? (`docker ps`)
- **Check**: Is the healthcheck failing? (`docker inspect <id>`)
- **Action**: Check logs for crash reports: `docker logs <id> | grep error`
- **Action**: Restart container.
- **Action**: If persistent, rollback to previous commit SHA.

## 2. WebSocket Connection Failures

- **Check**: Is the client origin allowed? (Verify `WS_ALLOWED_ORIGINS`).
- **Check**: Are logs showing `ws_validation_error`?
- **Action**: Ensure the client version matches the server's expected message schema.
- **Action**: Check if the reverse proxy is correctly upgrading the connection to WebSocket.

## 3. MSFS / SimConnect Connection Issues

- **Check**: `/health` shows `connectionStatus: ERROR`.
- **Check**: Logs for `sim_error`.
- **Action**: Ensure the bridge server has network access to the MSFS machine.
- **Action**: Verify the aircraft adapter is correctly configured for the target aircraft.

## 4. High Error Rate in Logs

- **Check**: Search logs for `event: "ws_validation_error"`.
- **Cause**: Could be an old client or a malicious actor.
- **Action**: If from a single IP, consider blocking at the firewall or reverse proxy.

## 5. Deployment Hangs

- **Check**: Is the build failing?
- **Check**: Is the healthcheck taking too long to pass?
- **Action**: Verify `START_PERIOD` in Dockerfile.
- **Action**: Ensure the environment variables are correctly populated in the CI/CD pipeline.
