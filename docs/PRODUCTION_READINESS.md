# Production Readiness Checklist

This document tracks the requirements for promoting RFMS to a public-facing production environment.

## 1. Security

- [x] Helmet security headers enabled
- [x] Strict Content Security Policy (CSP) enforced
- [x] Express `x-powered-by` header disabled
- [x] Request body limits enforced (10kb)
- [x] WebSocket message-size limits enforced
- [x] WebSocket strict validation enabled
- [x] WebSocket rate limiting (spam protection) enabled
- [x] Public HTTP endpoint rate limiting enabled
- [ ] TLS/SSL termination configured (via Caddy/Nginx)

## 2. Stability & Performance

- [x] Docker healthcheck implemented
- [x] Non-root user in Docker container
- [x] Structured JSON logging implemented
- [x] Core metrics tracking (active clients, errors)
- [ ] Memory and CPU limits defined in deployment
- [ ] PWA offline support verified

## 3. Deployment & Release

- [x] Release checklist established
- [x] Incident runbook created
- [ ] Rollback procedure tested
- [ ] CI/CD pipeline enforces typechecks and tests
- [ ] Deployment by commit SHA

## 4. Quality Gates

- [ ] Unit tests passing (>80% coverage)
- [ ] E2E visual regression tests passing
- [ ] iPad cockpit usability validation completed
- [ ] PMDG/Fenix live validation successful
- [ ] No high/critical security audit issues
