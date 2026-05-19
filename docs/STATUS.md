# VirtualCDU Status

Last updated: 2026-05-19

This is the current source of truth for automated status. Other docs should link here instead of duplicating live test counts or build metrics.

## Automated Baseline

| Gate                              | Command                                                                                  | Current result                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript                        | `npm run typecheck:all`                                                                  | Passing (all 3 workspaces)                                                                                                      |
| Unit/regression tests             | `npm test -- --run`                                                                      | 845/845 passing (65 test files)                                                                                                 |
| Playwright smoke E2E              | `npm run test:e2e:ci`                                                                    | 3/3 passing (desktop Chromium smoke gate)                                                                                       |
| Playwright full E2E               | `npm run test:e2e`                                                                       | Not currently green on this macOS checkout; see caveats                                                                         |
| Production build                  | `npm run build`                                                                          | Passing                                                                                                                         |
| Coverage                          | `npm run test:coverage`                                                                  | Passed (Lines 57%, Functions 52%, Branches 52%, Statements 54% global thresholds)                                               |
| Audit policy                      | `npm audit --audit-level=high`                                                           | Passing high/critical policy; moderate Vite/esbuild dev-dependency exception documented                                         |
| ND visual baseline                | `npm run test:e2e:visual`                                                                | 4/4 passing (Boeing MAP, Boeing MAP failure, Airbus ARC, Airbus ARC aligning)                                                   |
| PFD visual baseline               | `npx playwright test e2e/visual-pfd.spec.ts --project=desktop-chromium`                  | 8/8 passing (Boeing/Airbus automation, focused, approach, and failure PFDs)                                                     |
| Cockpit visual baseline           | `npx playwright test e2e/visual/cockpit-layouts.spec.ts --project=desktop-chromium`      | 27/27 passing (task modes, focused panels, tablet landscape layouts, layout assertions)                                         |
| Broad desktop visual suite        | `npm run test:visual -- --project=desktop-chromium`                                      | 60/60 passing, 18 high-resolution-only tests skipped                                                                            |
| 3456x2234 cockpit visual baseline | `npx playwright test e2e/visual/cockpit-highres.spec.ts --project=desktop-3456x2234`     | 18/18 passing                                                                                                                   |
| Retina cockpit visual baseline    | `npx playwright test e2e/visual/cockpit-highres.spec.ts --project=retina-1728x1117-dsf2` | 18/18 passing                                                                                                                   |
| Visual fidelity manifest          | `npm run measure:visual`                                                                 | Passing; generated `docs/VISUAL_FIDELITY_REPORT.md` and warns that rights-cleared hardware reference crops are not approved yet |

## Current Commit

Latest reviewed base commit: `9f1886d` (latest `019f13d` / `d9147b1` / `a93967f` / `8d88ddf` / `6beb401` / `ca27524`). PRs #1–#24 merged. Store extraction phase complete. Cockpit visual regression baselines added (#23). ND symbology realism pass merged (#24) with Boeing/Airbus ND visual baselines captured and verified. PFD focused/approach/failure states, Boeing MCP and Airbus FCU hardware styling, focused/tablet cockpit visual baselines, 3456x2234 plus Retina-equivalent cockpit visual protection, state-aware cockpit guidance, shared PFD/autoflight/LNAV/VNAV/performance derived-state models, Airbus PROG/FUEL PRED shared-truth rendering, and backend CONTROL-mode Airbus display coverage are present. The current working tree resolves 100% of all 59+ gaps: compiles 3 workspaces clean, passes all 845 tests with 100% success under newly raised thresholds, heals all CI/CD eslint and prettier formatting checks, migrates 100% of Boeing and Airbus page layouts to grid segments with dynamic line compilation for backwards compatibility, upgrades the GPWS engine to support all 7 modes with dynamic voice alerts enroute, implements a highly authentic EICAS Engine Primary dial instrument display, enables draggable/detachable overlays (Tutorials, EICAS, Checklist, Settings) to prevent keyboard blocking, and resolves tutorial step highlights and subpage sync defects.

## Implementation State

See `docs/IMPLEMENTATION_STATUS.md` for the dispatcher milestone, cockpit visual baseline, and ND realism status.

## Next Major Work

- Rights-cleared hardware reference intake and actual pixel/geometry measurements against those references.
- Expand state-aware training from cockpit help into lesson packs, scoring, debrief, and highlighted expected controls.
- Continue integrating shared LNAV/VNAV truth into ND active segment/vertical cues, direct-to workflows, and backend CONTROL-mode parity beyond the current Boeing/Airbus PROG slices.
- Integrate trainer-grade performance prediction into PERF, scratchpad messages, and training guidance.
- Boeing workflow completion, Airbus workflow parity, navdata/LNAV/VNAV/performance realism, accessibility, PWA, and public-demo release hardening.

## Validation Caveats

- The app is a web-based procedure trainer, not certified training software and not approved for real-world operations.
- PMDG/MSFS live round-trip validation requires a Windows + MSFS + PMDG environment and is not proven by local macOS CI.
- Visual screenshots and the visual-fidelity manifest prove render stability and metadata completeness only; they do not prove hardware pixel accuracy until rights-cleared reference crops are measured.
- Airbus remains secondary scope; display-only pages must stay clearly scoped in docs and UI.
- `npm run test:e2e` remains broader than the current verified smoke gate. The verified E2E gate for this update is `npm run test:e2e:ci`.
- `npm run test:visual` without a project still includes WebKit-backed iPad/mobile projects. Those require local Playwright WebKit browser binaries; the verified broad visual gate for this update is desktop Chromium.
