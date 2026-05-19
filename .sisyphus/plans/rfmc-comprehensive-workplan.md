# Comprehensive RFMC Gap Remediation & Discovery Workplan

**Status:** Draft  
**Generated:** 2026-05-19  
**Scope:** Full codebase — shared, src, server, e2e, docs, CI, infra  
**Previous Work:** e9e9b93 — eliminated all `as any`, added GPWS/TCAS tests, fixed production bugs

---

## How This Plan Works

Each item has a **priority**:

- **P0** — Safety/type-safety critical, blocks correctness or causes crashes
- **P1** — Structural debt, missing coverage on core logic, performance
- **P2** — Notable gaps, architectural cleanup
- **P3** — Nice-to-have, aviation fidelity, polish, infrastructure

**New findings from this discovery round are marked [NEW].**

---

## Wave 0: Quick Wins (Fix First — Before Major Work)

These are small fixes that unblock everything else and clean up immediate noise.

| #        | Item                                                                                    | Effort | Files                                                                                                                  |
| -------- | --------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| **0-01** | Fix failing test: gpwsTcasEngine.test.ts:367 expects 10 but engine correctly returns 50 | 5min   | `shared/src/__tests__/gpwsTcasEngine.test.ts`                                                                          |
| **0-02** | Guard `window` store leaks with `import.meta.env.DEV` (2 locations)                     | 2h     | `src/store/useFMCStore.ts`, `src/store/cockpitLayoutStore.ts`                                                          |
| **0-03** | Replace 7 `console.*` calls with `devLog`/`devError`/`devWarn`                          | 1h     | `src/store/useFMCStore.ts`, `src/App.tsx`, `src/utils/tactile.ts`, `src/components/instruments/common/AvionicsKey.tsx` |
| **0-04** | Remove unused `aircraft` import in useCDUKeyboard                                       | 5min   | `src/hooks/useCDUKeyboard.ts`                                                                                          |
| **0-05** | Fix empty `.catch(() => {})` blocking error visibility                                  | 15min  | `src/store/useFMCStore.ts` (lines 811, 814)                                                                            |
| **0-06** | Add `.catch()` to unhandled `aircraft.disconnect()` promise                             | 15min  | `server/src/bridge-server.ts` (lines 356-358)                                                                          |

---

## Wave 1: P0 — Type Safety Criticals & Crash Prevention

### [P0-01] Isolated Error Boundaries — [NEW]

Single `<ErrorBoundary>` wraps entire app; any component crash = white screen.

- **Fix:** Wrap `<CDU />`, `<NavigationDisplay />`, `<PrimaryFlightDisplay />`, `<TrainingOverlay />`, `<CockpitLayout />` each in their own `<ErrorBoundary>` in `App.tsx`
- **Effort:** 1 day
- **Files:** `src/App.tsx`, `src/components/ErrorBoundary.tsx`

### [P0-02] Training pipeline entirely `any`-typed

- **Fix:** Define `TutorialStep`, `Scenario`, `TrainingGoal` interfaces; replace all `any` with proper types
- **Effort:** 1 day
- **Files:** `shared/src/fmc/tutorialEngine.ts`, `src/store/useFMCStore.ts` (6 fields), `src/components/Training/FmsInspector.tsx` (8 selectors)

### [P0-03] ND layers accept `any[]` props — [NEW]

- **Fix:** Define typed prop interfaces for TCAS, VerticalProfile, and WXR overlays
- **Effort:** 2h
- **Files:** `TCASOverlay.tsx`, `VerticalProfileOverlay.tsx`, `WXROverlay.tsx`

### [P0-04] EFIS mode `any` parameter — [NEW]

- **Fix:** Define `EFISMode` union type
- **Effort:** 1h
- **Files:** `src/store/cockpitLayoutStore.ts`

### [P0-05] WebSocketClient connection race condition — [NEW]

Multiple concurrent connections possible when `connect()` called during `CONNECTING` state.

- **Fix:** Guard against both `CONNECTING` and `OPEN` states before creating new connection
- **Effort:** 30min
- **Files:** `src/services/WebSocketClient.ts`

### [P0-06] Missing ping-pong heartbeat (zombie connections) — [NEW]

Server broadcasts heartbeat but doesn't detect dead clients; zombie connections accumulate.

- **Fix:** Use `ws` ping-pong protocol, terminate unresponsive clients
- **Effort:** 2h
- **Files:** `server/src/bridge-server.ts`

### [P0-07] Missing setTimeout cleanup in PushPullRotary — [NEW]

Timer on mouse/touch press can fire on unmounted component.

- **Fix:** Add `useEffect` cleanup for `timerRef.current`
- **Effort:** 15min
- **Files:** `src/components/instruments/common/PushPullRotary.tsx`

### [P0-08] Aviation safety: ZFW has no physical bounds — [NEW]

Zero Fuel Weight accepts absurd values (e.g., 999,000 lbs), feeds incorrect data to PerformanceEngine.

- **Fix:** Add B737-800 weight bounds validation (80-140k lbs)
- **Effort:** 30min
- **Files:** `shared/src/fmc/actionHandlers/performanceActions.ts`

### [P0-09] Aviation safety: altitude validation allows FL500 — [NEW]

`isValidAltitude` accepts up to 50,000ft; 737 ceiling is FL410.

- **Fix:** Restrict max to 410 (FL410) for Boeing
- **Effort:** 15min
- **Files:** `shared/src/fmc/validation.ts`

### [P0-10] Rate limiting bypass via reconnection — [NEW]

Rate limiter is per-socket; attacker can reconnect to get fresh budget.

- **Fix:** Track rate by client IP/connection fingerprint server-wide
- **Effort:** 4h
- **Files:** `server/src/bridge-server.ts`

### [P0-11] No server authentication — [NEW]

Anyone who can connect to the port can control the FMC and simulator bridge.

- **Fix:** Add token-based auth for WebSocket connections
- **Effort:** 1 day
- **Files:** `server/src/bridge-server.ts`, `server/src/security.ts`

---

## Wave 2: P1 — Structural Debt, Performance & Test Coverage

### [P1-01] Zustand selector optimization (4 issues) — [NEW]

- **Issues:**
  1. `FMA.tsx` subscribes to entire stores: `useAutopilotStore(s => s)` + `useFMCStore(s => s)` — re-renders on ANY change
  2. `NDControls.tsx` uses `useFMCStore()` — subscribes to entire store
  3. `FmsInspector.tsx` casts full store: `useFMCStore(s => s as unknown as FMCState)`
  4. `Display.tsx`, `Boeing737CDU.tsx`, `AirbusMCDU.tsx` call `useFMCStore(s => s.getDisplayData())` — always new object ref
- **Fix:** Narrow selectors to specific fields; compute display data from primitives with `shallow`
- **Effort:** 1-2 days
- **Files:** `FMA.tsx`, `NDControls.tsx`, `FmsInspector.tsx`, `Boeing737CDU.tsx`, `AirbusMCDU.tsx`, `Display.tsx`

### [P1-02] Expensive operations without useMemo — [NEW]

- **Issues:**
  1. `WaypointSymbol.tsx` — ETA Date objects created per waypoint on every render
  2. `AirportSymbol.tsx` — filter/map over raw airports on every render
  3. `CDUDisplayGrid.tsx` — `buildCells(grid)` runs on every render (336 cells rebuilt)
- **Fix:** Wrap calculations in `useMemo` with proper dependencies
- **Effort:** 4h
- **Files:** `WaypointSymbol.tsx`, `AirportSymbol.tsx`, `CDUDisplayGrid.tsx`

### [P1-03] 9 index-as-React-key instances in ND layers — [NEW]

- **Files:** `WaypointSymbol.tsx:107`, `RangeRings.tsx:24`, `FixRing.tsx:32`, `WXROverlay.tsx:60`, `DebriefOverlay.tsx:56`, `VerticalProfileOverlay.tsx:7`, `MCPKnob.tsx:37`, `InstrumentShell.tsx:71`, `KeyboardHelpOverlay.tsx:64`
- **Fix:** Use stable unique identifiers as keys instead of array index
- **Effort:** 2h

### [P1-04] Inline function props in MCP/FCU — [NEW]

- Boeing MCP and Airbus FCU create new callback closures on every render (17+ instances)
- **Fix:** Use `useCallback` wrappers or dispatch-by-token pattern
- **Effort:** 1 day
- **Files:** `BoeingMCP.tsx`, `AirbusFCU.tsx`, `MCPSwitch.tsx`

### [P1-05] Code splitting — React.lazy for heavy panels — [NEW]

- **Fix:** Wrap `FmsInspector`, `TrainingOverlay`, `AutopilotTrainer`, and alternate cockpit modes in `React.lazy` + `<Suspense>`
- **Effort:** 4h
- **Files:** `src/App.tsx`

### [P1-06] 53 untested shared source files

- **Critical untested:** LegSequencer, FmsRuntimeEngine, VerticalProfileEngine, PerformanceEngine, NavDatabaseService, ScenarioEngine, LegTypeEngine, fmsNavigation, waypointParser, keyProcessor, MessageService
- **Effort:** 3-5 days
- **Files:** `shared/src/fmc/` (13 modules)

### [P1-07] Frontend component test gap — 95% of UI has zero tests

- **Fix:** Smoke tests for all 12 hooks, all 7 stores (6 have zero), critical components (CDU, ND, MCP, PFD, CockpitMode)
- **Effort:** 3-5 days

### [P1-08] 4 untested server modules

- **Files:** `server/src/security.ts`, `logging.ts`, `metrics.ts`, `websocketValidation.ts`
- **Effort:** 1 day

### [P1-09] TCAS threat progression tests missing — [NEW]

- Zero tests for distance-based alert escalation (PROXIMITY → TA → RA), coordinate offsets, vertical rate convergence
- **Effort:** 1 day
- **Files:** `shared/src/__tests__/gpwsTcasEngine.test.ts`

### [P1-10] Cross-mode alert priority tests missing — [NEW]

- No test verifying high-priority alert (WINDSHEAR/PULL_UP) overrides suppressed low-priority alert
- **Effort:** 4h
- **Files:** `shared/src/__tests__/gpwsTcasEngine.test.ts`

### [P1-11] No ESLint/Prettier

- **Fix:** Add ESLint + Prettier + lint/format scripts + CI gate
- **Effort:** 1-2 days

---

## Wave 3: P2 — Architecture Cleanup & Robustness

### [P2-01] Circular dependency resolution (4 cycles) — [NEW]

1. `types/fmc.ts` ↔ `displaySemantics.ts` — move generic types into `types/fmc.ts`
2. `types/fmc.ts` ↔ `ndTypes.ts` — same approach
3. `types/fmc.ts` ↔ training modules — extract type-only references
4. `airbus/index.ts` ↔ `atsu.ts` — extract formatting helpers to dedicated file

- **Effort:** 1-2 days

### [P2-02] Dead code removal — [NEW]

- **Dead functions:** `renderIdentPage`, `renderPosInitPage`, `renderTakeoffRefPage` (setup.ts), `renderRtePage` (route.ts), `modData` (navigation.ts)
- **Dead re-exports:** 6 action handler families + 2 validator functions in `shared/src/index.ts` — no consumers
- **Effort:** 4h
- **Files:** `setup.ts`, `route.ts`, `navigation.ts`, `shared/src/index.ts`

### [P2-03] Barrel export violations — [NEW]

- `src/store/useFMCStore.ts` imports from `@shared` barrel instead of specific subpaths (lines 2, 3, 15, 34)
- `airbus/atsu.ts` imports formatting helpers from `airbus/index.ts` barrel
- **Effort:** 2h

### [P2-04] Legacy Airbus pages — 14 `render*` functions with grid equivalents

- `airbus/index.ts` has 14 legacy render functions; all have grid equivalents
- **Effort:** 1-2 days

### [P2-05] Legacy Boeing pages not grid-migrated

- `climb.ts`, `cruise.ts`, `descent.ts`, `direct.ts`, `n1limit.ts` use old `fmt()`/`inverse()` style
- **Effort:** 1 day

### [P2-06] Origin validation bypass for non-browser clients — [NEW]

- `isOriginAllowed()` returns `true` when origin is `undefined` (missing header)
- **Effort:** 1h
- **Files:** `server/src/bridge-server.ts`

### [P2-07] Missing loading/empty/error states across UI

- Zero components handle loading, empty, or error display states
- **Effort:** 2-3 days

### [P2-08] Accessibility gap — 80%+ components lack ARIA attributes

- **Effort:** 3-5 days

### [P2-09] High-frequency inline styles — AttitudeSphere — [NEW]

- Dynamic transform values created per-render (pitch, bank); should use CSS custom properties or direct DOM refs
- **Effort:** 2h
- **Files:** `AttitudeSphere.tsx`

### [P2-10] DisplayCell inline grid styles — [NEW]

- Hundreds of cells each get new style object per render; grid coordinates are static
- **Effort:** 2h
- **Files:** `DisplayCell.tsx`

### [P2-11] CI only tests desktop-chromium — [NEW]

- iPad/Retina viewports defined in `playwright.config.ts` but never executed in CI
- **Effort:** 2h
- **Files:** `.github/workflows/ci.yml`

### [P2-12] CI missing: lint, bundle size, coverage threshold — [NEW]

- No ESLint/Prettier step, no `bundlesize` check, no coverage threshold enforcement
- **Effort:** 1 day
- **Files:** `.github/workflows/ci.yml`, `vitest.config.ts`, `package.json`

### [P2-13] API rate limiter only on `/api/` routes — [NEW]

- Root `/` and static assets un-throttled
- **Effort:** 30min
- **Files:** `server/src/security.ts`

### [P2-14] No Nginx reverse proxy — [NEW]

- Node.js serves static assets directly; no HTTP/2, Brotli, or efficient rate limiting
- **Effort:** 1 day
- **Files:** `Dockerfile`, new `nginx.conf`

### [P2-15] No container resource limits — [NEW]

- Dockerfile doesn't specify CPU/memory constraints; no docker-compose.yml
- **Effort:** 2h
- **Files:** New `docker-compose.yml`

---

## Wave 4: P3 — Aviation Fidelity & Polish

### [P3-01] Missing GPWS modes (1, 2, 4, 5, 7)

- Mode 1 (excessive descent), Mode 2 (terrain closure), Mode 4 (terrain clearance), Mode 5 (glideslope), Mode 7 (windshear)
- **Effort:** 2-3 days

### [P3-02] PhaseManager approach detection incomplete

- Relies solely on altitude+speed thresholds; real FMS uses approach activation, localizer/GS capture
- **Effort:** 1 day

### [P3-03] EICASPanel is a stub

- **Effort:** 3-5 days (or mark out-of-scope)

### [P3-04] PWA manifest missing shortcuts + install screenshots

- **Effort:** 2h

### [P3-05] No `SIGHUP` handler in server

- **Effort:** 30min

### [P3-06] Coverage threshold at 50% allows gaps

- **Effort:** 15min (config change, after test gaps filled)

### [P3-07] navDataLoader minor: `as NavStoreName` cast + redundant `getNavDb()` on checkpoint

- **Effort:** 2h

### [P3-08] AttitudeSphere direct DOM optimization — [NEW]

- Consider ref-based transform updates for 60fps animation instead of React state-driven re-renders
- **Effort:** 4h

### [P3-09] PWA service worker audit — [NEW]

- Registration lifecycle, cache strategy, offline fallback, cache invalidation
- **Effort:** 1 day

---

## Wave 5: Ongoing Discovery

The following areas need periodic re-audit as the codebase evolves:

### Discovery Area A: Performance Regression Testing

- Monitor for new full-store subscriptions being added
- Track CDU render performance (scanline GPU cost)
- Monitor ND SVG reconciliation cost
- Watch for new inline closure patterns in frequently-rendered components

### Discovery Area B: New Dependency Audit

- Check for dependency bloat in each PR adding new packages
- Verify no duplicate dependencies across workspaces
- Run `npm audit` and `npm outdated` in CI

### Discovery Area C: Import Cycle Detection

- Add `madge --circular` to CI to catch new circular deps
- Enforce no-barrel-exports rule via automated check

### Discovery Area D: WebSocket Protocol Evolution

- As new message types are added, verify rate limiting covers them
- Ensure new handlers have proper error propagation
- Keep auth token mechanism aligned with any new client types

### Discovery Area E: Test Coverage Trending

- Track shared/ source file coverage per-module
- Prioritize testing untested modules before adding new features
- Raise coverage threshold toward 70% as gaps fill

### Discovery Area F: State Management Growth

- Monitor `useFMCStore.ts` line count — prevent re-bloating
- Verify new features don't add broad Zustand subscriptions
- Consider extracting training state into separate store

### Discovery Area G: iOS/PWA Compatibility

- Test on iPad Safari with each major release
- Verify touch targets, safe areas, notch handling
- Test offline mode with IndexedDB data survival

---

## Execution Strategy

### Parallelization Plan

```
Wave 0 (Quick Wins — all parallel):
├── Fix failing test assertion
├── Guard window store leaks
├── Replace console.* → devLog
├── Remove unused import
├── Fix empty catch blocks
├── Add .catch() to disconnect promise

Wave 1 (P0 — safety/crash, 2-3 day parallel batches):
├── Batch A: Error Boundaries + Training pipeline typing + ND layer types + EFIS mode type
├── Batch B: WebSocket race fix + ping-pong + PushPullRotary cleanup
├── Batch C: Aviation safety bounds (ZFW, altitude) + rate limiting + server auth

Wave 2 (P1 — structural/performance, 4-7 days):
├── Batch A: Zustand selectors (FMA, NDControls, FmsInspector, Display)
├── Batch B: useMemo additions + React keys + inline props + code splitting
├── Batch C: Test coverage (shared modules + frontend + server + TCAS/GPWS)

Wave 3 (P2 — architecture, 5-8 days):
├── Batch A: Circular deps + dead code + barrel exports
├── Batch B: Legacy Airbus pages + LEGS grid migration
├── Batch C: CI improvements + Nginx + container limits + a11y

Wave 4 (P3 — polish, ongoing):
├── GPWS remaining modes + PhaseManager + EICAS + PWA
└── Coverage threshold + SIGHUP + performance tuning
```

### Success Criteria

- [ ] All `any` type assertions eliminated (complete in e9e9b93)
- [ ] All P0 items resolved
- [ ] `npm test -- --run` — all tests pass (845+)
- [ ] `npm run typecheck:all` passes with strict mode
- [ ] CI runs lint + build + typecheck + coverage + all viewport e2e
- [ ] Error boundaries isolate component crashes (no full-app white screen)
- [ ] Zustand selectors use narrow fields + `shallow` where needed
- [ ] No circular dependencies (madge --circular passes)
- [ ] Coverage threshold ≥ 70%
- [ ] WebSocket server has auth + rate limiting + ping-pong

---

## Summary

| Wave      | Items  | Focus                          | Est. Effort     |
| --------- | ------ | ------------------------------ | --------------- |
| Wave 0    | 6      | Quick wins                     | 4h              |
| Wave 1    | 11     | P0 — safety, crash, type       | 3-4 days        |
| Wave 2    | 11     | P1 — performance, tests        | 7-12 days       |
| Wave 3    | 15     | P2 — architecture, CI, infra   | 8-12 days       |
| Wave 4    | 9      | P3 — aviation fidelity, polish | 5-8 days        |
| Wave 5    | 7      | Ongoing discovery              | Ongoing         |
| **Total** | **59** |                                | **~25-35 days** |
