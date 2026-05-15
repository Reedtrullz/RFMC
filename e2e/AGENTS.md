# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-15
**Focus:** e2e/ (Playwright tests)

## OVERVIEW
Playwright E2E + visual regression tests.

## WHERE TO LOOK
| Test | Purpose |
|------|---------|
| `visual-boeing-cdu.spec.ts` | Boeing CDU visual regression |
| `visual-airbus-mcdu.spec.ts` | Airbus MCDU visual regression |
| `visual-navigation-display.spec.ts` | ND visual regression |
| `visual-regression.spec.ts` | General visual tests |
| `autopilot_guards.spec.ts` | Autopilot logic tests |
| `baseline-screenshots.spec.ts` | Baseline capture |

## CONVENTIONS
- `desktop-chromium` project
- Snapshots in `*/snapshots/`
- Visual diff tolerance: 0.1%

## ANTI-PATTERNS
- Modifying snapshots manually
- Skipping visual regression
- Tests without assertions