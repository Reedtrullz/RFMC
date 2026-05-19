# Deployment Guide

RFMS is deployed as a Dockerized application. We prioritize safety and zero-downtime releases.

## 1. Environment Configuration

The following environment variables are required:

- `NODE_ENV`: Set to `production`.
- `PORT`: Server port (default 8080).
- `WS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins for WebSockets.
- `APP_VERSION`: Current version string.
- `COMMIT_SHA`: Full git commit hash.

## 2. Deployment Process

We use a "Pull-based" or "Push-to-Deploy" model (e.g., Coolify, Portainer, or GitHub Actions).

### Safety Steps

1. **Pre-flight**: CI must pass all tests and typechecks.
2. **Build**: Build image with `COMMIT_SHA` as a tag.
3. **Smoke Test**: Deploy to staging first and run E2E tests.
4. **Production**: Deploy with a health-aware rolling update.

## 3. Rolling Updates & Health Checks

The Docker image includes a healthcheck:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

The deployment orchestrator should:

- Start the new container.
- Wait for it to become healthy.
- Stop the old container only after the new one is healthy.

## 4. Rollback Procedure

If a deployment fails or a regression is found:

1. **Command**: Revert to the previous image tag (commit SHA).
2. **Verification**: Confirm health via `/health` endpoint.
3. **Logs**: Check structured logs for `SIM_ERROR` or `WS_VALIDATION_ERROR`.

## 5. Monitoring

- **Logs**: Production logs are in JSON format.
- **Metrics**: Visit `/health` to see active client counts and error rates.
