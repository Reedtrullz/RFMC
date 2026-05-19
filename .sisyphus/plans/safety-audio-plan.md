# Workplan: Premium Safety Advisory & Aural Alert Hardening

**Plan Status:** Approved  
**Target Workspaces:** `shared` (safety engines, aural alerts), `src` (audio hooks, client playback)

This document maps out the logical, mathematical, and performance enhancements to harden our GPWS terrain alerts, TCAS 3D threat sequencing, Web Audio singletons, and speech synthesis pipelines.

---

## Phase 1: High-Fidelity Safety Advisory Systems (GPWS & TCAS)

### 1.1 Asymmetric TCAS 3D Threat Envelopes & ND Range Normalization

- **Task:** Polish `TcasEngine.ts` to calculate accurate 3D threat bubbles based on active TCAS modes.
- **Details:**
  - Implement asymmetric vertical separation boundaries based on selected TCAS target modes:
    - **ABOVE Mode:** Searches $+9,000\text{ ft}$ above and $-2,700\text{ ft}$ below the aircraft.
    - **BELOW Mode:** Searches $-9,000\text{ ft}$ below and $+2,700\text{ ft}$ above the aircraft.
    - **NORMAL Mode:** Searches $\pm 2,700\text{ ft}$ vertically.
  - Convert intruder relative coordinate coordinates ($0\text{-}100$) into physical nautical miles (NM) dynamically, using the active Navigation Display zoom range parameter to prevent unit mismatches.
- **Verification:** Write unit tests demonstrating that an intruder $3,000\text{ ft}$ below in ABOVE mode triggers exactly $0$ alerts.

### 1.2 Intruder-Specific Threat Throttling & Live SimConnect TCAS

- **Task:** Track alert timestamps per unique aircraft identifier rather than globally inside `TcasEngine.ts`.
- **Details:**
  - Replace the static global `lastAlertTime` with an intruder-specific alert mapping (`Map<string, number>`).
  - Enable the TCAS engine to receive active target lists during live SimConnect telemetry sessions, mapping MSFS surrounding aircraft coordinates.

### 1.3 GPWS Mode 3 Go-Around Cumulative Altitude Protection

- **Task:** Refactor GPWS Mode 3 ("Don't Sink") inside `GpwsEngine.ts` to use cumulative altitude loss instead of instantaneous vertical speed limits.
- **Details:**
  - Actively cover both `TAKEOFF` and `GO_AROUND` flight phases.
  - Calculate and track the peak altitude achieved since phase initiation. Trigger the alert only if the aircraft sinks below the peak altitude by a dynamic margin (e.g. $10\%$ of altitude or a minimum of $50\text{ ft}$), preventing nuisance alerts during normal pitch adjustments.

---

## Phase 2: Web Audio Resiliency & Context Singletons

### 2.1 AudioContext Singleton and Browser Autoplay Resumption

- **Task:** Refactor `useSound.ts` and `AuralAlertService.ts` to utilize a single global `AudioContext` singleton.
- **Details:**
  - Completely eliminate browser context exhaustion by sharing a lazily-instantiated `globalAudioContext` instance across all React components and static services.
  - Decouple the React component unmount lifecycle from the context: **never call `.close()`** on the global `AudioContext` singleton when a component unmounts; only dispose of active oscillators and gain nodes.
  - Properly await the asynchronous `.resume()` Promise when browser autoplay policies suspend the context, ensuring oscillator schedules are deferred until context states are `'running'`.
- **Verification:** Run multi-button keypad tests to confirm zero context crashes.

### 2.2 Abortable Sound Alerts

- **Task:** Keep references to active scheduled gain/oscillator nodes to allow sound cancellation if warning states clear.
