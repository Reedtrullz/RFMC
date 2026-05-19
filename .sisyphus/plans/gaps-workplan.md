# Workplan: Flight Deck Simulation Optimization & Hardening

**Plan Status:** Approved  
**Target Workspaces:** `shared` (FMS guidance, logic), `src` (UI, rendering), `server` (bridge, WebSocket)

This document maps out the implementation and verification pathways for resolving outstanding bugs, optimization gaps, and architectural inconsistencies across the simulation monorepo.

---

## Phase 1: Autoflight & VNAV Flight Dynamics Hardening

### 1.1 VNAV Cruise Compression for Short Routes

- **Task:** Integrate cruise altitude compression in `vnavPrediction.ts` to resolve climb-descent phase overlaps.
- **Details:**
  - If route length is shorter than the sum of climb and descent profiles ($\text{dist}_{\text{route}} < \text{dist}_{\text{climb}} + \text{dist}_{\text{descent}}$), dynamically calculate a compressed peak target altitude.
  - Clamp the calculated vertical path profile to this peak. Do NOT mutate user-entered `crzAlt` in `performance` state directly (to preserve MCDU display realism); instead, use an internal `clampedCruiseAltitude` variable for VNAV guidance calculations.
  - Ensure waypoint altitude constraints (e.g., restrictions on SIDs/STARs) override the calculated compression.
- **Verification:** Run unit tests in `vnavPrediction.test.ts` using simulated routes of $25\text{ NM}$, $40\text{ NM}$, and $150\text{ NM}$.

### 1.2 Height Above Threshold (HAA) Approach Transitions

- **Task:** Refactor the approach phase gate inside `PhaseManager.ts`.
- **Details:**
  - Change descent-to-approach transition to trigger based on **Height Above Airport/Threshold (HAA)** ($3,000\text{ ft}$ above landing runway elevation) rather than raw MSL or local AGL terrain to prevent premature terrain-clearance triggers over mountainous regions.
  - Implement safe fallback handling: if the destination airport has undefined elevation, default gracefully to sea level ($0\text{ ft MSL}$) or static descent transition altitude.
- **Verification:** Run transition scenarios using high-elevation airports KDEN ($5,434\text{ ft}$) and SLLP ($13,323\text{ ft}$).

### 1.3 `ALT*` Exponential Altitude Capture State

- **Task:** Implement `ALT*` altitude capture transition in `AutoflightModeManager.ts` and `boeingMcpLogic.ts`.
- **Details:**
  - When approaching target altitude ($|\Delta h| < 1000\text{ ft}$), transition from pitch rate control to an asymptotic vertical speed capture:
    $$VS_{\text{target}} = VS_{\text{entry}} \times \left(1 - e^{-k \cdot |\Delta h|}\right)$$
  - To resolve the infinite mathematical asymptote issue, trigger a definitive cutoff transition to `ALT HOLD` and set vertical speed to exactly $0$ when altitude error $|\Delta h| \le 20\text{ ft}$.
- **Verification:** Verify vertical speed needle rounding and armed-to-active mode switches.

---

## Phase 2: FMS Flight Plan Parser, Leg Sequencing & Mod Lifecycle

### 2.1 "Null Island" and NaN Coordinate Safeguard

- **Task:** Eliminate the coordinate default loop inside `LegSequencer.ts` and `routeExpansion.ts`.
- **Details:**
  - Never default missing waypoint coordinates to `0,0`.
  - If a parsed waypoint or procedure leg cannot be resolved in the database, explicitly mark its state as `UNRESOLVED` and disable LNAV engagement, raising a `'NAV DATA OUT'` scratchpad warning.
  - Protect `distanceNm` calculations from `NaN` contamination by adding explicit validation gates.
- **Verification:** Verify that unrecognized custom waypoint inputs block route execution instead of steering the ND line to Null Island.

### 2.2 Leg Sequencing: Duplicate Identifiers and Direct-To Clearing

- **Task:** Secure sequencing and `DIRECT TO` jumps inside `LegSequencer.ts` and `lnavState.ts`.
- **Details:**
  - Update `findIndex` lookups to filter using the current flight plan progress index (only matching subsequent waypoints) to prevent duplicate waypoint jumps from snapping the aircraft backward.
  - Ensure the active `directTo` attribute is cleared from FMS state once the aircraft crosses the direct-to threshold or sequences to the next leg.
- **Verification:** Run test scenarios routing multiple legs through a single repeating waypoint (e.g., airway loops).

### 2.3 Procedure Expansion Runway Transition Filter

- **Task:** Prevent overlapping waypoints in `routeExpansion.ts`.
- **Details:**
  - Filter SID and STAR expansions to include only the legs belonging to the actively selected runway or airport transition. Do not append all transition options sequentially.
- **Verification:** Assert that selecting a SID with multiple runway profiles outputs only a single, contiguous leg sequence.

---

## Phase 3: High-Performance UI Rendering Loops

### 3.1 Zustand Atomic Selectors & Bezel Optimization

- **Task:** Refactor `src/components/CDU/Display.tsx` to subscribe to atomic state slices using Zustand's `useStore(selector, shallow)` to prevent full display redraws when global variables mutate.
- **Verification:** Assert that typing a character in the keypad updates the scratchpad element without triggering layout passes on on-screen VOR/Navaid text matrices.

### 3.2 Scratchpad Render Isolation

- **Task:** Decouple `Scratchpad.tsx` into a separate, isolated layout element to prevent keypress events from redrawing the primary CRT screen scanlines.

---

## Phase 4: Telemetry Jitter & WebSocket Resilience

### 4.1 Compass Wrap-Around Linear Interpolation

- **Task:** Add high-frequency client-side linear interpolation (lerp) inside PFD and ND instrument loops.
- **Details:**
  - Interpolate heading, roll, and pitch telemetry frames.
  - To prevent ND compass rose spinning $360^\circ$ in the wrong direction during north crossings ($359^\circ \leftrightarrow 1^\circ$), interpolate using angular shortest distance:
    $$\Delta\theta = ((\theta_{\text{target}} - \theta_{\text{current}} + 180) \bmod 360) - 180$$
    $$\theta_{\text{next}} = \theta_{\text{current}} + \Delta\theta \times \text{interpolationFactor}$$

### 4.2 Jittered Exponential Backoff Reconnections

- **Task:** Deploy a robust reconnection backoff in `WebSocketClient.ts` to avoid pilot-copilot tablet thundering herd blocks:
  $$\text{delay} = \min(\text{delay}_{\text{max}}, \text{delay}_{\text{base}} \times 2^{\text{attempt}}) + \text{Random}(0, 1500)\text{ ms}$$

### 4.3 Database Loading Transaction Checkpoints

- **Task:** Implement intermediate progress checkpoints in `navDataLoader.ts`.
- **Details:** Write progress state to the `metadata` store periodically. If a crash or refresh occurs, resume from the last successful batch chunk instead of performing a full database wipe.
