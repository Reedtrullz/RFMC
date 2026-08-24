# Deployment Guide

RFMS is deployed as a Dockerized application. We prioritize safety and zero-downtime releases.

## 1. Environment Configuration

The following environment variables are required:

- `NODE_ENV`: Set to `production`.
- `PORT`: Server port (default 8080).
- `WS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins for WebSockets.
- `APP_VERSION`: Server package version, baked into the image by Ansible.
- `COMMIT_SHA`: Full CI-tested git commit, baked into the image by Ansible.
- `IMAGE_ID`: Exact local Docker image ID, injected when the container starts.
- `IMAGE_REF`: Immutable local `virtual-cdu:sha-<full-commit>` image reference.

## 2. Deployment Process

GitHub Actions deploys the exact successful `main` CI commit with Ansible. Ansible checks out that commit, builds an immutable local SHA-tagged image, validates a canary on loopback port 8083, and only then replaces production on loopback port 8082.

### Safety Steps

1. **Pre-flight**: CI must pass all tests and typechecks.
2. **Build**: Build `virtual-cdu:sha-<full-commit>` with the package version and commit embedded.
3. **Smoke Test**: Start the same image as a canary and require `/health` to attest the expected commit, image ID, and image reference.
4. **Production**: Replace production only after the canary passes, then verify the production `/health` identity again.

SHA-tagged local images are not pruned by the current playbook. Add a bounded cleanup policy separately, retaining at least the active and previous rollback images; this deployment change makes no cleanup claim.

## 3. Rolling Updates & Health Checks

The Docker image includes a healthcheck:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

The deployment orchestrator should:

- Start the new image as `virtual-cdu_canary` without touching production.
- Wait for it to become healthy and attest its exact build identity.
- Stop the old container only after the new one is healthy.
- Start production from the already-validated image and verify its identity.

## 4. Rollback Procedure

If a deployment fails or a regression is found:

1. **Command**: Revert to the previous image tag (commit SHA).
2. **Verification**: Confirm health via `/health` endpoint.
3. **Logs**: Check structured logs for `SIM_ERROR` or `WS_VALIDATION_ERROR`.

Promotion failures automatically attempt to restore the exact previous Docker image and verify basic health. This is fast recovery, not zero downtime: the container replacement still creates a brief interruption window.

## 5. Monitoring

- **Logs**: Production logs are in JSON format.
- **Metrics**: Visit `/health` to see active client counts, error rates, and exact runtime build identity.

## 6. Reverse Proxy Trust Boundary

Caddy is the single trusted proxy hop. It connects from the VPS host to the Docker container through the loopback-published port. Express and WebSocket connection limiting use the same one-hop trust function, so arbitrary left-most `X-Forwarded-For` values are not trusted.

Cloudflare is upstream of Caddy. The repository-managed Caddy block does not trust or preserve upstream proxy chains, so rate limiting may group traffic by Cloudflare edge address rather than end-user address. This is intentionally fail-closed against spoofed forwarded headers; changing it requires an origin-access policy plus an explicit trusted-Cloudflare configuration.
