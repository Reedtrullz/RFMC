# Release Checklist

Follow these steps for every production release.

## 1. Development & Quality
- [ ] Feature branch merged to `master`.
- [ ] `npm run typecheck:all` passes.
- [ ] `npm run test` (Vitest) passes.
- [ ] `npm run test:e2e` (Playwright) passes.
- [ ] Visual regression baselines approved (`npm run capture:baseline` if changed).
- [ ] No new `TODO` or `FIXME` items introduced without tracking.

## 2. Security Audit
- [ ] `npm audit` reviewed (no High/Critical).
- [ ] New WebSocket messages added to `websocketValidation.ts`.
- [ ] No sensitive keys committed.

## 3. Documentation
- [ ] `CHANGELOG.md` updated.
- [ ] `docs/IMPLEMENTATION_STATUS.md` updated.
- [ ] `docs/KNOWN_LIMITATIONS.md` reviewed.

## 4. Build & Deployment
- [ ] Docker build successful: `docker build -t rfms:latest .`
- [ ] Container starts locally and `/health` returns `ok`.
- [ ] Version and Commit SHA correctly displayed in `/health`.

## 5. Post-Release
- [ ] Verify live application at the production URL.
- [ ] Check logs for unexpected errors during the first 10 minutes.
- [ ] Announce release to the test group.
