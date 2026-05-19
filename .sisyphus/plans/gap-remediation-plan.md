# Work Plan: Gap Remediation & Continued Discovery — RFMC VirtualCDU

**Status:** Active
**Generated:** 2026-05-19
**Scope:** Full codebase — shared, src, server, e2e

---

## How This Plan Works

Each gap has a **priority**:

- **P0** — Safety/type-safety critical, blocks correctness
- **P1** — Structural debt, missing coverage on core logic
- **P2** — Notable gaps, should fix when in area
- **P3** — Nice-to-have, aviation fidelity, polish

Each item includes:

- Tier: Priority level
- Files: Where to look
- Description: What's wrong
- Fix: What to do
- Discovery Needed: Additional info we still need to gather

---

## PART 1: KNOWN GAPS — FIX ACTIONS

### P0 — Type Safety & Test Criticals

#### [P0-01] GPWS/TCAS engines have zero tests

- **Files:** `shared/src/fmc/GpwsEngine.ts`, `shared/src/fmc/TcasEngine.ts`
- **Fix:** Add unit tests for each alert mode, phase transitions, cooldown, vertical envelope.
- **Status:** From existing plan gap-analysis-plan.md T1-01

#### [P0-02] `as any` in LSK dispatch pipeline

- **Files:** `shared/src/fmc/fmcScratchpadAdapter.ts` (17 instances), `shared/src/fmc/actionHandlers/lskDispatcher.ts` (6 instances), `shared/src/fmc/actionHandlers/actionResult.ts`
- **Fix:** Type `set`/`get` signatures through adapter. Make `sideEffect` a typed union on `FmcActionSuccess`. Use typed builder for `FmcActionResult` partial patches.
- **Status:** From existing plan T1-02, T1-05, T1-07

#### [P0-03] `as any` in core frontend store

- **Files:** `src/store/useFMCStore.ts` (18 instances)
- **Fix:** Union types for nullable fields, type setter/getter interface. Guard `window.*` exports with `import.meta.env.DEV`.
- **Status:** From existing plan T1-03, T1-04

#### [P0-04] `as any` in action handler return values

- **Files:** `landingActions.ts` (12), `takeoffActions.ts` (8), `routeActions.ts` (8), `holdActions.ts` (5), `atsuActions.ts` (5), `procedureActions.ts` (4), `fixActions.ts` (2), `legActions.ts` (2), `irsActions.ts` (1)
- **Fix:** Create typed builder that accepts `Partial<FmcActionSuccess>` and merges with defaults instead of casting complete objects as `any`.
- **NEW** — not in existing plan

#### [P0-05] `any` typed training pipeline

- **Files:** `shared/src/fmc/tutorialEngine.ts` (isStepComplete takes `any, any`), `src/store/useFMCStore.ts` (6 training `any` annotations), `src/components/Training/FmsInspector.tsx` (8 `any` selectors)
- **Fix:** Define `TutorialStep`, `Scenario`, `TrainingGoal` interfaces and use them throughout.
- **NEW**

#### [P0-06] No React Error Boundaries anywhere

- **Files:** `src/App.tsx`, `src/components/` (all)
- **Fix:** Add `<ErrorBoundary>` wrapper around each major section (CDU, ND, Cockpit, Training). Any runtime error currently crashes the full app.
- **NEW**

---

### P1 — Test Coverage & Structural

#### [P1-01] Untested core flight logic modules

- **Files:** `LegSequencer.ts`, `FmsRuntimeEngine.ts`, `VerticalProfileEngine.ts`, `PerformanceEngine.ts`, `NavDatabaseService.ts`, `navDatabase.ts`, `ScenarioEngine.ts`, `LegTypeEngine.ts`, `fmsNavigation.ts`, `waypointParser.ts`, `keyProcessor.ts`, `MessageService.ts`, `RealismManager.ts`
- **Fix:** Each of these 13 files needs unit tests. They represent the core FMC logic layer with zero coverage.
- **NEW**

#### [P1-02] Frontend component test gap

- **Files:** `src/components/` (~100 .tsx files) → only 5 test files
- **Fix:** Add smoke/render tests for all 12 hooks, all 7 stores (6 have zero tests), critical components (CDU, ND, MCP, PFD, CockpitMode).
- **NEW**

#### [P1-03] Untested server modules

- **Files:** `server/src/security.ts`, `logging.ts`, `metrics.ts`, `websocketValidation.ts`
- **Fix:** Add unit tests for security config, log event formatting, metrics collection, WS message validation, WS rate limiter.
- **NEW**

#### [P1-04] No ESLint/Prettier

- **Project-wide**
- **Fix:** Add ESLint + Prettier + lint/format scripts + CI gate. 58k LOC, zero style enforcement.
- **Status:** From T2-09

#### [P1-05] TactileEngine 3rd AudioContext

- **Files:** `src/utils/tactile.ts` (creates own AudioContext, bypasses singleton), also uses `(window as any).webkitAudioContext`
- **Fix:** Import `getAudioContext()` from `src/services/audioContext`.
- **Status:** From T2-05

#### [P1-06] Untyped ND layers

- **Files:** `TCASOverlay.tsx` (`targets: any[]`), `VerticalProfileOverlay.tsx` (`points: any[]`), `WXROverlay.tsx` (`p: any`)
- **Fix:** Define proper props interfaces instead of `any[]`.
- **NEW**

#### [P1-07] Untyped EFIS mode

- **Files:** `src/store/cockpitLayoutStore.ts` — `setEFISMode(side, mode: any)`
- **Fix:** Define `EFISMode` type and use it.
- **NEW**

---

### P2 — Robustness & Polish

#### [P2-01] Missing loading/empty/error states

- **Files:** All `src/components/` — zero loading states, zero empty states, zero error states found
- **Fix:** Components should handle: loading (data not yet available), empty (no data), error (data fetch failed) states.
- **NEW**

#### [P2-02] Accessibility gap

- **Files:** ~80% of 100+ components lack ARIA attributes
- **Fix:** Audit and add `aria-label`, `role`, keyboard navigation to interactive components. Add axe-core to CI.
- **NEW**

#### [P2-03] Legacy pages not grid-migrated

- **Files:** `shared/src/fmc/pages/climb.ts`, `cruise.ts`, `descent.ts`, `direct.ts`, `n1limit.ts`
- **Fix:** Migrate to grid system for pattern consistency.
- **Status:** From T2-03/T2-11

#### [P2-04] Dual LEGS/PROGRESS implementations in navigation.ts

- **Files:** `shared/src/fmc/pages/navigation.ts` vs `boeing/legs.grid.ts` + `boeing/progress.grid.ts`
- **Fix:** Confirm no callers on old versions, remove dead code, remove `navigation.ts`.
- **Status:** From T2-02/T2-10

#### [P2-05] PhaseManager doesn't detect GO_AROUND

- **Files:** `shared/src/fmc/PhaseManager.ts`
- **Fix:** Add go-around detection logic.
- **Status:** From T3-06

#### [P2-06] `any` pages (6 files) not tested

- **Files:** `pages/route.ts`, `n1limit.ts`, `descent.ts`, `cruise.ts`, `climb.ts`, `direct.ts`, `setup.ts`, `navigation.ts`
- **Fix:** Either migrate to grids + test, or confirm dead/alive status and remove if dead.
- **NEW**

#### [P2-07] No automated CI tests for server security/rate limiting

- **Solution:** Add `helmet` header assertions and rate limit behavior tests.
- **NEW**

---

### P3 — Aviation Fidelity & Enhancement

#### [P3-01] Missing GPWS modes (1, 2, 4, 5, 7)

- **Status:** From T3-01/T3-02/T3-04/T3-05
- **Fix:** Implement Mode 1 (excessive descent), Mode 2 (terrain closure), Mode 4 (unsafe terrain clearance), Mode 5 (glideslope), Mode 7 (windshear).

#### [P3-02] PhaseManager approach detection incomplete

- **Status:** From T3-07

#### [P3-03] EICASPanel is a stub

- **Status:** From T3-03

#### [P3-04] No app shortcuts / install screenshots in PWA manifest

- **Fix:** Add `shortcuts`, `screenshots`, `description` to `public/manifest.json`.
- **NEW**

---

## PART 2: CONTINUED DISCOVERY — SEARCHING FOR MORE GAPS

The following areas need deep-dive analysis. Results to be appended below.

### Discovery Area 1: CSS & Style Debt

- Check for unused Tailwind classes (purge analysis)
- Check for inline styles that should be Tailwind classes
- Check for style conflicts between `index.css` and Tailwind
- Check responsive layout breakpoints for coverage

### Discovery Area 2: Dependency & Bundle Analysis

- Check node_modules size / unused deps
- Check if all workspace packages are actually used
- Check for duplicate dependencies across workspaces
- Check bundle size report (vite build --report)

### Discovery Area 3: Dead Code Detection

- Find unused exports across shared/src/fmc/
- Find unused React components
- Find unused utility functions in src/utils/
- Check vs-code "References" for each top-level export in shared/src/index.ts

### Discovery Area 4: State Management Architecture

- Assess if training state should be extracted from monolithic useFMCStore
- Check for unnecessary re-renders in the component tree
- Find Zustand subscriptions that could use shallow comparison
- Check for selector optimization opportunities

### Discovery Area 5: Error Handling Deep Dive

- Check all WebSocket message handlers for error cases
- Review all I/O paths in navDataLoader for error propagation
- Check server adapter error handling completeness
- Review React component error boundaries placement

### Discovery Area 6: Performance

- CDU display render optimization (scanline effect performance)
- ND SVG layer rendering (reconciliation cost)
- Large state update batching in WebSocket message handlers
- useMemo/useCallback gaps

### Discovery Area 7: Documentation & Config

- Check docs/\*.md files for outdated information
- Check environment variable documentation
- Check CI config for completeness
- Review Docker/build config

---

## PART 3: DISCOVERY RESULTS (2026-05-19)

### Discovery Area 1 Verdict: CSS & Style Debt — LOW

- Tailwind config is clean and minimal (11 custom colors, 1 font family, 2 animations, no plugins)
- 8 `!important` violations all serve legitimate purposes (6 = reduced-motion a11y, 2 = display selection/print)
- No inline style bloat detected
- Styles have reasonable responsive breakpoints in layout components
- **Verdict:** No significant CSS debt found

### Discovery Area 2 Verdict: Dependencies — CLEAN

- All 3 workspace `package.json` files are clean, no cruft
- `shared`: only depends on `idb` (IndexedDB wrapper) and `typescript`
- `src` (frontend): react, react-dom, zustand — minimal (Tailwind is devDependency)
- `server`: express, helmet, express-rate-limit, ws, node-simconnect, tsx — all needed
- CI: npm audit runs on production deps — good security hygiene
- **Concern:** No `npm outdated` check in CI (low priority)
- **Verdict:** No dependency bloat found

### Discovery Area 3 Verdict: Dead Code — NEW GAPS FOUND

| Gap                                                                                                                                                           | Severity   | Fix                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Legacy Boeing pages** (`pages/climb.ts`, `cruise.ts`, `descent.ts`, `direct.ts`, `n1limit.ts`) — use old `fmt()`/`inverse()` helpers instead of grid system | **Medium** | Migrate to grid or remove if dead                                                                                                                                          |
| **`navigation.ts` dual impl** — still has `renderLegsPage`/`renderProgressPage` but grid versions exist                                                       | **Medium** | Remove dead functions                                                                                                                                                      |
| **`setup.ts` dual impl** — has `renderIdentPage` through `renderMenuPage` (7 functions) — may overlap with grid versions                                      | **Low**    | Audit against grid pages                                                                                                                                                   |
| **`pages/route.ts` dual impl** — has `renderRtePage`/`renderDepArrPage` overlapping with `route.grid.ts` and `depArr.grid.ts`                                 | **Medium** | Check callers, remove if dead                                                                                                                                              |
| **`navigation.ts` hold/fix pages** — has `renderHoldPage`/`renderFixPage` — grid equivalents in boeing/ dir?                                                  | **Low**    | Verify against grid versions                                                                                                                                               |
| **Airbus `pages/airbus/index.ts` dual impl** — has legacy `renderInitA` through `renderMcduMenu` (14 functions) — grid versions exist for most                | **High**   | This is the largest duplication. The legacy Airbus index.ts has implementations that overlap with `initA.grid.ts`, `initB.grid.ts`, `fpln.grid.ts`, `depArr.grid.ts`, etc. |

### NEW: P0 Gaps Found

#### [P0-07] Training pipeline entirely `any`-typed

- **Files:** `shared/src/fmc/tutorialEngine.ts` (`isStepComplete(step: any, state: any)`), `src/store/useFMCStore.ts` (6 training fields typed `any`), `src/components/Training/FmsInspector.tsx` (8 Zustand selectors use `(s: any)`)
- **Fix:** Define `TutorialStep`, `Scenario`, `TrainingGoal` interfaces. Replace all `any` with proper types.

#### [P0-08] ND layers accept `any[]` props

- **Files:** `TCASOverlay.tsx` (`targets: any[]`), `VerticalProfileOverlay.tsx` (`points: any[]`), `WXROverlay.tsx` (`p: any`)
- **Fix:** Define proper typed prop interfaces.

#### [P0-09] No React Error Boundaries anywhere

- **Files:** All of `src/components/`
- **Fix:** Wrap each major section (CDU, ND, Cockpit, Training) in `<ErrorBoundary>`. Any runtime error currently crashes entire app.
- **Effort:** 1 day

#### [P0-10] `any`-typed EFIS mode parameter

- **Files:** `src/store/cockpitLayoutStore.ts` — `setEFISMode(side: 'L' | 'R', mode: any)`
- **Fix:** Define and use an `EFISMode` union type.

#### [P0-11] `window` store debugging leaks to production

- **Files:** `src/store/useFMCStore.ts` (lines 2256-2260)
- **Fix:** Guard with `if (import.meta.env.DEV)`
- **Effort:** 2 hours

### NEW: P1 Gaps Found

#### [P1-08] 7 `console.*` calls in frontend should use devLog/devError

- **Files:** `src/store/useFMCStore.ts` (lines 607, 803, 1194, 2022), `src/App.tsx` (379), `src/utils/tactile.ts` (36), `src/components/instruments/common/AvionicsKey.tsx` (55)
- **Fix:** Replace with `devLog`/`devError`/`devWarn` from `@shared`. Prevents accidental console output in production (though vite strips in build, it's pattern inconsistency).
- **Effort:** 1 hour

#### [P1-09] Unused import in useCDUKeyboard

- **Files:** `src/hooks/useCDUKeyboard.ts` — imports `aircraft` from `useAircraftStore` but never uses it in the effect. Dependency array includes it causing unnecessary re-registrations.
- **Fix:** Remove unused import and dependency.
- **Effort:** 5 minutes

#### [P1-10] 53 shared source files untested (beyond GPWS/TCAS)

- **Files:** Full list in gap-analysis-plan.md summary. Critical untested: LegSequencer, FmsRuntimeEngine, VerticalProfileEngine, PerformanceEngine, NavDatabaseService, ScenarioEngine, LegTypeEngine, fmsNavigation, waypointParser, keyProcessor, MessageService
- **Fix:** Add unit tests — each module needs targeted test coverage.
- **Effort:** 3-5 days total

#### [P1-11] Frontend component test gap — 95% of UI has zero tests

- **Files:** ~100 components, only 5 test files
- **Fix:** Smoke tests for all 12 hooks, all 7 stores (6 have zero), critical components (CDU, ND, MCP, PFD, CockpitMode, Training)
- **Effort:** 3-5 days

#### [P1-12] Server modules untested (4 modules)

- **Files:** `server/src/security.ts`, `logging.ts`, `metrics.ts`, `websocketValidation.ts`
- **Fix:** Add unit tests
- **Effort:** 1 day

### NEW: P2 Gaps Found

#### [P2-08] Missing loading/empty/error states across UI

- **Files:** All `src/components/` — zero components handle loading, empty, or error display states
- **Fix:** Components should show appropriate UI for: data loading, empty state, error state
- **Effort:** 2-3 days

#### [P2-09] 80%+ components lack ARIA attributes

- **Files:** Only 19 of 100+ components have any ARIA attributes (31 ARIA matches total)
- **Fix:** Add `aria-label`, `role`, keyboard navigation. Add axe-core to CI.
- **Effort:** 3-5 days for full pass

#### [P2-10] Airbus index.ts has 14 legacy functions with grid equivalents

- **Files:** `shared/src/fmc/pages/airbus/index.ts` has 14 `render*` functions (InitA, InitB, DepArr, PerfTakeoff, PerfAppr, FuelPred, SecFpln, RadNav, Prog, DataIndex, McduMenu) — all have grid equivalents in the airbus/ directory
- **Fix:** Refactor page router to use grid versions, remove legacy implementations
- **Effort:** 1-2 days

#### [P2-11] Airbus `pages/index.ts` also has legacy re-exports

- **Files:** `shared/src/fmc/pages/index.ts` line 35 — still exports/references legacy pages in some paths
- **Fix:** Audit the page routing to ensure all consumers use only grid versions

#### [P2-12] No automated accessibility checking in CI

- **Fix:** Add `@axe-core/playwright` to e2e tests
- **Effort:** 1 day

### NEW: P3 Gaps Found

#### [P3-05] No `SIGHUP` handler in server

- **Fix:** Add for log rotation / config reload
- **Effort:** 30 min

#### [P3-06] PWA manifest missing app shortcuts + install screenshots

- **Fix:** Add `shortcuts` and `screenshots` arrays to `public/manifest.json`
- **Effort:** 2 hours

#### [P3-07] Coverage threshold at 50% allows gaps

- **Fix:** Raise to 70% after filling critical test gaps
- **Effort:** Config change (after test coverage addressed)

---

### Updated Summary

| Tier      | Previous Count | New Additions | Total  |
| --------- | -------------- | ------------- | ------ |
| **P0**    | 9              | 5             | 14     |
| **P1**    | 7              | 5             | 12     |
| **P2**    | 7              | 5             | 12     |
| **P3**    | 7              | 3             | 10     |
| **Total** | **30**         | **18**        | **48** |

### Top New Gaps by Impact ÷ Effort

| #   | Gap                                    | Tier | Effort | Why                                         |
| --- | -------------------------------------- | ---- | ------ | ------------------------------------------- |
| 1   | No Error Boundaries anywhere           | P0   | 1d     | Any runtime error = blank white screen      |
| 2   | Training pipeline entirely `any`-typed | P0   | 1d     | Type safety erosion in core training system |
| 3   | ND layers accept `any[]`               | P0   | 2h     | SVG rendering with no type safety           |
| 4   | 7 `console.*` in frontend              | P1   | 1h     | Inconsistent logging patterns               |
| 5   | 53 source files untested               | P1   | 3-5d   | Core flight logic has zero verification     |
| 6   | Frontend: 95% of UI has zero tests     | P1   | 3-5d   | Catastrophic coverage gap                   |
| 7   | Legacy Airbus dual impl (14 funcs)     | P2   | 1-2d   | Largest dead code accumulation              |
| 8   | No a11y checking in CI                 | P2   | 1d     | Accessibility invisible to CI               |
| 9   | No loading/empty/error states          | P2   | 2-3d   | UX gap on data failures                     |
| 10  | PWA manifest incomplete                | P3   | 2h     | Minor install UX improvement                |

---

## PART 4: ONGOING DISCOVERY — STILL TO EXPLORE

The following high-value areas have NOT been fully explored:

1. **Performance profiling** — CDU scanline effect GPU cost, ND SVG reconciliation, Zustand selector efficiency (use shallow comparison audit), unnecessary re-renders
2. **Server memory leak analysis** — WebSocket connection cleanup on disconnect, poll interval management, event listener leaks
3. **avionics module audit** — shared/src/avionics/, shared/src/pfd/, shared/src/autopilot/ — check for dual implementations with fmc/ modules
4. **E2E test robustness** — Check for flaky tests, visual test maintenance burden, missing edge cases
5. **IndexedDB navdata loading** — Error handling completeness, progress reporting, data integrity validation
6. **import cycle detection** — Check for circular dependencies that could cause runtime issues
7. **React key props and reconciliation** — Missing/wrong keys in lists causing unnecessary DOM updates
8. **Hardcoded strings audit** — All user-facing strings in the app should be checked (low priority for single-language app)

---

## PART 5: DISCOVERY RESULTS (2026-05-19 ROUND 2)

### Discovery Area 1 Verdict: Zustand Performance — GAPS FOUND

| Gap                                           | Severity   | Detail                                                                                                                                                                                                             |
| --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **No `shallow` comparison anywhere**          | **High**   | 0 out of 198 Zustand selectors across 31 component files use `shallow`. Every state change re-renders all subscribers.                                                                                             |
| **Full-store subscriptions**                  | **High**   | `FMA.tsx` does `useFMCStore(s => s)` and `useAutopilotStore(s => s)` — subscribes to entire stores. Re-renders on ANY change.                                                                                      |
| **Selector creates new objects**              | **High**   | `AirbusPFD.tsx` line 20: `useFMCStore(s => ({...}))` and `BoeingPFD.tsx` lines 16-20: `useAutopilotStore(s => ({...})), useFMCStore(s => ({...}))` — creates new object ref every render, defeating React bailout. |
| **`getDisplayData()` in selectors**           | **High**   | `Boeing737CDU.tsx`, `Display.tsx`, `AirbusMCDU.tsx` all call `useFMCStore(s => s.getDisplayData())` — function call returns new object every time. Every store change = full CDU re-render.                        |
| **Array index as React key**                  | **Medium** | 9 instances across ND layers (`WaypointSymbol`, `WXROverlay`, `FixRing`, `VerticalProfileOverlay`, `DebriefOverlay`, etc.) — index-as-key anti-pattern causes unnecessary DOM reconciliation on list changes.      |
| **`FmsInspector` subscribes to full state**   | **Medium** | `useFMCStore((s) => s as unknown as FMCState)` — subscribes to entire store, also uses `any` for 8 other selectors.                                                                                                |
| `NavigationDisplay` — 14 individual selectors | **Low**    | Each selector is an independent subscription. Could be optimized but individual strings/numbers are fine — Zustand does referential equality for primitives.                                                       |

### Discovery Area 2 Verdict: Server WebSocket — CLEAN

- `ws.on('close')` logs and tracks metrics — proper cleanup
- `ws.on('error')` logs errors — no silent failures
- `stop()` stops polling, heartbeat, disconnects aircraft, terminates all clients, closes WSS and HTTP server
- Rate limiting exists per-client (10 msg/sec, 30/sec abuse threshold)
- **No memory leaks found** in WebSocket lifecycle

### Discovery Area 3 Verdict: Avionics Module — CLEAN

- `shared/src/avionics/`: 1 file (`profiles.ts`) — clean, no dual implementations
- `shared/src/autopilot/`: 4 files — autoflightDisplayModel, AutoflightModeManager, autopilotTypes, boeingMcpLogic — well-structured
- `shared/src/pfd/`: 4 files — airbusPfdModel, boeingPfdModel, pfdDisplayModel, pfdTypes — no overlap with avionics/ or autopilot/
- **No dual implementations found** between avionics/pfd/autopilot and fmc/ modules

### Discovery Area 4 Verdict: IndexedDB NavData Loader — GOOD

- Resume/checkpoint logic for crash recovery (writes checkpoint every batch)
- Batch processing (1000 items) with progress reporting
- Version/cycle checking to skip re-imports
- Clears stale data on version mismatch
- Proper error handling with re-throw
- **Minor:** `as NavStoreName` cast (line 63, 117) could be eliminated with better typing
- **Minor:** Checkpoint writes use `setTimeout(0)` with `getNavDb()` re-fetch — redundant DB connection on each microtask

### Discovery Area 5 Verdict: E2E Tests — NOTE

- **2 e2e test files** (`pwa-offline.spec.ts`, `training-scenarios.spec.ts`) depend on `window.useFMCStore` leak
- This means P0-11 (guard window leaks with `import.meta.env.DEV`) must coordinate with e2e tests
- Playwright runs against `npm run dev` so `import.meta.env.DEV = true` — guard is safe
- E2E test suite is well-structured (13+ test files, visual regression, smoke tests, helpers)

### Summary of ROUND 2 Findings

| #   | Gap                                                   | Added To Tier | Severity                                        |
| --- | ----------------------------------------------------- | ------------- | ----------------------------------------------- |
| 1   | No `shallow` comparison on any Zustand selector       | P1 (NEW)      | High — excessive re-renders                     |
| 2   | Full-store subscriptions (FMA, FmsInspector)          | P1 (NEW)      | High — maximum re-renders                       |
| 3   | Selectors creating new objects (AirbusPFD, BoeingPFD) | P1 (NEW)      | High — defeats React bailout                    |
| 4   | `getDisplayData()` in selectors                       | P1 (NEW)      | High — full CDU re-render on every store change |
| 5   | Array index as React key (9 instances)                | P2 (NEW)      | Medium — ND reconciliation issues               |
| 6   | E2E tests depend on window store leak                 | Note          | Low — will keep working with DEV guard          |
| 7   | navDataLoader minor: as cast + setTimeout checkpoint  | P3 (NEW)      | Low — works, but could be cleaner               |

**Updated Total: 55 gaps** (previously 48 + 7 new)
