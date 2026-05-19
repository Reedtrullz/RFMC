# Workplan: Gap Analysis & Remediation — RFMC VirtualCDU

**Status:** Draft  
**Generated:** 2026-05-19  
**Scope:** Full codebase audit (shared, src, server, e2e, docs)

---

## How This Workplan Works

Each gap is assigned a **tier**:

- **Tier 1** — Type-safety erosion, untested safety-critical code, production leaks. Fix first.
- **Tier 2** — Structural debt (monolithic stores, stale dual implementations). Fix after Tier 1.
- **Tier 3** — Missing features, aviation fidelity, secondary-scope gaps. Fix as roadmap allows.
- **Tier ?** — New gaps found during search below. Assigned during investigation.

---

## Tier 1 — Type Safety & Test Criticals

### [T1-01] GPWS/TCAS engines have zero tests

- **Files:** `shared/src/fmc/GpwsEngine.ts`, `shared/src/fmc/TcasEngine.ts`
- **What:** Safety-critical advisory systems with zero unit test coverage.
- **Fix:** Add `__tests__` for each alert mode, phase transitions, cooldown logic, vertical envelope bounds.
- **Est:** 2-3 days

### [T1-02] `as any` in fmcScratchpadAdapter (17 instances)

- **File:** `shared/src/fmc/fmcScratchpadAdapter.ts`
- **What:** Entire LSK action → store dispatch pipeline casts `set`/`get`/`dispatchResult` through `any`. TypeScript cannot catch errors here.
- **Fix:** Type the Zustand `set`/`get` signatures through the adapter; avoid destructuring as `any`.
- **Est:** 1-2 days

### [T1-03] `as any` in useFMCStore (12 instances)

- **File:** `src/store/useFMCStore.ts`
- **What:** `null as any`, `set as any`, `get as any`, `semantic as any`.
- **Fix:** Use proper union types for nullable fields; type the setter/getter interface; follow `fmcStore.ts` pattern.
- **Est:** 1-2 days

### [T1-04] Store leaks to `window` in production

- **Files:** `src/store/useFMCStore.ts` (lines 2255-2259), `src/store/cockpitLayoutStore.ts` (line 165)
- **What:** `(window as any).useFMCStore = useFMCStore` shipped to builds.
- **Fix:** Guard with `if (import.meta.env.DEV)`.
- **Est:** 2 hours

### [T1-05] `as any` in fmcScratchpadAdapter sideEffects pipeline

- **File:** `shared/src/fmc/fmcScratchpadAdapter.ts` (lines 157-184)
- **What:** `(result.success as any)?.targetPage`, `(result.success as any)?.pressKey`, side effects as `(result as any).sideEffects`. Erases safety on the action result → dispatch chain.
- **Fix:** Type the side-effect contract in `FmcActionResult` instead of duck-typing through `any`.
- **Est:** 1 day

---

## Tier 2 — Structural Debt

### [T2-01] Monolithic 2260-line useFMCStore.ts

- **File:** `src/store/useFMCStore.ts`
- **What:** Accumulated route parsing, hold management, scratchpad, LSK dispatch, flight phase, waypoint ops, performance, tutorial orchestration.
- **Fix:** Extract flight phase management, tutorial/scenario orchestration, and waypoint operations into separate stores or modules. The `fmcStore.ts` facade already exists at 70 lines — route more logic through it.
- **Est:** 3-5 days

### [T2-02] Dual Boeing page implementations (legacy + grid)

- **Files:** `shared/src/fmc/pages/navigation.ts` (LEGS, PROGRESS) vs `boeing/legs.grid.ts`, `boeing/progress.grid.ts`
- **What:** The `navigation.ts` file still contains `renderLegsPage` and `renderProgressPage` — but the `index.ts` dispatcher routes to the grid versions. Dead code accumulation.
- **Fix:** Confirm all callers use grid versions, remove stale functions from `navigation.ts`, then remove the file entirely.
- **Est:** 4 hours

### [T2-03] Legacy Boeing pages not migrated to grid system

- **Files:** `shared/src/fmc/pages/climb.ts`, `cruise.ts`, `descent.ts`, `direct.ts`, `n1limit.ts`
- **What:** Use old `fmt()`/`inverse()` helpers instead of the grid-system `boeingPage()`/`seg()` helpers.
- **Fix:** Migrate to grid system for consistency. Each is 50-66 lines — small individual changes.
- **Est:** 1 day total

### [T2-04] Training scenario engine has placeholder

- **File:** `shared/src/training/scenarioEngine.ts` (line 179)
- **What:** `id: 'placeholder'` in a scenario entry.
- **Fix:** Remove or implement the placeholder scenario.
- **Est:** 2 hours

---

## Tier 3 — Features & Aviation Fidelity

### [T3-01] Missing GPWS modes (1, 2, 4, 5)

- **File:** `shared/src/fmc/GpwsEngine.ts`
- **What:** Only Mode 3 (DONT_SINK) and Mode 6 (callouts) exist. Real GPWS has 7 modes. Missing: excessive descent rate (Mode 1), excessive terrain closure (Mode 2), unsafe terrain clearance (Mode 4), glideslope deviation (Mode 5).
- **Fix:** Implement remaining modes. Mode 5 already has the `GLIDESLOPE` callout listener in useAuralAlerts.ts but no engine logic.
- **Est:** 2-3 days

### [T3-02] No Windshear detection

- **File:** `shared/src/fmc/GpwsEngine.ts`
- **What:** `WINDSHEAR` exists in `GpwsAlert` enum value but no logic.
- **Fix:** Implement windshear detection (Mode 7).
- **Est:** 0.5 day

### [T3-03] EICASPanel is a stub

- **File:** `src/components/CockpitMode/EICASPanel.tsx`
- **What:** 37-line component showing only alert text overlay. No engine gauges, N1/N2, EGT, fuel flow.
- **Fix:** Build real EICAS display or clearly label as trainer stub.
- **Est:** 3-5 days (or mark as out-of-scope)

---

## Remaining Investigation Areas

The following areas have NOT been fully audited yet. Results will be appended below as searches complete:

1. Training/scenario engine completeness
2. Action handler coverage vs page count
3. LSK dispatcher handler gaps
4. Server security hardening completeness
5. PWA service worker quality
6. CSS/Tailwind patterns and inconsistencies
7. Flight phase manager state machine gaps
8. IndexedDB navdata loader error handling
9. Test quality (not just quantity) — snapshot tests vs logic tests
10. Dead code / unused exports

---

---

## Deep-Dive Findings — Appended 2026-05-19

---

## Tier 1 — Type Safety & Test Criticals (New)

### [T1-06] `as any` in LegSequencer (2 instances)

- **File:** `shared/src/fmc/LegSequencer.ts`
- **What:** `(currentLeg.legType as any)` and `(nextLeg.legType as any)` — also non-null assertions `lat!` `lon!`.
- **Fix:** Type the `legType` field properly on `FlightPlanWaypoint` instead of casting.
- **Est:** 2 hours

### [T1-07] `as any` in lskDispatcher sideEffects pipeline (6 instances)

- **File:** `shared/src/fmc/actionHandlers/lskDispatcher.ts`
- **What:** `(special as any).sideEffect`, `(ft.success as any)?.sideEffect`, `(route.success as any)?.sideEffect`, `(leg as any).sideEffect`, `(proc.success as any)?.sideEffect`. The `FmcActionSuccess.sideEffect` is typed as `string` but accessed through `any` across the dispatcher.
- **Fix:** Make `sideEffect` a strongly-typed union on `FmcActionSuccess` instead of generic `string`.
- **Est:** 1 day

### [T1-08] `as any` in navDataLoader.ts (3 instances)

- **File:** `shared/src/db/navDataLoader.ts`
- **What:** `resumeStoreName as any`, `store.put(item as any)`, `nextStoreName = storeOrder[nextIndex] as any`. The IndexedDB bulk load pipeline is type-unsafe.
- **Fix:** Properly type the store order and put operations.
- **Est:** 4 hours

### [T1-09] `DbMetadata.value: any` in navDb.ts

- **File:** `shared/src/db/navDb.ts`
- **What:** IndexedDB metadata schema uses `value: any`.
- **Fix:** Use a typed union for metadata values.
- **Est:** 2 hours

---

## Tier 2 — Structural Debt (New)

### [T2-05] TactileEngine has its own AudioContext (3rd instance)

- **File:** `src/utils/tactile.ts`
- **What:** Creates a third `AudioContext` instead of using the shared `audioContext.ts` singleton. Bypasses the singleton fix from Phase 2. Also uses `(window as any).webkitAudioContext`.
- **Fix:** Refactor to import `getAudioContext()` from `../services/audioContext`.
- **Est:** 2 hours

### [T2-06] `console.log` in FmsRuntimeEngine

- **File:** `shared/src/fmc/FmsRuntimeEngine.ts` (line 56)
- **What:** `console.log(`Sequencing: ${reason}`)` — debug logging in production engine code.
- **Fix:** Route through a proper logging mechanism or remove.
- **Est:** 15 minutes

### [T2-07] trainingStore.ts referenced but missing

- **File:** `src/store/AGENTS.md` mentions `trainingStore.ts` — file does not exist.
- **What:** Doc/dead reference. Training state is embedded in `useFMCStore` (2260-line blob).
- **Fix:** Remove from docs or create the store.
- **Est:** 1 hour (doc fix) or 2-3 days (create store)

### [T2-08] Scenario engine singleton exports placeholder

- **File:** `shared/src/training/scenarioEngine.ts` (lines 178-184)
- **What:** The singleton `scenarioEngine` has `id: 'placeholder'`, empty steps, and is cast `as any`.
- **Fix:** Create a proper default scenario or remove the singleton pattern.
- **Est:** 4 hours

### [T2-09] No ESLint/Prettier/husky/lint-staged

- **Project-wide**
- **What:** No project-wide linting, formatting, or pre-commit hooks. Code style drifts across 58k LOC.
- **Fix:** Add ESLint + Prettier + husky + lint-staged.
- **Est:** 1-2 days

### [T2-10] Dual LEGS/PROGRESS page implementations

- **Files:** `shared/src/fmc/pages/navigation.ts` vs `boeing/legs.grid.ts` + `boeing/progress.grid.ts`
- **What:** The `navigation.ts` file still contains `renderLegsPage` and `renderProgressPage` functions, but the page dispatcher (`pages/index.ts`) routes to the grid versions. Dead code accumulation (~250 lines).
- **Fix:** Confirm no direct callers, remove dead functions, then remove `navigation.ts`.
- **Est:** 4 hours

### [T2-11] Legacy page renderers not migrated to grid system

- **Files:** `shared/src/fmc/pages/climb.ts`, `cruise.ts`, `descent.ts`, `direct.ts`, `n1limit.ts`
- **What:** These 5 Boeing pages use the old `fmt()`/`inverse()` legacy helper style instead of the `boeingPage()`/`seg()` grid system. Each is 50-66 lines.
- **Fix:** Migrate to grid system for consistency.
- **Est:** 1 day total

---

## Tier 3 — Features & Aviation Fidelity (New)

### [T3-04] GPWS Mode 4 (unsafe terrain clearance) missing

- **File:** `shared/src/fmc/GpwsEngine.ts`
- **What:** Real 737 GPWS Mode 4 checks terrain clearance based on gear/flap configuration. Not implemented.
- **Fix:** Implement Mode 4 logic.
- **Est:** 1-2 days

### [T3-05] GPWS Mode 5 (excessive deviation below glideslope) missing

- **File:** `shared/src/fmc/GpwsEngine.ts`
- **What:** The `GLIDESLOPE` callout listener exists in `useAuralAlerts.ts` but has no engine logic in GpwsEngine.
- **Fix:** Implement Mode 5 glideslope deviation detection.
- **Est:** 1 day

### [T3-06] PhaseManager doesn't detect GO_AROUND

- **File:** `shared/src/fmc/PhaseManager.ts`
- **What:** `FlightPhase` type includes `'GO_AROUND'` but `PhaseManager.inferFlightPhase()` never returns it. The phase is set externally (likely from button press), not inferred.
- **Fix:** Add go-around detection logic (sudden pitch-up, positive rate, gear retraction).
- **Est:** 4 hours

### [T3-07] PhaseManager has incomplete approach detection

- **File:** `shared/src/fmc/PhaseManager.ts`
- **What:** Approach detection relies solely on altitude + speed thresholds. Real FMS uses GPS/FMS approach activation, localizer capture, GS capture.
- **Fix:** Enhance with approach activation state from the FMS.
- **Est:** 1 day

---

## Tier 4 — Server & Infrastructure (New)

### [T4-01] No `unhandledRejection`/`uncaughtException` handlers in server

- **File:** `server/src/index.ts`
- **What:** Server entry point handles SIGINT/SIGTERM but no `process.on('unhandledRejection')` or `process.on('uncaughtException')`. Async rejections can crash silently.
- **Fix:** Add handlers with proper logging and graceful shutdown.
- **Est:** 2 hours

### [T4-02] No lint script in package.json

- **File:** `package.json`
- **What:** 58k LOC with no lint script. CI cannot enforce code style.
- **Fix:** Add `eslint` + `eslint-config-*` + `lint` script.
- **Est:** 1 day (paired with T2-09)

### [T4-03] No `SIGHUP` handler in server

- **File:** `server/src/index.ts`
- **What:** Production servers should handle SIGHUP for log rotation/config reload. Only SIGINT/SIGTERM handled.
- **Fix:** Add SIGHUP handler.
- **Est:** 30 minutes

---

## Summary: Complete Gap Inventory

| Tier       | Count       | Focus                                                                |
| ---------- | ----------- | -------------------------------------------------------------------- |
| **Tier 1** | 9 gaps      | Type safety erosion, untested safety-critical code, production leaks |
| **Tier 2** | 11 gaps     | Structural debt, dead code, missing tooling, dual implementations    |
| **Tier 3** | 7 gaps      | Missing features, aviation fidelity gaps                             |
| **Tier 4** | 3 gaps      | Server hardening, infrastructure                                     |
| **Total**  | **30 gaps** |                                                                      |

### Top 10 by Impact ÷ Effort

| #   | Gap                                  | Tier | Effort | Impact                      |
| --- | ------------------------------------ | ---- | ------ | --------------------------- |
| 1   | GPWS/TCAS zero tests                 | T1   | 2-3d   | Safety-critical unverified  |
| 2   | `as any` in scratchpad adapter (17)  | T1   | 1-2d   | LSK pipeline type-unsafe    |
| 3   | `window` store leaks (production)    | T1   | 2h     | Exposes internals           |
| 4   | TactileEngine 3rd AudioContext       | T2   | 2h     | Bypasses singleton fix      |
| 5   | `as any` in lskDispatcher (6)        | T1   | 1d     | SideEffect pipeline unsafe  |
| 6   | No ESLint/Prettier                   | T2   | 1-2d   | Style drifts across 58k LOC |
| 7   | `console.log` in FmsRuntimeEngine    | T2   | 15m    | Debug logging in prod       |
| 8   | No server unhandledRejection handler | T4   | 2h     | Silent crash risk           |
| 9   | Scenario engine placeholder          | T2   | 4h     | Training shows stub         |
| 10  | Legacy pages not grid-migrated       | T2   | 1d     | Pattern inconsistency       |
