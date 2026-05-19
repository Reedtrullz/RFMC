# Release Checklist

Follow these steps for every production release.

## 1. Development & Quality

- [ ] Release branch or focused commit merged to `main`.
- [ ] `npm run typecheck:all` passes.
- [ ] `npm test -- --run` passes.
- [ ] `npm run build` passes.
- [ ] `npm run check:status-docs` passes.
- [ ] `npm run test:e2e:ci` passes.
- [ ] Broader `npm run test:e2e` result is recorded in `docs/STATUS.md`, including any local browser/runtime caveats.
- [ ] Visual regression baselines approved (`npm run capture:baseline` if changed).
- [ ] `npm run measure:visual` passes and the report does not overstate hardware accuracy.
- [ ] No new `TODO` or `FIXME` items introduced without tracking.

## 2. Security Audit

- [ ] `npm audit` reviewed (no High/Critical).
- [ ] New WebSocket messages added to `websocketValidation.ts`.
- [ ] No sensitive keys committed.

## 3. Documentation

- [ ] `CHANGELOG.md` updated.
- [ ] `docs/STATUS.md` updated with current command evidence.
- [ ] `docs/IMPLEMENTATION_STATUS.md` updated.
- [ ] `docs/KNOWN_LIMITATIONS.md` reviewed.
- [ ] `docs/wiki/` source pages are current for public-facing changes.
- [ ] MSFS/PMDG claims are backed by `docs/MSFS_LIVE_VALIDATION.md` evidence or clearly labeled unverified.

## 4. Build & Deployment

- [ ] Docker build successful: `docker build -t rfms:latest .`
- [ ] Container starts locally and `/health` returns `ok`.
- [ ] Version and Commit SHA correctly displayed in `/health`.
- [ ] Deployment references an immutable commit SHA or image digest.
- [ ] Rollback command and previous known-good SHA are recorded.
- [ ] TLS termination, memory limits, and CPU limits are configured or explicitly deferred.

## 5. Post-Release

- [ ] Verify live application at the production URL.
- [ ] Check logs for unexpected errors during the first 10 minutes.
- [ ] Confirm PWA update prompt and offline startup on at least one installed-browser profile.
- [ ] Confirm iPad cockpit layout manually when the release changes layout/PWA behavior.
- [ ] Announce release to the test group.
