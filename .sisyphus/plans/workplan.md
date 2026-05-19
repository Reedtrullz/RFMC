# Workplan: RFMS Monorepo Quality & Safety Enhancements

**Date:** 2026-05-20
**Status:** Draft (Awaiting Momus Review)

This workplan addresses all 13 issues and gaps identified during the comprehensive codebase audit. The fixes are structured into 4 sequential phases for safe, non-destructive rollout.

---

## Phase 1: Memory Management & Lifecycle Teardowns (High Priority)

### 1. FMCEngine 10Hz tick loop leak

- **Target File:** `/Users/reidar/Projectos/RFMS/server/src/bridge-server.ts`
- **Fix Action:**
  Invoke `fmc.destroy()` inside the `stop()` lifecycle hook of `createBridgeServer` to clear the `10Hz` tick interval cleanly on server shutdown.
- **Verification:** Run server lifecycle tests to verify the background thread closes instantly without dangling timers.

### 2. Process Shutdown Unhandled Rejection

- **Target File:** `/Users/reidar/Projectos/RFMS/server/src/index.ts`
- **Fix Action:**
  Append a `.catch((err) => { ... })` handler to the `void shutdown()` promise call inside the `SIGINT` signal listener to log and swallow cleanly any teardown errors.
- **Verification:** Trigger process termination during active bridge polling and check logs.

---

## Phase 2: WebSocket Communication & State Sync (High Priority)

### 3. Keystroke Rate-Limiting Queue Leakage (Offline Queue Trap)

- **Target File:** `/Users/reidar/Projectos/RFMS/src/services/WebSocketClient.ts`
- **Fix Action:**
  Implement a periodic flushing mechanism. When a message is rate-limited and pushed to `offlineQueue`, schedule a `setTimeout` (or a window-aligned throttled check) to flush the queue once the sending rate window clears, instead of only flushing on initial socket open.
- **Verification:** Simulate rapid keyboard input (exceeding 8 keys/sec) and verify that all characters are eventually typed and correctly rendered on the CDU screen without loss.

### 4. Synchronous Broadcast Write Failure Isolation

- **Target File:** `/Users/reidar/Projectos/RFMS/server/src/bridge-server.ts`
- **Fix Action:**
  Wrap the `client.send()` loop inside the server `broadcast()` method with a `try/catch` block so that an abrupt connection loss on one socket does not crash the loop or halt messages to other active clients.
- **Verification:** Drop a client TCP connection mid-broadcast and verify the server remains fully stable.

### 5. Stale Telemetry States on WebSocket Disconnect

- **Target File:** `/Users/reidar/Projectos/RFMS/src/services/WebSocketClient.ts`
- **Fix Action:**
  Update `setStatus('DISCONNECTED')` to explicitly reset telemetry properties (`aircraftState`, `simVariables`, `connectedAircraft`, `connectedCapabilities`, `structuredCapabilities`, `adapterHealth`) back to `null`/empty objects in `useConnectionStore` and `useAircraftStore`.
- **Verification:** Terminate MSFS/bridge connection; confirm that ND, MCP, and annunciators reset to blank or standalone defaults instead of showing stale last-frame telemetry.

### 6. Promise.race Timeout Rejection Catch

- **Target File:** `/Users/reidar/Projectos/RFMS/server/src/bridge-server.ts`
- **Fix Action:**
  Append `.catch(() => {})` directly to the `connectPromise` returned by `aircraft.connect()` inside the `attemptReconnect()` loop, ensuring that if it rejects after the 8-second timeout wins, the rejection is handled.
- **Verification:** Simulate a slow SimConnect connection that takes >8s and confirm no unhandled promise warnings appear.

---

## Phase 3: Aviation Validation Bounding (Medium Priority)

### 7. Stabilizer Trim Range Limits

- **Target File:** `/Users/reidar/Projectos/RFMS/shared/src/fmc/actionHandlers/takeoffActions.ts`
- **Fix Action:**
  Enforce Boeing 737 physical trim limitations in `set_trim` logic. Reject entries outside the authentic range `[0.0, 17.0]` units with an `OUT_OF_RANGE` error code.
- **Verification:** Input trim values like `-1` or `18` in the scratchpad and verify that "OUT OF RANGE" is returned in the scratchpad.

### 8. ILS Course Heading Bounds

- **Target File:** `/Users/reidar/Projectos/RFMS/shared/src/fmc/actionHandlers/landingActions.ts`
- **Fix Action:**
  Check that the ILS course value entered lies strictly between `1` and `360` degrees inside the `set_ils_course` handler.
- **Verification:** Input `0` or `361` and verify that the scratchpad reports "OUT OF RANGE".

### 9. Decision Height (DH) and Minimum Descent Altitude (MDA) Validation

- **Target File:** `/Users/reidar/Projectos/RFMS/shared/src/fmc/actionHandlers/landingActions.ts`
- **Fix Action:**
  Enforce logical boundaries on altitude minimums (e.g., must be non-negative and capped at `10,000` ft).
- **Verification:** Attempt entering negative descent altitudes; confirm they are rejected.

### 10. Fuel Reserve Safety Bounds

- **Target File:** `/Users/reidar/Projectos/RFMS/shared/src/fmc/actionHandlers/performanceActions.ts`
- **Fix Action:**
  Add a validation check to compare entered fuel reserve against total fuel quantity, ensuring the pilot cannot enter a reserve value that exceeds the fuel capacity or total fuel currently on board.
- **Verification:** Enter a reserve of `99999` and verify that an error occurs.

---

## Phase 4: Type-Safety Alignment & Dead Code (Low Priority)

### 11. Redundant `as any` Cleanup

- **Target Files:** `/Users/reidar/Projectos/RFMS/server/src/fmc-engine.ts`, `/Users/reidar/Projectos/RFMS/shared/src/fmc/NavDatabaseService.ts`
- **Fix Action:**
  Remove redundant `as any` type assertions from aligned properties (e.g., `'VA'`, `autopilot.truth`, `'PREFLIGHT'`) to restore strict compile-time checking.
- **Verification:** Confirm that TypeScript compiles successfully with zero warnings/errors.

### 12. Dead write `takeoff.qnh` Property Elimination

- **Target File:** `/Users/reidar/Projectos/RFMS/shared/src/fmc/actionHandlers/landingActions.ts`
- **Fix Action:**
  Remove the duplicate assignment `takeoff: { ...state.takeoff, qnh: qnh * 100 }` from `landingActions.ts` as `QNH` is already correctly managed under `takeoff` dynamically in POS/PERF.
- **Verification:** Ensure that QNH adjustments still function correctly via POS/landing validation.
