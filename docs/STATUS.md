# VirtualCDU Status

Last updated: 2026-06-17

> **Historical evidence snapshot, not a current release/status claim.** The commands below were recorded on 2026-06-17 against a dirty working tree based on `main` at `810fc9652da431eaf8978b85bf4af131605559b5`. That work in progress was later preserved at `8f746b3be8a665e9b8653a0580d578934a451018`; no exact-tree rerun is recorded for the preservation commit.

Other docs should link here for the dated evidence snapshot rather than presenting these counts as live metrics.

Evidence scope: the commands below ran against local `main` at `810fc9652da431eaf8978b85bf4af131605559b5` (`feat(navdata): add ENVA Trondheim Vaernes airport`), Node `v22.22.3`, npm `10.9.8`. This page records command results from that historical local working tree only. It does not claim CI, deployment, physical iPad, Windows/MSFS/PMDG, pilot review, or hardware-reference validation unless that evidence is listed explicitly.

## Automated Baseline

| Gate                         | Command                                   | Local result on 2026-06-17                                                                                                                                                   |
| ---------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                   | `npm run typecheck:all`                   | Passing across `shared`, `src`, and `server`.                                                                                                                                |
| Unit/regression tests        | `npm test -- --run`                       | Passing cleanly: 69 files / 864 tests.                                                                                                                                       |
| Playwright smoke E2E         | `npm run test:e2e:ci`                     | Passing: 3 desktop Chromium smoke tests. Playwright starts RFMS on isolated strict port `127.0.0.1:5174` by default. Vite/Tailwind and Zustand deprecation warnings remain.  |
| Playwright full E2E          | `npm run test:e2e`                        | Not run in this refresh; no full-matrix pass is claimed.                                                                                                                     |
| Production build             | `npm run build`                           | Passing. Vite emitted Tailwind content-pattern, ineffective dynamic-import, chunk-size, and plugin-timing warnings.                                                          |
| Coverage                     | `npm run test:coverage`                   | Passing configured thresholds: statements 58.99%, branches 56.70%, functions 57.86%, lines 60.76%.                                                                           |
| Lint                         | `npm run lint`                            | Passing with warnings only; warnings are tracked technical debt, not a hard release blocker in the current config.                                                           |
| Format                       | `npm run format:check`                    | Passing.                                                                                                                                                                     |
| Status-doc consolidation     | `npm run check:status-docs`               | Passing.                                                                                                                                                                     |
| Audit policy                 | `npm audit --omit=dev --audit-level=high` | Passing; npm reported `found 0 vulnerabilities`.                                                                                                                             |
| Full audit check             | `npm audit --audit-level=high`            | Passing; npm reported `found 0 vulnerabilities`.                                                                                                                             |
| Visual fidelity manifest     | `npm run measure:visual`                  | Passing. Report found 367 app-owned snapshots, 4 reference entries, and 0 approved pixel-measurement references; hardware pixel accuracy remains not measured.               |
| Baseline capture script path | `npm run capture:baseline -- --list`      | Passing; the script resolves the `desktop-chromium` Playwright project and lists 2 baseline tests. Baseline capture itself was not run because it writes approval artifacts. |

## Current Commit

Latest local commit observed for this refresh: `810fc9652da431eaf8978b85bf4af131605559b5`.

The working tree contained source/test/docs edits for this hardening slice. The command results above were gathered against that dirty local tree, so they are useful local evidence but not a release certification.

## Implementation State

See `docs/IMPLEMENTATION_STATUS.md` for the dispatcher milestone, cockpit visual baseline, and ND realism status.

## Next Major Work

- Rights-cleared hardware reference intake and actual pixel/geometry measurements against those references.
- Physical iPad cockpit validation on the target device class.
- CI/deploy evidence capture with run IDs, URLs, or immutable image/commit identifiers.
- Windows + MSFS + PMDG live round-trip validation recorded in `docs/MSFS_LIVE_VALIDATION.md`.
- Expand state-aware training from cockpit help into lesson packs, scoring, debrief, and highlighted expected controls.
- Continue integrating shared LNAV/VNAV truth into ND active segment/vertical cues, direct-to workflows, and backend CONTROL-mode parity beyond the current Boeing/Airbus PROG slices.
- Integrate trainer-grade performance prediction into PERF, scratchpad messages, and training guidance.
- Boeing workflow completion, Airbus workflow parity, navdata/LNAV/VNAV/performance realism, accessibility, PWA, and public-demo release hardening.

## Validation Caveats

- The app is a web-based procedure trainer, not certified training software and not approved for real-world operations.
- Passing local gates do not imply CI, deployment, physical-device, pilot-review, or live-simulator readiness.
- Playwright local runs now use an isolated strict-port dev server by default; set `PLAYWRIGHT_BASE_URL` only when intentionally targeting an already-running RFMS instance.
- PMDG/MSFS live round-trip validation requires a Windows + MSFS + PMDG environment and was not run in this local refresh.
- Physical iPad cockpit usability, mounted-device ergonomics, touch feel, and offline startup were not validated on hardware in this refresh.
- No CI workflow run, deploy pipeline, live URL, health endpoint, TLS termination, rollback, or post-release monitor was checked in this refresh.
- Visual screenshots and the visual-fidelity manifest prove render stability and metadata completeness only; they do not prove hardware pixel accuracy until rights-cleared reference crops are approved and measured.
- Airbus remains secondary scope; display-only pages must stay clearly scoped in docs and UI.
- Playwright device profiles are automation evidence only and are not substitutes for physical-device review.
