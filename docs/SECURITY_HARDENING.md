# Security Hardening Checklist

Production hardening work should be tracked here until it becomes enforced CI or runtime behavior.

## WebSocket And API Boundary

- Use TLS/WSS for any remote telemetry path. This remains a deployment requirement.
- Validate WebSocket `Origin` against an allowlist. Implemented through `WS_ALLOWED_ORIGINS`.
- Authenticate sockets and authorize each command action. Not implemented yet; required before any public multi-user telemetry endpoint.
- Validate incoming messages against a strict schema. Basic runtime validation is implemented for known message types.
- Cap control-plane message size. Implemented through `WS_MAX_MESSAGE_BYTES`, defaulting to 64 KB.
- Reject unknown message types. Implemented and covered by bridge-server tests.
- Keep heartbeat, idle timeout, reconnect, and backpressure behavior tested. Heartbeat/reconnect are covered; deeper backpressure tests remain future work.
- Log validation and auth failures without recording secrets or full sensitive payloads.

## Provider Secrets

- Store navdata and dispatch provider secrets server-side.
- Do not expose provider secrets through Vite client environment variables.
- Keep dev, staging, and production callback URLs and credentials separate.

## CI And Release

- Require secret scanning and dependency review before release.
- Keep high/critical runtime vulnerabilities blocking.
- Document rollback commands and public health checks for every deployment target.
