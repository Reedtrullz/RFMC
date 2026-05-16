# RFMC Architecture Cleanup & Realism Backlog

## TL;DR

> **Quick Summary**: 34 PR backlog to turn `useFMCStore.ts` from a monolithic FMC brain into a thin orchestrator by extracting LSK actions, canonicalizing scratchpad messages, centralizing MOD/EXEC, adding visual/workflow regression coverage, and polishing ND/PFD/MCP/FCU realism.
>
> **Key Insight**: PRs #1-7 have landed foundational work (display grid validation, scratchpad engine, EXEC helpers, cockpit layout, ND frames, LSK navigation extraction). The remaining work is extracting the remaining LSK action families and adding visual/testing coverage.
>
> **Estimated Effort**: Extra Large (34 PRs)
> **Parallel Execution**: Sequential (each PR builds on the previous)
> **Critical Path**: LSK extraction → EXEC canonicalization → scratchpad migration → visual coverage

---

## Context

### Current State
- **PR #1-6**: Merged — display grid validation, scratchpad engine, EXEC helpers, cockpit layout, ND frames
- **PR #7**: Open — LSK navigation action extraction to shared handler. Needs cleanup (unused import, duplicate case, tests)
- `useFMCStore.ts` still ~2800 lines and acts as FMC brain, cockpit orchestrator, training dispatcher, scratchpad handler, route modifier, and validation layer

### Remaining Gaps
- `scratchpadError` still set directly in many validation handlers
- `pendingRoute`/`pendingFlightPlan`/`isModified`/`execLit` still set manually
- PressLSK has 800+ lines of inline action handling
- No visual regression coverage for cockpit layouts
- ND/PFD/MCP/FCU need deeper realism passes

---

## Work Objectives

### Core Objective
Turn `useFMCStore` from a monolithic FMC brain into a thin Zustand orchestration layer by extracting all LSK action families into shared pure handlers, canonicalizing the scratchpad and EXEC lifecycle, and adding regression coverage.

### Concrete Deliverables
- 6 action handler modules extracted from `useFMCStore`
- Typed `FmcActionResult` dispatcher replacing inline LSK logic
- Canonical scratchpad engine (zero direct `scratchpadError` writes)
- Canonical MOD/EXEC lifecycle (derived `execLit`/`isModified`)
- Cockpit visual regression baselines for all modes
- ND/PFD/MCP/FCU realism improvements
- Comprehensive test coverage for all extracted handlers

### Definition of Done
- [ ] `useFMCStore.ts` is < 1000 lines (down from ~2800)
- [ ] Zero direct `scratchpadError` writes
- [ ] `execLit` and `isModified` are derived, not manually set
- [ ] All LSK action families have pure handler tests
- [ ] Cockpit visual baselines committed for all modes
- [ ] `npm run typecheck:all` passes
- [ ] `npm test -- --run` — 500+ tests pass
- [ ] `npm run build` passes

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: YES (TDD for new handlers, regression for existing)
- **Framework**: Vitest (unit) + Playwright (visual)

### QA Policy
Every extracted handler must have unit tests. Visual changes must have Playwright screenshot baselines.

---

## TODOs

- [ ] 1. **Clean up and merge PR #7** — Remove unused `LSKId`/`FMCState` import from `navigationActions.ts`, remove duplicate `atsu_msgs` case in `useFMCStore.ts` (line 827), add 7 unit tests for `resolveLskNavigation()`. Run typecheck+tests. Merge via `gh pr merge 7 --merge --delete-branch`.

  **What to do**: Edit 2 files, create 1 test file, verify, commit, merge.
  **References**: `shared/src/fmc/actionHandlers/navigationActions.ts:1`, `src/store/useFMCStore.ts:827`
  **Verification**: `npm run typecheck:all && npm test -- --run`

- [ ] 2. **Extract LSK special actions** — Move `des_now`, `step_plan`, `align_irs`, `erase`, `copy_active`, `print_msg`, `view_msg_*` out of `pressLSK` into `shared/src/fmc/actionHandlers/specialActions.ts`.

  **What to do**: Create `specialActions.ts` with `handleSpecialLskAction(action, state, scratchpad): FmcActionResult`. Replace inline switch cases in `pressLSK`. Write tests.
  **References**: `src/store/useFMCStore.ts:pressLSK` (lines 736-840)

- [ ] 3. **Extract radio tuning actions** — Move `set_vor1`, `set_vor2`, `set_adf1` into `shared/src/fmc/actionHandlers/radioActions.ts`.

  **What to do**: Create `radioActions.ts` with pure frequency validation. Use scratchpad engine for errors. Replace inline cases.
  **References**: `src/store/useFMCStore.ts` radio cases

- [ ] 4. **Extract route modification actions** — Move `set_from_to`, `set_origin`, `set_dest`, `set_flt_no`, `set_route`, `set_runway`, `set_direct_to` into `shared/src/fmc/actionHandlers/routeActions.ts`. LEGS waypoint edits into separate handler.

  **What to do**: Create `routeActions.ts`. Route modifications must use pendingRoute/pendingFlightPlan pattern. Write TDD tests.
  **Must NOT do**: Do not mutate active route before EXEC.
  **References**: `src/store/useFMCStore.ts` route-related cases

- [ ] 5. **Canonicalize EXEC lifecycle** — Stop scattering `isModified`/`execLit`/`pendingRoute`/`pendingFlightPlan`. Use `fmcModificationAdapter.ts` helpers.

  **What to do**: Add `beginModification()`, `queueRouteChange()`, `executeModification()`, `cancelModification()` helpers. Update `pressEXEC()`. Add tests for EXEC lifecycle.
  **References**: `shared/src/fmc/fmcModificationAdapter.ts`, `src/store/fmcStore.ts:pressExec()`

- [ ] 6. **Extract performance actions** — Move `set_crz_alt`, `set_cost_index`, `set_zfw`, `set_reserve`, wind entries into `shared/src/fmc/actionHandlers/performanceActions.ts`.

  **What to do**: Create performance handler. Invalid fields use scratchpad engine messages. ZFW updates suggested V-speeds through tested helper.
  **References**: `src/store/useFMCStore.ts` performance cases

- [ ] 7. **Extract takeoff actions** — Move `set_to_mode`, `set_v1`/`vr`/`v2`, `set_trim`, `set_oat`, `set_assumed_temp`, `set_wind`, flaps/CG into `shared/src/fmc/actionHandlers/takeoffActions.ts`.

  **What to do**: V-speed validation pure and tested. `V SPEEDS DELETED` uses canonical factory.
  **References**: `src/store/useFMCStore.ts` takeoff cases

- [ ] 8. **Remove direct scratchpadError writes** — Replace all `set({ scratchpadError: ... })` with `fmcPushMessage()` calls. Keep `scratchpadError` as transitional output only.

  **What to do**: Add `failWithScratchpadMessage()` helper. Migrate all validation handlers. Keep legacy field.
  **References**: `shared/src/fmc/fmcScratchpadAdapter.ts`, `src/store/useFMCStore.ts` scratchpadError patterns

- [ ] 9. **Build typed LSK dispatcher** — Create `dispatchLskAction()` replacing remaining pressLSK branching with a single dispatcher.

  **What to do**: `dispatchLskAction(input): FmcActionResult`. Store calls dispatcher and applies result. No business logic in store.
  **References**: `shared/src/fmc/actionHandlers/`

- [ ] 10. **Add cockpit visual baselines** — Playwright screenshots for Boeing and Airbus: fmc-focus, navigation, automation, approach, full-deck, free-practice, focused CDU/ND, ND unavailable. Viewports: 1920×1080, 1536×960, 1440×900, tablet.

  **What to do**: Create `e2e/visual/cockpit-layouts.spec.ts`. Capture baselines. Verify CI uploads artifacts.
  **References**: `e2e/visual/critical-screenshots.spec.ts`

- [ ] 11. **Update docs** — STATUS.md test counts, IMPLEMENTATION_STATUS.md extraction progress, ROADMAP.md PR sequence. `npm run check:status-docs` passes.

- [ ] 12. **ND symbology realism** — Boeing: MAP failure state, heading arc ticks, route magenta line, FMC L placement, ANP/RNP block, heading bug, range ring contrast. Airbus: MAP NOT AVAIL, heading scale, GPS PRIMARY, green/white/magenta conventions, constraint labels.

- [ ] 13. **PFD realism** — Attitude sphere, pitch ladder, bank scale, speed tape, altitude tape, vertical speed, FMA annunciations. Boeing vs Airbus differences.

- [ ] 14. **MCP/FCU realism** — Boeing MCP: seven-segment displays, knobs, annunciators, LNAV/VNAV/HDG/ALT states. Airbus FCU: managed/selected knobs, push/pull, AP1/AP2 states.

- [ ] 15. **Training scenarios** — Preflight FMC guide through IDENT→POS_INIT→RTE→PERF_INIT→TAKEOFF_REF. Route verification with LEGS/ND comparison. MCP/FCU mode with LNAV/VNAV. Approach setup with ND/PFD monitoring.

- [ ] 16. **Route discontinuity model** — First-class discontinuities in route model. Render Boeing/ND styles correctly. Allow clearing/connecting. Show on ND as break/gap. Block route completion.

- [ ] 17. **Navdata fixture expansion** — ENGM, ENBR, ENZV, ENVA, EKCH, ESSA, EHAM, EGLL, KJFK, KDCA, KLAX, KSEA with airports, runways, fixes, navaids, airways, SIDs, STARs, approaches.

- [ ] 18. **LNAV sequencing** — Active leg/waypoint model. Sequence by position. Stop at discontinuities. Direct-to. Feed ND and PROG page.

- [ ] 19. **VNAV vertical profile** — Parse altitude/speed constraints. Compute climb/descent feasibility. TOC/TOD. Trigger UNABLE NEXT ALT, DRAG REQUIRED, PERF/VNAV UNAVAILABLE.

- [ ] 20. **Airbus workflow parity** — INIT A/B field behavior, F-PLN modifications, TEMPY/INSERT behavior, PERF CLB/CRZ/DES/APPR, SEC F-PLN copy/activate, managed/selected terminology.

- [ ] 21. **Boeing workflow completion** — IDENT→POS_INIT→RTE→DEP/ARR→LEGS→PERF_INIT→N1 LIMIT→TAKEOFF_REF→EXEC-ready. Missing fields boxed. Invalid entries trigger messages. E2E test covers full flow.

- [ ] 22. **Cockpit layout visual QA** — Playwright assertions: full-deck has visible MCP/PFD/ND/CDU. CDU in bottom row. Help card in sidebar. Panel tray docked. PFD/ND matched pair. Layout no-clip at target viewports.

- [ ] 23. **Store split** — Move cockpit layout, autopilot, connection, training, EFIS state out of useFMCStore if duplicates exist. Use selectors for display components.

- [ ] 24. **Backend parity tests** — Feed same key/LSK sequences to frontend store and backend engine. Compare FMC state. Cover scratchpad, nav, route, performance, EXEC, errors.

- [ ] 25. **Reference library** — Boeing/Airbus CDU/MCDU, ND, PFD, MCP/FCU with measurements, screenshots, proportions, color notes, typography, realism checklist.

- [ ] 26. **Accessibility** — ARIA labels for LSKs/CDU keys. Keyboard shortcuts. Focus states. Reduced motion. High contrast validation. Touch target validation.

- [ ] 27. **Demo scenarios** — Boeing: ENGM→ENBR, EGLL→EHAM, KJFK→KDCA. Airbus: ENGM→EKCH, EHAM→EGLL. One-click loading. Deterministic fixtures. ND/PFD/FMC update together.

- [ ] 28. **Release polish** — Update README screenshots. Changelog. PWA manifest. Mobile/tablet behavior. Docker build. Full E2E. Visual suite. Performance audit. Known limitations.

---

## Execution Waves

```
Wave 1 (Finish PR #7, then LSK extraction):
├── Task 1: Clean up and merge PR #7
├── Task 2: Extract special LSK actions
├── Task 3: Extract radio actions
├── Task 4: Extract route actions
└── Task 5: Canonicalize EXEC lifecycle

Wave 2 (Complete action extraction):
├── Task 6: Extract performance actions
├── Task 7: Extract takeoff actions
├── Task 8: Remove direct scratchpadError writes
└── Task 9: Build typed LSK dispatcher

Wave 3 (Visual + testing coverage):
├── Task 10: Add cockpit visual baselines
├── Task 11: Update docs
├── Task 22: Cockpit layout visual QA
└── Task 23: Store split

Wave 4 (Instrument realism):
├── Task 12: ND symbology realism
├── Task 13: PFD realism
└── Task 14: MCP/FCU realism

Wave 5 (Workflow + navdata):
├── Task 15: Training scenarios
├── Task 16: Route discontinuity model
├── Task 17: Navdata fixture expansion
├── Task 18: LNAV sequencing
├── Task 19: VNAV vertical profile
├── Task 20: Airbus workflow parity
└── Task 21: Boeing workflow completion

Wave 6 (Polish + release):
├── Task 24: Backend parity tests
├── Task 25: Reference library
├── Task 26: Accessibility
├── Task 27: Demo scenarios
└── Task 28: Release polish
```

## Commit Strategy

Each task = one PR. PRs should be small enough to review independently.

## Success Criteria

- [ ] `useFMCStore.ts` < 1000 lines (from ~2800)
- [ ] Zero direct `scratchpadError` writes in handlers
- [ ] `execLit` + `isModified` derived from `RouteModification`
- [ ] All LSK action families have pure handler tests
- [ ] Cockpit visual baselines committed
- [ ] `npm run typecheck:all` passes
- [ ] `npm test -- --run` — 500+ tests pass
