# VirtualCDU Status

Last updated: 2026-05-12

This is the current source of truth for automated status. Other docs should link here instead of duplicating live test counts or build metrics.

## Automated Baseline

| Gate | Command | Current result |
| --- | --- | --- |
| TypeScript | `npm run typecheck:all` | Passing |
| Unit/regression tests | `npm test -- --run` | 174/174 passing |
| Playwright E2E | `npm run test:e2e` | 15 passed, 2 skipped |
| Production build | `npm run build` | Passing (306.78KB JS, 32.42KB CSS in latest local run) |
| Coverage | `npm run test:coverage` | 51.75% all files in last recorded run |
| Audit policy | `npm audit --audit-level=high` | Passing high/critical policy; moderate Vite/esbuild dev-dependency exception documented |
| Visual baseline | `npm run capture:baseline` | Baseline capture script present; reference comparison remains a Phase 1 gate |

## Current Commit

Latest reviewed upstream commit: `138651f` (`feat: harden ND model with geometric clipping tests, PLAN review store tests, and EFIS state integration`).

## Validation Caveats

- The app is a web-based procedure trainer, not a certified trainer and not approved for real-world operations.
- PMDG/MSFS live round-trip validation requires a Windows + MSFS + PMDG environment and is not proven by local macOS CI.
- Visual screenshots prove render stability only until measured against curated hardware references.
- Airbus remains secondary scope; display-only pages must stay clearly scoped in docs and UI.
