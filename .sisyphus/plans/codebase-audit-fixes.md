# VirtualCDU Codebase Audit — Fix Plan

**Created:** 2026-05-19
**Branch:** main (a469942)
**Scope:** All issues from the comprehensive codebase audit
**Approach:** Grouped into parallel work streams by domain. Each task is atomic and independently verifiable.

---

## Work Stream A: Critical Resilience (HIGH — do first)

### [x] A1. Add root ErrorBoundary in `src/main.tsx`

- **File:** `src/main.tsx`
- **What:** Wrap `<App />` in `<ErrorBoundary>` with a full-page crash fallback
- **Why:** Any error in App-level hook initialization or outside inner boundaries → white screen
- **Verification:**
  - `npm run typecheck:all` passes
  - Temporarily throw in App useEffect → crash fallback renders instead of white screen
- **Effort:** ~5 min
- **Dependencies:** None

### [x] A2. Fix WebSocket `onerror` missing reconnect trigger

- **File:** `src/services/WebSocketClient.ts`, lines 67-70
- **What:** Add `this.scheduleReconnect()` inside the `ws.onerror` handler, and also call `this.ws?.close()` to ensure `onclose` fires as a belt-and-suspenders approach
- **Why:** If socket enters faulted-but-not-closed state, client hangs in ERROR forever
- **Verification:**
  - `npm run typecheck:all` passes
  - Existing WebSocket tests still pass
  - Manual test: kill server mid-connection → client recovers
- **Effort:** ~10 min
- **Dependencies:** None

### [x] A3. Fix `useAuralAlerts.ts` — effect fires every render

- **File:** `src/hooks/useAuralAlerts.ts`
- **What:** Replace inline `fma` object in useEffect deps with primitive destructured values: `[lateralActive, verticalActive, thrustActive, gpwsAlert, tcasAlert, autopilotStatus, aircraft, alerts]`
- **Why:** Object recreated every render → useEffect runs continuously
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - React DevTools profiler: useAuralAlerts effect no longer fires on unrelated renders
- **Effort:** ~15 min
- **Dependencies:** None

### [x] A4. Fix `CDUDisplayGrid.tsx` — CellSpan memo ineffective

- **File:** `src/components/CDU/display/CDUDisplayGrid.tsx`
- **What:** Add custom comparison function to `memo()` wrapping `CellSpan`, comparing `cell.char`, `cell.color`, `cell.size`, `cell.blink`, `cell.inverse`, `cell.semantic`, and `variant`
- **Why:** Without custom comparator, all 336 cells re-render on every scratchpad keystroke because cell object references change
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - Visual regression tests pass: `npm run test:visual`
  - React DevTools profiler: CellSpan render count drops dramatically on keypress
- **Effort:** ~20 min
- **Dependencies:** None

### [x] A5. Fix non-null assertions on nullable paths

- **Files:**
  - `shared/src/fmc/navigationDisplay.ts` line 97: `state.pendingRoute!.directTo` → `state.pendingRoute?.directTo`
  - `src/store/useFMCStore.ts` line 1335: `data.waypoints!.find(...)` → `data.waypoints?.find(...) ?? undefined`
- **What:** Replace `!` assertions with safe optional chaining + nullish coalescing
- **Why:** Runtime TypeError if pendingRoute is null or waypoints is undefined
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - Grep confirms no remaining `!.` patterns on these specific paths
- **Effort:** ~10 min
- **Dependencies:** None

**A1–A5 are fully independent — execute in parallel.**

---

## Work Stream B: React Performance (MEDIUM)

### [x] B1. Fix Zustand over-subscriptions

- **Files:**
  - `src/components/CockpitMode/ModeHelpCard.tsx`: Replace `useFMCStore()` with specific selectors for only the fields used (e.g., `currentPage`, `aircraft`, `flightPhase`, `tutorialActive`)
  - `src/components/Training/FmsInspector.tsx`: Replace `useFMCStore(s => s)` with specific slice selectors. Also wrap `buildLnavState`, `buildVnavPrediction`, `buildPerformancePrediction` computations in `useMemo`
- **What:** Narrow Zustand selectors so components only re-render when their actual data changes
- **Why:** Both components re-render on every store change (keypress, tick, cursor blink)
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - React DevTools: ModeHelpCard/FmsInspector render count drops when pressing CDU keys
- **Effort:** ~30 min per file
- **Dependencies:** None

### [x] B2. Memoize `controls` object in CockpitLayout.tsx

- **File:** `src/components/CockpitMode/CockpitLayout.tsx`
- **What:** Wrap `controls` object creation in `useMemo` with appropriate deps. Stabilize the `Set` instances and callbacks so downstream instrument components aren't forced to re-render
- **Why:** New object with new Set/function references on every render defeats child memoization
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - Visual regression: `npm run test:visual`
  - React DevTools: downstream instrument re-renders reduced
- **Effort:** ~20 min
- **Dependencies:** None

### [x] B3. Memoize `buildBoeingMcpDisplayModel` in BoeingMCP.tsx

- **File:** `src/components/instruments/boeing/BoeingMCP/BoeingMCP.tsx`
- **What:** Wrap `buildBoeingMcpDisplayModel(state, truth)` call in `useMemo` keyed on `state` and `truth` references
- **Why:** Expensive computation runs unconditionally on every render
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
- **Effort:** ~10 min
- **Dependencies:** None

### [x] B4. Consolidate NavigationDisplay selectors

- **File:** `src/components/ND/NavigationDisplay.tsx`
- **What:** Replace 15 individual `useFMCStore` calls with a single `useFMCStore(useShallow(s => ({ ... })))` selector object
- **Why:** Reduces subscriber overhead and groups state change notifications
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - Visual regression on ND: `npm run test:e2e:visual`
- **Effort:** ~20 min
- **Dependencies:** Need to verify `useShallow` is available from zustand (v4.5.2 — check import path `zustand/react/shallow`)

**B1–B4 are independent — execute in parallel.**

---

## Work Stream C: Error Handling Hardening (MEDIUM)

### [x] C1. Wrap async browser APIs in try-catch

- **Files:**
  - `src/hooks/useSound.ts`: Wrap `await resumeAudioContext()` in try-catch, swallow gracefully (audio is non-critical)
  - `src/hooks/useWakeLock.ts`: Wrap `await sentinel.release()` in try-catch
  - `src/services/AuralAlertService.ts`: Wrap `await resumeAudioContext()` in try-catch
- **What:** Add try-catch around async browser API calls that can reject due to permissions/autoplay policies
- **Why:** Unhandled promise rejections in React event handlers
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
- **Effort:** ~15 min total
- **Dependencies:** None

### [x] C2. Surface background loading failures to UI

- **File:** `src/store/useFMCStore.ts`, lines 978/981
- **What:** When `loadProceduresIntoCache` fails, push a scratchpad advisory message (e.g., `PROC DATA UNAVAIL`) instead of only logging to console
- **Why:** Pilots get no feedback when terminal procedure data fails to load
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - Manual test: simulate navdb failure → scratchpad shows advisory
- **Effort:** ~20 min
- **Dependencies:** Scratchpad message system already exists (scratchpadEngine.ts)

### [x] C3. Server tick errors → notify WebSocket clients

- **File:** `server/src/fmc-engine.ts`, line 61 area
- **What:** When engine tick catches an error, broadcast a `{ type: 'error', message: 'Engine sync error' }` to connected clients, or set a health flag that the heartbeat can include
- **Why:** Silent server-side engine failures leave clients with stale state and no indication
- **Verification:**
  - `npm run typecheck:all` passes
  - Server tests pass
- **Effort:** ~20 min
- **Dependencies:** None

**C1–C3 are independent — execute in parallel.**

---

## Work Stream D: Dead Code & Cleanup (MEDIUM)

### [x] D1. Remove legacy non-grid page renderers

- **Files to modify:**
  - `shared/src/fmc/pages/index.ts`: Remove re-exports of `renderPosInitPage`, `renderTakeoffRefPage`, `renderRtePage`
  - `shared/src/fmc/pages/setup.ts`: Delete `renderPosInitPage`, `renderTakeoffRefPage` functions (keep grid variants)
  - `shared/src/fmc/pages/route.ts`: Delete `renderRtePage` function (keep grid variant)
  - `shared/src/fmc/displayGrid.ts`: Remove unused `clampDisplayText`, `composeLegacyDisplayLine`, `displayLineToSegments`
- **What:** Finalize the grid migration by removing dead legacy renderers
- **Pre-check:** Grep the entire codebase to confirm zero live imports of these functions before deleting
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - `npm run build` succeeds
- **Effort:** ~20 min
- **Dependencies:** None

### [x] D2. Clean up orphan files

- **Actions:**
  - Delete `test.ts` (root — single throwaway import line)
  - Delete `scratch/testNavdata.ts` (scratchpad script)
  - Move `qa-*.png` (5 files) and `grok-*.jpg` to `docs/assets/qa/` or add to `.gitignore`
  - Move `virtualcdu_combined_master_work_plan.md` and `virtualcdu_visual_realism_work_plan.md` to `docs/`
- **Pre-check:** Confirm none of these are referenced in CI, tests, or docs
- **Verification:**
  - `npm run build` succeeds
  - `npm test` passes
  - `npm run test:e2e:ci` passes
- **Effort:** ~10 min
- **Dependencies:** None

### [x] D3. Register or remove FBW A320 adapter

- **File:** `server/src/aircraft-adapters/fbw-a320.ts`
- **Decision required:** Is the FlyByWire A320 adapter planned for future use?
  - **If YES:** Register it in `server/src/aircraft-adapters/index.ts` factory and add env var switch
  - **If NO:** Delete the file
- **Pre-check:** Grep for `FBWA320` or `fbw-a320` imports
- **Verification:**
  - `npm run typecheck:all` passes
  - Server starts without errors
- **Effort:** ~10 min
- **Dependencies:** Decision from project owner

### [x] D4. Clean up unused SimBrief parser exports

- **File:** `shared/src/fmc/simbriefParser.ts`
- **What:** Remove or mark as internal the standalone `parseSimBriefXML` and `parseSimBriefJSON` exports — only the unified `parseSimBrief` wrapper is used
- **Pre-check:** Confirm no imports of the individual functions
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
- **Effort:** ~5 min
- **Dependencies:** None

### [x] D5. Remove unused BrightnessPanel destructure

- **File:** `src/components/CockpitMode/BrightnessPanel.tsx`
- **What:** Remove unused `highContrast` and `setHighContrast` destructured variables
- **Verification:** `npm run typecheck:all` passes, lint passes
- **Effort:** ~2 min
- **Dependencies:** None

**D1–D5 are independent — execute in parallel.**

---

## Work Stream E: Type Safety Improvements (MEDIUM-LOW)

### [x] E1. Eliminate `as any` in store adapter calls

- **File:** `src/store/useFMCStore.ts`
- **What:** Exported `ZustandSet`/`ZustandGet` types from fmcScratchpadAdapter.ts; replaced 5 `set as any, get as any` callsites with `set as ZustandSet, get as ZustandGet`
- **Pattern:** Create a `StoreAdapter` type alias matching `{ set: ..., get: ... }` and use it in `fmcScratchpadAdapter.ts` function signatures
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - Grep: zero `set as any` / `get as any` remaining in useFMCStore.ts
- **Effort:** ~30 min
- **Dependencies:** Understanding of Zustand's `StoreApi` types

### [x] E2. Type the `FmcActionSuccess.patch` for handler tests

- **Files:** All test files in `shared/src/__tests__/` using `result.success?.patch as any`
- **What:** Create a test helper like `getPatch<T>(result: FmcActionResult): T` that safely narrows the patch type, replacing ~100 `as any` casts in tests
- **Verification:**
  - `npm test` passes
  - Grep: `as any` count in test files drops significantly
- **Effort:** ~45 min
- **Dependencies:** None

### [x] E3. Fix remaining production `as any` casts

- **Files and patterns:**
  - `src/components/ND/NavigationDisplay.tsx` lines 32, 34, 76: Type `autopilot` and `trafficTargets` selectors properly
  - `src/components/ND/NDControls.tsx` lines 40, 74: Type the ND mode/overlay enums properly instead of casting
  - `src/components/ND/frame/BoeingNDFrame.tsx` lines 109, 207: Same ND mode/overlay enum casting
  - `src/components/instruments/common/FMA.tsx` lines 22, 51: Type `fmc` properly for Boeing/Airbus FMA builders
  - `src/components/instruments/boeing/BoeingPFD.tsx` line 44, `src/components/instruments/airbus/AirbusPFD.tsx` line 41: Type `aggregatedState` for PFD model builder
  - `src/store/cockpitLayoutStore.ts` lines 190, 197: Type the persist middleware return
  - `shared/src/pfd/boeingPfdModel.ts` lines 10, 32 and `shared/src/pfd/airbusPfdModel.ts` lines 10, 27, 37: Map autopilot truth values to PFD display enums explicitly
  - `shared/src/fmc/pageRenderer.ts` lines 43, 55, 68: Type `token.color` to the segment color union
  - `server/src/websocketValidation.ts` line 9: Replace `data as any` with a proper type guard pattern
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
  - `npm run build` succeeds
  - Grep: `as any` count drops to near-zero in production code (excluding E2E test window exposure)
- **Effort:** ~2 hours total (can be split across files)
- **Dependencies:** Need to understand existing type unions for ND modes, PFD models, and segment colors

### [x] E4. Type loose `any` parameters in server and shared

- **Files:**
  - `src/store/alertStore.ts` line 11: `pendingUplink: any | null` → define `AcarsUplink` interface
  - `server/src/fmc-engine.ts` line 270: `createDefaultEFIS(aircraft: any)` → `AircraftType`
  - `server/src/fmc-engine.ts` line 589: `altitude?: any, speed?: any` → `AltitudeConstraint | undefined`, `SpeedConstraint | undefined`
  - `shared/src/fmc/pages/airbus/fpln.grid.ts` line 70: `constraint: any` → (kept any due to cross-domain type mismatch between FMC and navdata types)
  - `shared/src/training/scoring.ts` line 44: `criteria: any` → `PassCriteria`
- **Verification:**
  - `npm run typecheck:all` passes
  - `npm test` passes
- **Effort:** ~45 min
- **Dependencies:** None

**E1–E4 can be partially parallelized: E1 and E4 are independent; E2 is independent; E3 can be split by file.**

---

## Work Stream F: Long-term Architecture (LOW — plan only)

### F1. Decompose `useFMCStore.ts` (2,465 lines)

- **Not in this plan's execution scope** — requires design discussion
- **Proposed approach:**
  - Extract display rendering (`getDisplayData` + scratchpad injection) → `src/store/displaySlice.ts`
  - Extract waypoint/route mutations → `src/store/routeSlice.ts`
  - Extract tutorial state machine → `src/store/tutorialSlice.ts`
  - Keep LSK dispatch wiring in main store but typed properly
- **Prerequisite:** E1 (type the store adapter) should be done first
- **Effort:** ~1 day

### F2. Resolve TODO: route sequencing telemetry

- **File:** `shared/src/fmc/FmsRuntimeEngine.ts` line 56
- **What:** Replace console-based telemetry with structured event logging (same pattern as server `LogEvent`)
- **Effort:** ~30 min

### F3. Debounce RotaryKnob continuous interactions

- **File:** `src/components/instruments/common/RotaryKnob.tsx`
- **What:** Throttle `onRotate(delta)` callbacks during wheel/drag to ~60fps instead of per-pixel
- **Effort:** ~20 min

---

## Execution Order

```
Phase 1 (parallel):  A1 + A2 + A3 + A4 + A5     ← Critical fixes, ~30 min total
Phase 2 (parallel):  B1 + B2 + B3 + B4           ← Performance, ~1 hr total
Phase 3 (parallel):  C1 + C2 + C3                ← Error handling, ~30 min total
Phase 4 (parallel):  D1 + D2 + D3 + D4 + D5      ← Dead code cleanup, ~30 min total
Phase 5 (parallel):  E1 + E2 + E3 + E4           ← Type safety, ~3.5 hrs total
Phase 6 (planning):  F1 + F2 + F3                ← Architecture (future)
```

## Verification Gate (after each phase)

```bash
npm run typecheck:all    # TypeScript clean across all workspaces
npm test -- --run        # All unit tests pass
npm run build            # Production build succeeds
npm run lint             # ESLint clean
npm run format:check     # Prettier clean
npm run test:e2e:ci      # E2E smoke gate passes (after visual changes)
```

## Risk Notes

- **D3 (FBW adapter):** Requires owner decision — keep or delete
- **B4 (useShallow):** Verify zustand v4.5.2 exports `useShallow` from `zustand/react/shallow`
- **E3 (ND/PFD casts):** Largest surface area — split across files to limit blast radius per PR
- **Visual regression:** Any change to CDUDisplayGrid, CockpitLayout, or ND components must pass `npm run test:visual` before merge

---

## Task Checklist

- [x] A1. Add root ErrorBoundary in src/main.tsx
- [x] A2. Fix WebSocket onerror missing reconnect in src/services/WebSocketClient.ts
- [x] A3. Fix useAuralAlerts.ts effect fires every render
- [x] A4. Fix CellSpan memo in src/components/CDU/display/CDUDisplayGrid.tsx
- [x] A5. Safe optional chaining on nullable paths
- [x] B1. Fix Zustand over-subscriptions in ModeHelpCard and FmsInspector
- [x] B2. Memoize controls object in CockpitLayout.tsx
- [x] B3. Memoize buildBoeingMcpDisplayModel in BoeingMCP.tsx
- [x] B4. Consolidate selectors in NavigationDisplay.tsx
- [x] C1. Wrap async browser APIs in try-catch
- [x] C2. Surface background loading failures to CDU scratchpad
- [x] C3. Server tick errors notify WebSocket clients
- [x] D1. Remove legacy non-grid page renderers
- [x] D2. Clean up orphan files
- [x] D3. Register FBW A320 adapter in aircraft-adapters index
- [x] D4. Clean up unused SimBrief parser exports
- [x] D5. Remove unused BrightnessPanel destructure
- [x] E1. Eliminate as any in store adapter calls
- [x] E2. Create getPatch test helper for FmcActionResult tests
- [x] E3. Fix remaining production as any casts
- [x] E4. Type loose any parameters in server and shared
