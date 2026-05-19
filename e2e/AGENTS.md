# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Focus:** e2e/ (Playwright tests)

## OVERVIEW

Playwright E2E + visual regression tests.

## WHERE TO LOOK

| Test                                | Purpose                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| `visual-boeing-cdu.spec.ts`         | Boeing CDU visual regression                                     |
| `visual-airbus-mcdu.spec.ts`        | Airbus MCDU visual regression                                    |
| `visual-navigation-display.spec.ts` | ND visual regression                                             |
| `visual-regression.spec.ts`         | General visual tests                                             |
| `autopilot_guards.spec.ts`          | Autopilot logic tests                                            |
| `baseline-screenshots.spec.ts`      | Baseline capture                                                 |
| `cockpit-layouts.spec.ts`           | Cockpit mode visual regression (Boeing + Airbus)                 |
| `cockpit-hardening.spec.ts`         | Cockpit layout hardening assertions                              |
| `helpers.ts`                        | Shared test utilities (dismissWelcome, pressCdu, lsk, enterText) |

## CONVENTIONS

- `desktop-chromium` project
- Snapshots in `*/snapshots/`
- Visual diff tolerance: 2% (maxDiffPixelRatio: 0.02)
- `@Visual Regression` test tag for grep-filtered visual tests
- `npm run test:visual` / `npm run test:visual:update` scripts

## ANTI-PATTERNS

- Modifying snapshots manually
- Skipping visual regression
- Tests without assertions
