# VirtualCDU Status

Last updated: 2026-05-16

This is the current source of truth for automated status. Other docs should link here instead of duplicating live test counts or build metrics.

## Automated Baseline

| Gate | Command | Current result |
| --- | --- | --- |
| TypeScript | `npm run typecheck:all` | Passing (all 3 workspaces) |
| Unit/regression tests | `npm test -- --run` | 752/752 passing (55 test files) |
| Playwright E2E | `npm run test:e2e` | 35 passed, 2 skipped |
| Production build | `npm run build` | Passing |
| Coverage | `npm run test:coverage` | 51.75% all files in last recorded run |
| Audit policy | `npm audit --audit-level=high` | Passing high/critical policy; moderate Vite/esbuild dev-dependency exception documented |
| Visual baseline | `npm run capture:baseline` | Baseline capture script present; reference comparison implemented via display grid validation |

## Current Commit

Latest reviewed local commit: `ca0c7cb`. PRs #1–#21 merged. Store extraction phase complete (18 action handler modules, typed LSK dispatcher).

## Implementation State

See `docs/IMPLEMENTATION_STATUS.md` for the dispatcher milestone and Phase 1 hardening status.

## Validation Caveats

- The app is a web-based procedure trainer, not a certified trainer and not approved for real-world operations.
- PMDG/MSFS live round-trip validation requires a Windows + MSFS + PMDG environment and is not proven by local macOS CI.
- Visual screenshots prove render stability only until measured against curated hardware references.
- Airbus remains secondary scope; display-only pages must stay clearly scoped in docs and UI.
