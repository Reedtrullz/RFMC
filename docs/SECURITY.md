# Security Policy

RFMS is designed to be a secure, stable trainer. This document outlines our security architecture and hardening measures.

## 1. Network Security

- **TLS/SSL**: All production traffic must be served over HTTPS/WSS. This is typically handled by a reverse proxy (e.g., Caddy, Nginx).
- **CORS/Origin Validation**: WebSocket connections are validated against the `WS_ALLOWED_ORIGINS` environment variable.
- **CSP**: Content Security Policy is enforced via Helmet to prevent XSS and data injection.
- **Rate Limiting**: Public API endpoints are limited to 100 requests per 15 minutes per IP. WebSockets have a separate rate limit (10 msgs/sec).

## 2. Payload Protection

- **Body Limits**: JSON payloads are capped at 10kb to prevent DoS attacks via large objects.
- **WebSocket Schema**: All incoming messages are validated against a strict schema in `websocketValidation.ts`. Malformed or unknown messages are dropped immediately.
- **Sanitized Errors**: Error responses are sanitized to avoid leaking server internals.

## 3. Container Security

- **Non-Root Execution**: The application runs as the `node` user, not `root`.
- **Minimal Image**: We use `alpine` based images to reduce the attack surface.
- **Read-Only Filesystem**: (Future work) Aiming for a read-only root filesystem in production.

## 4. Secret Management

- **Environment Variables**: Secrets (like SimBrief API keys) must be provided via environment variables and never committed to the repository.
- **CI Scanning**: GitHub Advanced Security is used to scan for secrets in the codebase.

## 5. Reporting Vulnerabilities

Please report security issues via GitHub Issues or contact the maintainers directly.
