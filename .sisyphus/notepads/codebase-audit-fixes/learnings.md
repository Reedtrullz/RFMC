# Codebase Audit Fixes Learnings

## Add Root ErrorBoundary in `src/main.tsx`

- We successfully wrapped the root `<App />` component in the pre-existing `<ErrorBoundary>` from `src/components/ErrorBoundary.tsx`.
- Checked and confirmed that `ErrorBoundary` has a clean full-page crash fallback out of the box featuring a gorgeous green-on-black/CRT Boeing-themed "SYSTEM ERROR" display.
- Verified that all workspace packages correctly typecheck via `npm run typecheck:all`.
- Verified that all 845 tests pass without any regressions.

## WebSocket `onerror` missing reconnect trigger in `src/services/WebSocketClient.ts`

- Added `this.ws?.close()` and `this.scheduleReconnect()` inside `onerror` handler in `WebSocketClient`.
- This ensures that if a WebSocket connection encounters an error, the connection is closed to trigger the `onclose` callback as a fallback and an automatic reconnect attempt is scheduled.
- Verified using `npm run typecheck:all` that all workspaces still compile and checked that all 845 unit tests pass successfully.

## Fix `useAuralAlerts.ts` effect firing every render

- Replaced the inline `fma` object (`const fma = { lateralActive, verticalActive, thrustActive }`) inside the `useAuralAlerts` dependency array with its destructured primitive properties (`lateralActive`, `verticalActive`, `thrustActive`).
- Reconstructed the `JSON.stringify` calls inside the hook locally on demand (e.g. `JSON.stringify({ lateralActive, verticalActive, thrustActive })`) to avoid creating a new object reference on every render that triggers unnecessary hook executions.
- Verified compilation and that all 845 tests continue to pass.

## Fix `CDUDisplayGrid.tsx` — CellSpan memo ineffective

- Added a custom comparison function to `React.memo` wrapping `CellSpan` in `src/components/CDU/display/CDUDisplayGrid.tsx`.
- The custom comparator compares primitive properties inside `cell` (`row`, `col`, `char`, `color`, `size`, `blink`, `inverse`, `semantic`) and the `variant` prop.
- Since `buildCells` returns a fresh list of cell object references on every grid update, a custom comparator is required to avoid shallow comparison failures on the `cell` object reference.
- Verified compilation with `npm run typecheck:all` and that all 845 unit tests pass.

## Fix non-null assertions on nullable paths

- Replaced `state.pendingRoute!.directTo` with safe optional chaining `state.pendingRoute?.directTo` in `shared/src/fmc/navigationDisplay.ts`.
- Replaced `data.waypoints!.find(...)` with safe optional chaining `data.waypoints?.find(...)` in `src/store/useFMCStore.ts`.
- Verified that these optional chains compile correctly, all workspaces pass typecheck via `npm run typecheck:all`, and all 845 unit tests pass.

## Fix Zustand over-subscriptions

- **ModeHelpCard.tsx**: Replaced the broad `useFMCStore()` hook invocation with four narrow slice selectors subscribing only to `currentPage`, `aircraft`, `flightPhase`, and `tutorialActive`. Used `useFMCStore.getState()` inside the component logic to retrieve the full un-subscribed state for `buildTrainingProgress` input, avoiding excessive re-renders during active CDU typing. Utilized explicit `void` discards to satisfy TypeScript strict unused variable checks.
- **FmsInspector.tsx**: Replaced the entire-store subscription `useFMCStore((s) => s as unknown as FMCState)` with ten individual narrow field/sub-state selectors (`route`, `flightPlan`, `performance`, `takeoff`, `landing`, `position`, `execLit`, `isModified`, `pendingFlightPlan`, `pendingRoute`).
- **Memoization**: Wrapped the creation of `modelState` in `useMemo` with all sub-states as dependencies, and memoized the heavy flight path predictions (`buildLnavState`, `buildVnavPrediction`, `buildPerformancePrediction`) to drastically reduce recalculation overhead.
- Verified that `npm run typecheck:all` compiles with no diagnostics/errors and that all 845 unit tests pass successfully.

## Memoize `controls` object in `CockpitLayout.tsx`

- Memoized the dynamic `controls` object inside `src/components/CockpitMode/CockpitLayout.tsx` using `useMemo`.
- Stored/nested the `hiddenPanels` and `pinnedPanels` `Set` objects and callbacks cleanly inside `useMemo` dependencies to prevent constant recreation of object references on every render.
- Verified that `npm run typecheck:all` compiles successfully with no errors.

## Memoize `buildBoeingMcpDisplayModel` in `BoeingMCP.tsx`

- Wrapped the call to `buildBoeingMcpDisplayModel(state, truth)` in a `useMemo` hook with `[state, truth]` dependencies.
- This prevents the expensive model generator from recalculating on every visual update (such as cursor or text blinking), optimizing the MCP display rendering performance.
- Verified that all workspace packages typecheck cleanly via `npm run typecheck:all` and all 845 unit tests continue to pass.

## Consolidate NavigationDisplay selectors in `NavigationDisplay.tsx`

- Replaced 15 individual `useFMCStore` narrow selectors in `src/components/ND/NavigationDisplay.tsx` with a single unified selector wrapped inside `useShallow` from `zustand/react/shallow`.
- This ensures optimized subscription performance while maintaining clean, legible component selectors.
- Verified that all workspace packages compile cleanly via `npm run typecheck:all` and all 845 unit tests continue to pass.

## Wrap async browser APIs in try-catch

- Wrapped `await resumeAudioContext()` inside a `try-catch` wrapper in `src/hooks/useSound.ts` and `src/services/AuralAlertService.ts` to gracefully catch and log initialization blockages.
- Wrapped `await sentinel.release()` inside a `try-catch` wrapper in `src/hooks/useWakeLock.ts` to prevent uncaught runtime rejections when releasing the browser screen lock.
- Verified that all workspace packages typecheck cleanly via `npm run typecheck:all` and all 845 unit tests pass successfully.

## Surface background loading failures to UI

- Handled the catch block inside `loadProceduresIntoCache` calls in `src/store/useFMCStore.ts` by surfacing the failure to the CDU display.
- Added invocation of `failScratchpad(set as any, get as any, 'PROC DATA UNAVAIL')` inside the `.catch()` block when loading arrival/destination procedures fails.
- Verified compilation and successfully ran the test suite (845 tests passed) with no regressions.

## Server tick errors → notify WebSocket clients

- Added an optional `onError` callback interface to the `FMCEngine` class.
- Modified the periodic 10Hz engine tick loop in `server/src/fmc-engine.ts` to call this `onError` handler on caught runtime errors and clean up resources by properly destroying the tick interval (`this.destroy()`).
- Updated the WebSocket bridge server initialization in `server/src/bridge-server.ts` to instantiate `FMCEngine` with an `onError` listener that broadcasts `{ type: 'error', message: 'Engine sync error' }` directly to all connected clients.
- Wrote a dedicated unit test in `server/src/__tests__/fmc-engine.test.ts` to verify that `onError` is correctly invoked and the tick loop is terminated when an engine tick error occurs.
- Verified that all workspace packages typecheck cleanly via `npm run typecheck:all` and all 846 unit tests pass successfully.

### Legacy Non-Grid Renderer Cleanup

- Successfully deleted legacy non-grid page renderers `renderPosInitPage`, `renderTakeoffRefPage`, and `renderRtePage`.
- Removed unused helper functions `clampDisplayText`, `composeLegacyDisplayLine`, and `displayLineToSegments`.
- Cleaned up unused imports/parameters and resolved all compiler diagnostics and test failures.
- Monorepo typechecking (`npm run typecheck:all`) and Vitest suites successfully pass.

## Clean up orphan files

- Deleted root `test.ts` and `scratch/testNavdata.ts`.
- Confirmed that neither file was referenced or imported anywhere else in the codebase.
- Verified that both compilation (`npm run build` and `npm run typecheck:all`) and the unit tests pass perfectly post-deletion.

## Register FBWA320Adapter in index factory

- Formally registered `FBWA320Adapter` inside the `createAircraftAdapter` factory within `server/src/aircraft-adapters/index.ts`.
- Structured the registry dynamically using `require` statements scoped to `process.platform === 'win32'` checks. This ensures `node-simconnect` (a native C++ SimConnect binding) is only loaded in Windows MSFS environments, preventing import/runtime failures on Linux CI/CD or macOS development setups.
- Updated `server/src/__tests__/aircraft-adapter-factory.test.ts` to mock the newly registered `./fbw-a320` module and verify that it correctly throws the environment restriction error under non-Windows/CI setups.
- Verified that all workspace packages compile cleanly via `npm run typecheck:all` and all unit tests continue to pass successfully.

## Remove unused BrightnessPanel destructure in `BrightnessPanel.tsx`

- Removed unused `highContrast` and `setHighContrast` destructured fields from the `useCockpitLayoutStore` hook call in `src/components/CockpitMode/BrightnessPanel.tsx`.
- Verified that all workspace packages compile cleanly via `npm run typecheck:all`.
