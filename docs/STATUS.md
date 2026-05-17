# VirtualCDU Status

Last updated: 2026-05-17

This is the current source of truth for automated status. Other docs should link here instead of duplicating live test counts or build metrics.

## Automated Baseline

| Gate | Command | Current result |
| --- | --- | --- |
| TypeScript | `npm run typecheck:all` | Passing (all 3 workspaces) |
| Unit/regression tests | `npm test -- --run` | 756/756 passing (56 test files) |
| Playwright smoke E2E | `npm run test:e2e:ci` | 3/3 passing (desktop Chromium smoke gate) |
| Playwright full E2E | `npm run test:e2e` | Not currently green on this macOS checkout; see caveats |
| Production build | `npm run build` | Passing |
| Coverage | `npm run test:coverage` | 51.75% all files in last recorded run |
| Audit policy | `npm audit --audit-level=high` | Passing high/critical policy; moderate Vite/esbuild dev-dependency exception documented |
| ND visual baseline | `npm run test:e2e:visual` | 4/4 passing (Boeing MAP, Boeing MAP failure, Airbus ARC, Airbus ARC aligning) |
| PFD visual baseline | `npx playwright test e2e/visual-pfd.spec.ts --project=desktop-chromium` | 2/2 passing (Boeing automation PFD, Airbus automation PFD) |

## Current Commit

Latest reviewed base commit: `4c87e84`. PRs #1–#24 merged. Store extraction phase complete (18 action handler modules, typed LSK dispatcher). Cockpit visual regression baselines added (#23). ND symbology realism pass merged (#24) with Boeing/Airbus ND visual baselines captured and verified. The current working tree adds the first PFD realism slice and PFD visual baselines.

## Implementation State

See `docs/IMPLEMENTATION_STATUS.md` for the dispatcher milestone, cockpit visual baseline, and ND realism status.

## Next Major Work

- MCP/FCU realism with aircraft-specific hardware styling and autoflight state feeding PFD/ND cues.
- Focused-panel and tablet visual baselines for CDU/MCDU, ND, PFD, MCP/FCU, diagnostics, and failure states.
- PFD follow-up coverage for approach, focused-panel, and fail/unavailable states.
- Training scenario integration driven by real workflow state.
- Boeing workflow completion, Airbus workflow parity, navdata/LNAV/VNAV/performance realism, accessibility, PWA, and public-demo release hardening.

## Validation Caveats

- The app is a web-based procedure trainer, not a certified trainer and not approved for real-world operations.
- PMDG/MSFS live round-trip validation requires a Windows + MSFS + PMDG environment and is not proven by local macOS CI.
- Visual screenshots prove render stability only until measured against curated hardware references.
- Airbus remains secondary scope; display-only pages must stay clearly scoped in docs and UI.
- `npm run test:e2e` was attempted on 2026-05-17 and stopped after unrelated suite failures: missing local WebKit browser install for tablet/mobile projects, missing `desktop-chromium` snapshot files in broader visual suites, and legacy basic E2E selector/accessibility assertions. The verified E2E gate for this update is `npm run test:e2e:ci`.
