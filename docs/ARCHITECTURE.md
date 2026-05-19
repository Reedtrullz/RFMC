# Architecture

**Last updated:** 2026-05-16

This document describes the system architecture of VirtualCDU — a Boeing 737 NG FMC / Airbus A320 MCDU trainer with MSFS 2020 integration.

## Monorepo Structure

```
RFMS/
├── shared/                  # Shared types and FMC logic (workspace: @virtual-cdu/shared)
│   └── src/
│       ├── types/           # FMCState, DisplayData, WebSocket types
│       └── fmc/             # Page functions, parsers, nav data, engines
├── src/                     # React frontend (workspace: @virtual-cdu/frontend)
│   ├── components/          # CDU, ND, instruments, cockpit, training
│   ├── hooks/               # useTouchFeedback, useWebSocket, useCDUKeyboard
│   └── store/               # Zustand state management
├── server/                  # Node.js backend (workspace: @virtual-cdu/server)
│   └── src/
│       ├── aircraft-adapters/ # SimConnect adapters (PMDG 737, FBW A320, WT CJ4)
│       └── index.ts         # Express + WebSocket server
└── e2e/                     # Playwright E2E and visual regression tests
```

## Display Pipeline

The display pipeline transforms FMC application state into rendered CDU/MCDU screens:

```
FMCState (Zustand)
    │
    ▼
Page Renderer (e.g., renderBoeingIdentGrid)
    │  Returns DisplayData with DisplaySegment[]
    ▼
displayDataToGrid()
    │  Converts segments to GridDisplayData (14 rows × 24 cols)
    ▼
CDUDisplayGrid (React component)
    │  Renders CSS Grid with per-cell characters
    ▼
ScreenGlass (CRT/LCD effects)
    │  Scanlines, phosphor glow, vignette, reflection
    ▼
InstrumentShell (bezel, screws, depth)
```

### Key Design Decision: Pre-computed grid

Instead of the legacy `DisplayLine[]` approach (padding strings to exact width), pages now produce `DisplaySegment[]` arrays with precise (row, col) coordinates. This enables deterministic cell placement, overflow detection in tests, and aircraft-specific color/size behavior.

## Store Architecture

The state is split across 8 purpose-focused Zustand stores:

| Store                  | Purpose                           | Key State                               |
| ---------------------- | --------------------------------- | --------------------------------------- |
| `fmcStore`             | FMC page state and input handling | scratchpad, route, performance, takeoff |
| `aircraftStore`        | Aircraft configuration and mode   | Boeing/Airbus selection, annunciators   |
| `autopilotStore`       | Autopilot modes and state         | Boeing MCP or Airbus FCU state          |
| `cockpitLayoutStore`   | Layout and display configuration  | mode, zoom, brightness, hidden panels   |
| `connectionStore`      | Simulator connection status       | WebSocket state, adapter health         |
| `alertStore`           | Central alert/event bus           | Message queue, warning state            |
| `trainingStore`        | Tutorial and training state       | active scenario, highlighted steps      |
| `displaySettingsStore` | Display render settings           | renderer choice, effect intensity       |

### Selector Pattern

All stores use selector-based subscriptions to prevent unnecessary re-renders in display-heavy components. Components subscribe only to the specific state slices they need.

## Aircraft Split

The application supports two aircraft families with strict separation:

| Layer               | Boeing 737 CDU                                                   | Airbus A320 MCDU                                      |
| ------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| **Component shell** | `Boeing737CDU.tsx`                                               | `AirbusMCDU.tsx`                                      |
| **Hardware**        | `BoeingCDUShell`, `BoeingDisplayBay`, `BoeingAlphaNumericKeypad` | `AirbusMCDUShell`, `AirbusDisplayBay`, `AirbusKeypad` |
| **Display colors**  | Green-on-black CRT                                               | Amber/green-on-black LCD-CRT hybrid                   |
| **Token file**      | `boeing-cdu.tokens.ts`                                           | `airbus-mcdu.tokens.ts`                               |
| **Page functions**  | `shared/src/fmc/pages/boeing/*.grid.ts`                          | `shared/src/fmc/pages/airbus/*.grid.ts`               |
| **Terminology**     | FMC, CDU, EXEC, VNAV, LNAV                                       | FMGC, MCDU, INSERT, MANAGED, SELECTED                 |

### Shared Primitives Only

The following are shared between aircraft families:

- `CDUDisplayGrid` — CSS grid rendering engine
- `InstrumentShell` — bezel, screws, edge highlighting
- `ScreenGlass` — CRT/LCD post-processing effects
- `AvionicsKey` — keycap with bevel, press, hover states
- `AnnunciatorLight` — indicator lights (FAIL, MSG, OFST)
- `GeometryProfiles` and `EffectProfiles` — configuration primitives

Page definitions, colors, terminology, workflows, validation rules, and scratchpad behavior are aircraft-specific.

## FMC Engine (shared/)

The shared workspace contains the core FMC logic:

| Module                         | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `fmc/displayGrid.ts`           | Segment-to-grid conversion (displayDataToGrid, buildCells) |
| `fmc/displayBuilder.ts`        | DisplayData construction from FMC state                    |
| `fmc/displayColors.ts`         | Boeing/Airbus color tokens                                 |
| `fmc/validation.ts`            | ICAO, altitude, speed, V-speed, wind validation            |
| `fmc/scratchpadEngine.ts`      | 8-level MessagePriority queue with validation lifecycle    |
| `fmc/routeModel.ts`            | Route discontinuity as first-class typed object            |
| `fmc/routeModification.ts`     | EXEC lifecycle state machine (NONE → MODIFIED → EXECUTED)  |
| `fmc/FmsRuntimeEngine.ts`      | Main FMC tick loop                                         |
| `fmc/LegSequencer.ts`          | Route waypoint sequencing                                  |
| `fmc/PhaseManager.ts`          | Flight phase inference                                     |
| `fmc/VerticalProfileEngine.ts` | VNAV path computation (TOD, deviation)                     |
| `fmc/PerformanceEngine.ts`     | Takeoff speed, fuel flow calculations                      |
| `fmc/NavDatabaseService.ts`    | Demo navdata (airports, runways, fixes, navaids)           |

## Route Model and Navdata

### Route Entry Types

```ts
type RouteEntry = FlightPlanWaypoint | RouteDiscontinuity;

type RouteDiscontinuity = {
  id: string;
  sequence: number;
  isDiscontinuity: true;
  legType: 'DISCONTINUITY';
  source: 'sid_star_mismatch' | 'deleted_leg' | 'airway_gap' | 'manual';
  cleared: boolean;
};
```

Route discontinuities are first-class route objects, not boolean flags on waypoints. They can be inserted, cleared, and resolved through the route model.

### Navdata

The `NavDatabaseService` provides demo navdata (airports, runways, fixes, navaids, SIDs, STARs, approaches) for validation and route building. Real-world navdata import (ARINC 424, CIFP, Navigraph) is deliberately out of scope — the trainer uses fixture data only.

## Guidance System

| System      | Module                  | Responsibility                                           |
| ----------- | ----------------------- | -------------------------------------------------------- |
| **LNAV**    | `LegSequencer`          | Active waypoint tracking, route sequencing, direct-to    |
| **VNAV**    | `VerticalProfileEngine` | Top of descent, path deviation, required vertical speed  |
| **RNP/ANP** | `fmc/fmsNavigation.ts`  | Navigation accuracy modeling, alert when ANP exceeds RNP |

## Simulator Integration

```
Browser (React) ←→ WebSocket (port 8080) ←→ Node.js Bridge ←→ SimConnect ←→ MSFS 2020
```

The bridge runs as a Node.js Express + WebSocket server. It uses an aircraft adapter pattern:

- `IAircraftAdapter` — contract interface
- `PMDG737Adapter` — PMDG 737-specific SimConnect mapping
- Future adapters for FBW A320, Working Title CJ4

In standalone/offline mode, the frontend owns FMC state entirely (Zustand). In connected mode, the backend becomes authoritative and the frontend acts as a thin display client.

## Design Decisions

1. **Pre-computed grid over line padding** — Enables test-time overflow detection and deterministic rendering
2. **Strict aircraft separation** — Boeing and Airbus pages, colors, workflows are deliberately separate (not parameterized)
3. **Split stores** — Each concern (FMC, layout, autopilot, training) has its own store to prevent monolithic state
4. **Selector subscriptions** — Components use fine-grained selectors to avoid whole-store re-renders
5. **Demo navdata only** — Real-world navdata import is a massive scope increase; fixture data covers training scenarios
6. **No router** — Single-page application with mode-based page switching (no React Router needed)
7. **Touch-first** — 44px touch targets, iOS safe areas, PWA support for cockpit mounting
