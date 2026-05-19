# VirtualCDU Test Matrix

Status source: `docs/STATUS.md`.

## Automated Gates

| Gate                              | Command                        | Current status       | Required status              |
| --------------------------------- | ------------------------------ | -------------------- | ---------------------------- |
| Shared/frontend/server TypeScript | `npm run typecheck:all`        | See `docs/STATUS.md` | 0 errors                     |
| Unit/regression tests             | `npm test -- --run`            | See `docs/STATUS.md` | 100% pass                    |
| Playwright E2E                    | `npm run test:e2e`             | See `docs/STATUS.md` | 100% pass for runnable tests |
| Production build                  | `npm run build`                | See `docs/STATUS.md` | Successful build             |
| Audit policy                      | `npm audit --audit-level=high` | See `docs/STATUS.md` | No high/critical issues      |

## Major Flow Coverage

| Area                              | Scenario                                                                         | Automated                  | Manual/live                   | Notes                                                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- | -------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Boeing startup                    | IDENT renders and POS INIT navigation works                                      | Yes                        | Optional                      | Covered by Playwright smoke and preflight flow                                                             |
| Boeing preflight                  | IDENT -> POS INIT -> RTE -> LEGS -> DEP/ARR -> PERF -> THRUST LIM -> TAKEOFF REF | Yes                        | Pilot review required         | Current flow is trainer-level, not pilot-validated                                                         |
| Boeing DEP/ARR                    | SID, runway, STAR, approach entries                                              | Yes                        | Pilot review required         | Uses current mock procedure data                                                                           |
| Boeing approach reference         | TAKEOFF REF page 2 landing runway, flaps, VREF, ILS frequency, course            | Yes unit                   | Pilot review required         | Trainer reference data only; not navdata-backed tuning                                                     |
| Boeing LEGS                       | Route parsing, insert/delete, discontinuity replacement, constraints             | Partial                    | Required                      | Add deeper EXEC staging cases                                                                              |
| Boeing HOLD                       | Staged edits, route-context validation, and EXEC commit                          | Yes unit                   | Required                      | Add Playwright flow                                                                                        |
| Boeing FIX                        | Two FIX entries with radial/distance validation                                  | Yes unit                   | Pilot review required         | Trainer-level two-slot implementation                                                                      |
| ND route context                  | Route points, direct-to active leg, discontinuities, constraints, procedures     | Yes                        | Pilot review required         | Training visualization, not measured avionics fidelity                                                     |
| ND overlays                       | Multiple FIX radial/distance rings and HOLD racetrack preview                    | Yes                        | Pilot review required         | Uses current trainer state only                                                                            |
| PFD/MCP/FCU visuals               | Boeing/Airbus PFD states and autoflight panels                                   | Yes visual                 | Pilot review required         | Snapshot-protected, not hardware-measured                                                                  |
| High-resolution cockpit           | 3456x2234 and Retina-equivalent task/focused layouts                             | Yes visual                 | Device review optional        | Protects large-screen composition only                                                                     |
| ND controls/iPad                  | MAP/PLAN, range, overlay toggles, mobile ND toggle                               | Yes                        | iPad device review required   | Keep CDU controls unobstructed                                                                             |
| Boeing CLB/CRZ/DES                | Static pages render                                                              | Partial                    | Required                      | Add DES NOW and trainer-level prediction tests                                                             |
| Airbus INIT/F-PLN/DEP-ARR/PERF TO | Main data-entry flow                                                             | Yes                        | Pilot review required         | Secondary pages still scoped/display-only                                                                  |
| Airbus secondary pages            | PERF APPR, FUEL PRED, SEC F-PLN, RAD NAV, DATA INDEX                             | Partial                    | Required                      | Each visible LSK must work or be disabled                                                                  |
| SimBrief import                   | Mocked import loads origin/destination/route                                     | Yes                        | Required with real plans      | Expand to 20 fixtures                                                                                      |
| CONTROL mode                      | Backend-authoritative page/input parity                                          | Mock WebSocket bridge test | Live PMDG required            | Mock adapter verifies connect/input/display/key forwarding                                                 |
| MSFS PMDG                         | Keypress -> CDU update -> display readback                                       | No                         | Required on Windows/MSFS/PMDG | Cannot be validated on this macOS workspace                                                                |
| PWA/iPad                          | Offline refresh, mounted cockpit layout, safe areas                              | Partial                    | Required on iPad              | Update prompt and portrait fallback are automated; real offline startup remains production/iPad validation |
| Visual baseline                   | Snapshot suites, high-res layouts, and baseline capture                          | Scripted                   | Reference comparison required | `npm run capture:baseline` plus `npm run measure:visual`                                                   |

## Coverage Targets

| Subsystem                  | Target |
| -------------------------- | -----: |
| `shared/src/fmc/` logic    | >= 85% |
| Frontend store actions     | >= 80% |
| `server/src/fmc-engine.ts` | >= 85% |
| Page renderers             | >= 90% |
| Adapter mocks              | >= 75% |

## CI Gate Policy

Every PR should pass:

- `npm run typecheck:all`
- `npm test -- --run`
- `npm run test:e2e`
- `npm run build`
- `npm run check:status-docs`
- `npm run measure:visual` for visual/public-demo slices
- `npm run test:coverage` once thresholds are enforced
- Visual baseline/snapshot checks for pages touched by the PR
- Audit policy review for dependency changes

The GitHub Actions workflow in `.github/workflows/ci.yml` runs these gates with `AIRCRAFT_ADAPTER=mock` so CI does not depend on Windows/MSFS/PMDG.
