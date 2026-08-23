# Production Readiness Checklist

This document tracks the requirements for promoting RFMS to a public-facing production environment.

Current status: not production-ready as of the 2026-06-17 local evidence refresh. Local typecheck, unit/regression, coverage, build, audit, status-doc, format, smoke E2E, and visual-manifest checks passed, but full Playwright matrix, CI/deploy, physical iPad, rights-cleared reference measurement, and Windows/MSFS/PMDG validation were not checked.

## 1. Security

- [x] Helmet security headers enabled
- [x] Strict Content Security Policy (CSP) enforced
- [x] Express `x-powered-by` header disabled
- [x] Request body limits enforced (10kb)
- [x] WebSocket message-size limits enforced
- [x] WebSocket strict validation enabled
- [x] WebSocket rate limiting (spam protection) enabled
- [x] Public HTTP endpoint rate limiting enabled
- [x] Local high/critical audit policy passed on 2026-06-17 (`npm audit --audit-level=high`, `found 0 vulnerabilities`)
- [ ] TLS/SSL termination configured (via Caddy/Nginx)

## 2. Stability & Performance

- [x] Docker healthcheck implemented
- [x] Non-root user in Docker container
- [x] Structured JSON logging implemented
- [x] Core metrics tracking (active clients, errors)
- [ ] Memory and CPU limits defined in deployment
- [ ] PWA offline support verified on a deployed or installed target
- [ ] Physical iPad cockpit usability validation completed

## 3. Deployment & Release

- [x] Release checklist established
- [x] Incident runbook created
- [ ] Rollback procedure tested
- [ ] CI/CD pipeline run checked for this release candidate
- [ ] Deployment by commit SHA
- [ ] Live deployment health check recorded

## 4. Quality Gates

- [x] Local TypeScript gate passing (`npm run typecheck:all`)
- [x] Local production build passing (`npm run build`)
- [x] Local visual-manifest gate passing (`npm run measure:visual`)
- [x] Unit/regression gate cleanly passing (`npm test -- --run`, 69 files / 864 tests on 2026-06-17)
- [x] Coverage result refreshed (`npm run test:coverage`, configured thresholds passed on 2026-06-17)
- [x] Desktop Chromium smoke E2E passing (`npm run test:e2e:ci`, 3 smoke tests on 2026-06-17)
- [ ] Full E2E/visual regression gates passing for the release scope
- [ ] iPad cockpit usability validation completed
- [ ] Rights-cleared hardware references approved and measured
- [ ] Windows/MSFS/PMDG live validation successful
- [x] No high/critical security audit issues in local npm audit checks

## Non-claims

- Local command success does not imply CI success or deployment success.
- Mock adapter, WebSocket, and local browser evidence do not prove Windows/MSFS/PMDG live round trips.
- Playwright device profiles do not prove physical iPad cockpit usability.
- Snapshot and manifest evidence does not prove hardware pixel accuracy until rights-cleared reference crops are approved and measured.
