# RFMC / VirtualCDU

A web-based Boeing 737 NG CDU/FMC trainer with scoped Airbus A320 MCDU support, cockpit-mode instruments, offline PWA use, and an optional MSFS bridge.

[https://fmc.reidar.tech](https://fmc.reidar.tech)

## What This Is

RFMC is a browser-based avionics procedure trainer for learning CDU/MCDU flows, route setup, cockpit scanning, navigation-display interpretation, and trainer-level autoflight concepts.

It is not certified training software, is not approved for real-world aviation operations, and does not provide operational performance or navigation data.

## Current Status

Current validation results live in [docs/STATUS.md](docs/STATUS.md). This README intentionally avoids copying live test counts.

Implemented foundations include:

- Boeing 737 CDU/FMC trainer pages and workflow foundations.
- Scoped Airbus A320 MCDU pages with explicit functional/display-only boundaries.
- Cockpit mode with CDU/MCDU, ND, PFD, MCP/FCU, task modes, focused panels, and iPad-oriented layout support.
- Typed LSK dispatcher, centralized scratchpad/message handling, and EXEC/MOD lifecycle helpers.
- Cockpit, ND, PFD, focused-panel, tablet, 3456x2234, and Retina-equivalent visual baselines.
- Shared trainer-grade LNAV, VNAV, autoflight, PFD, and performance display models.
- Mock-tested backend CONTROL-mode bridge foundations.
- PWA/offline foundations for installed iPad and desktop use.

Important boundaries:

- Visual snapshots prove render stability, not hardware pixel accuracy.
- Hardware fidelity is not claimed until rights-cleared references are measured.
- PMDG/MSFS live validation requires Windows + MSFS + PMDG and is tracked separately in [docs/MSFS_LIVE_VALIDATION.md](docs/MSFS_LIVE_VALIDATION.md).
- Airbus remains secondary scope behind the Boeing workflow.

## Features

### Boeing 737

- IDENT, POS INIT, RTE, DEP/ARR, LEGS, PERF INIT, THRUST LIM, TAKEOFF REF, N1 LIMIT, PROGRESS, HOLD, FIX, CLB, CRZ, DES, DIR INTC, and MENU foundations.
- Route parsing, terminal procedure selection, V-speed validation, takeoff runway invalidation, HOLD staging, FIX overlays, direct-to state, and trainer-grade PROGRESS/LNAV/VNAV cues.
- Scratchpad validation for aviation-style entries such as ICAO identifiers, V-speeds, QNH, winds, and temperatures.

### Airbus A320

- INIT A/B, F-PLN, DEP/ARR, PERF TAKEOFF, PROG, FUEL PRED, PERF APPR, RAD NAV, SEC F-PLN, DATA INDEX, and MCDU MENU foundations.
- Airbus-specific page labels, colors, managed/selected terminology, FCU presentation, and scoped page status.
- Secondary pages remain explicitly trainer/display scoped unless their data entry and backend behavior are implemented.

### Cockpit Instruments

- CDU/MCDU hardware-style panels.
- Boeing and Airbus Navigation Display presentations.
- Boeing and Airbus PFD presentations with trainer-grade FMA state.
- Boeing MCP and Airbus FCU visual controls.
- Task modes for FMC focus, navigation, automation, approach, full deck, and free practice.
- State-aware help cards driven by current FMC/autoflight progress.

## Screenshots

Current screenshot baselines are maintained through Playwright visual tests under `e2e/*-snapshots/` and documented in [docs/VISUAL_REALISM.md](docs/VISUAL_REALISM.md). Public-facing screenshots should be refreshed from the current visual baseline workflow before a release.

## Installation

```bash
git clone https://github.com/Reedtrullz/RFMC.git
cd RFMC
npm install
```

## Development Commands

```bash
npm run dev            # Vite dev server on :5173
npm run server         # WebSocket bridge on :8080
npm run build          # Production build
npm run typecheck:all  # TypeScript for shared/frontend/server
npm test -- --run      # Unit/regression tests
npm run test:e2e:ci    # Desktop Chromium smoke gate
```

## Visual Baseline Workflow

```bash
npm run test:e2e:visual
npm run test:visual -- --project=desktop-chromium
npx playwright test e2e/visual/cockpit-highres.spec.ts --project=desktop-3456x2234
npx playwright test e2e/visual/cockpit-highres.spec.ts --project=retina-1728x1117-dsf2
npm run capture:baseline
npm run measure:visual
```

`npm run measure:visual` verifies the reference manifest, measurement profiles, and committed visual baselines. It does not imply measured real-hardware accuracy unless the report explicitly marks a surface as measured against approved references.

## Architecture Overview

RFMC is an npm workspace monorepo:

```txt
shared/  TypeScript FMC state, page renderers, validation, navdata, training, display models
src/     React 18 + TypeScript + Vite frontend, Zustand stores, CDU/cockpit instruments
server/  Node.js + Express + WebSocket bridge, CONTROL-mode FMC engine, aircraft adapters
e2e/     Playwright smoke, visual, layout, and workflow tests
docs/    Status, roadmap, scope, testing, release, and wiki source documentation
```

Standalone/offline mode keeps state in the frontend. CONTROL mode uses the backend FMC engine and WebSocket display broadcasts. Any new supported CDU/MCDU behavior should preserve frontend/backend parity.

## Documentation

- [Status](docs/STATUS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Scope](docs/SCOPE.md)
- [Roadmap](docs/ROADMAP.md)
- [Testing](docs/TESTING.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)
- [Release Checklist](docs/RELEASE_CHECKLIST.md)
- [Wiki source pages](docs/wiki/Home.md)

## Contributing

Keep changes focused, evidence-backed, and honest about scope. Behavior changes should include tests at the right layer, visual changes should update relevant baselines, and docs should separate implemented, mock-tested, snapshot-protected, measured, pilot-reviewed, and live-verified work.

## License

MIT
