# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Focus:** src/store/

## OVERVIEW

Zustand state machines. Frontend-authoritative FMC. Ephemeral—no persistence. 8 files.

## WHERE TO LOOK

| Store                | Purpose                                                                             |
| -------------------- | ----------------------------------------------------------------------------------- |
| `fmcStore.ts`        | FMC state (IDENT→LEGS)                                                              |
| `aircraftStore.ts`   | Aircraft config                                                                     |
| `connectionStore.ts` | MSFS WebSocket status                                                               |
| `autopilotStore.ts`  | Autopilot modes                                                                     |
| `alertStore.ts`      | Warnings/alerts                                                                     |
| `trainingStore.ts`   | Tutorial state (planned — see shared/src/fmc/training/ for current scenario engine) |

## CONVENTIONS

- Zustand only — no Redux
- Frontend-authoritative (standalone mode)
- Immutable updates

## ANTI-PATTERNS

- Redux (only Zustand)
- Persistence layers
- Direct store mutation
