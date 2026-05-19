# VirtualCDU Metrics

This file records measured baselines and phase gates. Do not present estimated scores as factual results unless the measurement method and evidence are recorded here.

Current pass/fail counts and build/audit status live in `docs/STATUS.md`.

## Baseline Commands

| Metric                   | Command or method          | Current result source                                     |
| ------------------------ | -------------------------- | --------------------------------------------------------- |
| TypeScript               | `npm run typecheck:all`    | `docs/STATUS.md`                                          |
| Unit tests               | `npm test -- --run`        | `docs/STATUS.md`                                          |
| E2E tests                | `npm run test:e2e`         | `docs/STATUS.md`                                          |
| Build                    | `npm run build`            | `docs/STATUS.md`                                          |
| Audit                    | `npm audit`                | `docs/STATUS.md`                                          |
| Baseline screenshots     | `npm run capture:baseline` | Script added; run output is under Playwright test-results |
| Visual-fidelity manifest | `npm run measure:visual`   | `docs/VISUAL_FIDELITY_REPORT.md`                          |

## Visual Measurement Method

| Measurement                 | Method                                                                                                                     | Target                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Character-position variance | Normalize reference and app screenshots to the display region, detect 24x14 cell grid, compare row/column anchor positions | <= 4% Phase 1, <= 3% end-state                              |
| Color accuracy              | Sample calibrated regions for Boeing white/cyan/green/magenta/shaded and compute CIELAB Delta E against reference set      | <= 4 Phase 1, <= 3 end-state                                |
| Pixel regression            | Playwright screenshots against app-owned baselines with reviewed tolerances                                                | 0 critical regressions                                      |
| Visual-fidelity manifest    | Validate reference metadata, measurement profile presence, and app-owned snapshot coverage                                 | Passing gate before hardware-measurement claims             |
| Semantic sampling           | Rendered display rows expose `data-semantic` for title/label/active-data/etc. sampling                                     | Available in app DOM                                        |
| iPad FPS                    | Browser performance trace or in-app FPS metric during keypress and page animations                                         | >= 55 fps                                                   |
| Keypress latency            | Timestamp key press to display update in standalone and CONTROL/mock connected modes                                       | Document baseline; target < 80 ms connected display latency |

## Procedure And Training Metrics

| Measurement                                                |             Target |
| ---------------------------------------------------------- | -----------------: |
| Common pilot entry errors with correct scratchpad response |     >= 90% Phase 2 |
| Boeing standard operation match by pilot matrix            |   >= 95% end-state |
| SimBrief fixture route loading                             |             >= 90% |
| Full preflight tutorial completion without external help   |             >= 85% |
| User confidence gain after tutorial                        |     >= +1.5 points |
| Pilot usefulness rating                                    | >= 4.5/5 end-state |

## External Validation Gates

These cannot be completed by local macOS automation alone:

- Pilot/instructor review sessions.
- Live Windows + MSFS + PMDG round-trip validation.
- iPad physical-device FPS and cockpit-mount usability review.
- Licensing review for fonts, imagery, and navdata.
