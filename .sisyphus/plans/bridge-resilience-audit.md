# Plan: Bridge Resilience and Autopilot Sync Hardening

## Overview

This plan addresses the critical connection deadlock, client reconnection, asynchronous polling, rate-limiting, and race condition vulnerabilities discovered during the comprehensive bridge and autopilot synchronization audit. It also establishes our protocol for continuous gap discovery.

---

## 1. High-Priority Bridge Hardening

### 1.1 SimConnect Named-Pipe Timeout Wrapper

- **Objective:** Prevent the SimConnect adapter from permanently deadlocking when the simulator connection hangs.
- **Implementation:**
  - Wrap `aircraft.connect()` in a `Promise.race` with a strict `8000ms` timeout inside `server/src/bridge-server.ts`.
  - If the timeout wins, reject the promise and cleanly release the `isConnecting` lock.
- **QA Verification Scenario:**
  - **Steps:**
    1. Temporarily patch the PMDG 737 adapter `connect` method to return a promise that never resolves (e.g., `new Promise(() => {})`).
    2. Start the WebSocket server using `npm run server`.
    3. Trigger a `sim.connect` message over the socket.
    4. Assert that the server prints a connection failure after 8 seconds and that subsequent connection triggers are not blocked by a permanent `isConnecting` lock.
    5. Revert the temporary PMDG 737 connect patch.

### 1.2 Continuous Client Reconnection

- **Objective:** Enable infinite auto-reconnection for PWA kiosk installations and iPads when the bridge restarts or network is lost.
- **Implementation:**
  - Remove the hard cap of 5 attempts in `src/services/WebSocketClient.ts` (or relevant socket service).
  - Cap the exponential backoff delay at `10000ms`, continuing reconnect attempts indefinitely.
- **QA Verification Scenario:**
  - **Steps:**
    1. Open the application in the browser at `http://localhost:5173`.
    2. Shut down the Node.js server to force a disconnection.
    3. Observe the browser console logs or network inspect tab.
    4. Assert that the client continues attempting to establish a WebSocket connection every 10 seconds indefinitely, exceeding 5 attempts.
    5. Restart the Node.js server and verify that the client automatically reconnects and synchronizes state successfully.

---

## 2. Event Loop & Performance Hardening

### 2.1 Overlapping Polling Prevention

- **Objective:** Prevent high-frequency memory leaks and stack accumulation in the event loop.
- **Implementation:**
  - Refactor `setInterval(async () => { ... }, 100)` to a recursive `setTimeout` loop triggered at the end of the previous cycle's `finally` block in `bridge-server.ts`.
- **QA Verification Scenario:**
  - **Steps:**
    1. Under the recursive `setTimeout` implementation, insert a dummy delay of `500ms` inside the `readDisplay` parsing block.
    2. Start the server and connect a client.
    3. Verify that the loop wait cycles execute sequentially (spaced out by 500ms + 100ms interval) rather than piling up 5 concurrent reads in the same half-second.
    4. Revert the dummy delay.

### 2.2 Squelch Aggressive Rate Limit Abuse

- **Objective:** Prevent CPU starvation when a rogue client or infinite loop spams WebSocket payloads.
- **Implementation:**
  - Add a harsh secondary threshold to `WSRateLimiter` (e.g., > 30 payloads/sec).
  - If triggered, silently drop the connection (`ws.terminate()`) instead of serializing and writing an error payload.
- **QA Verification Scenario:**
  - **Steps:**
    1. Connect a mock client socket to the server.
    2. Program the mock client to flood `50` messages in a single second.
    3. Verify that after the rate threshold is crossed, the server calls `ws.terminate()` and closes the connection.
    4. Assert that the server does not send 50 duplicate error frames back to the client.

---

## 3. Parity & Race Condition Prevention

### 3.1 Dangling Connection Safeguard

- **Objective:** Prevent a slow pending connection promise from resolving _after_ an explicit disconnect command has been sent.
- **Implementation:**
  - Add a check `if (!shouldBeConnected) return;` inside the `.then` and `.catch` blocks of the `aircraft.connect()` invocation in `bridge-server.ts`.
- **QA Verification Scenario:**
  - **Steps:**
    1. Add a dummy delay of `2000ms` to the aircraft `connect` method.
    2. Dispatch a `sim.connect` message, and then immediately dispatch a `sim.disconnect` message within 500ms.
    3. Wait 3 seconds and assert that no phantom `"sim.connected"` status frames are broadcast to connected clients.
    4. Revert the connect dummy delay.

---

## 4. Continuous Audit & Gap Scanning Protocol

- **Objective:** Establish a routine to continually scan the monorepo for new visual, functional, and performance gaps.
- **Auditing Protocol:**
  - **Aviation Rule Scans:** Audit page handlers weekly to verify that all alphanumeric keys and LSK fields have complete range and validation checks.
  - **Visual Regressions:** Run Full Deck visual snapshots across iPad/Retina profiles after any styling or layout adjustments.
  - **Performance Profiling:** Verify PFD/ND frame draw rates periodically to prevent selector regressions.
