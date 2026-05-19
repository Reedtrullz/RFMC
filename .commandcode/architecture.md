# VirtualCDU — Architecture Decisions (Final)

## Mode Architecture

**Backend-Authoritative (MSFS Connected)** — Primary mode:

- Server owns FMC state machine, computes DisplayData
- Sends DisplayData to client via WebSocket
- Client is thin display + input relay
- Server connects to MSFS via per-aircraft adapter

**Frontend-Authoritative (Standalone/Training)** — Secondary mode:

- Client owns FMC state (Zustand)
- Computes DisplayData locally using same shared page functions
- Fully offline, no server needed

**Shared Logic**: All FMC page computation, flight plan parsing, tutorial engine live in `shared/` package. Both frontend and backend import from it.

## Key Updates

1. **shared/ package** with npm workspaces:
   - `shared/types/` — FMC types, WebSocket types, constants
   - `shared/fmc/` — State machine, page functions, flight plan parser, tutorial engine

2. **Generic aircraft adapter** from day one:
   - `IAircraftAdapter` interface in server
   - `pmdg-737.ts` as first implementation

3. **Dual mode switching**: Client detects connection state.
   - Connected → shows server DisplayData, forwards input to server
   - Disconnected → computes DisplayData locally via Zustand + shared logic

4. **Incremental build**: CDU visual shell → FMC logic → MSFS integration → PWA
