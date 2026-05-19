# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Focus:** server/src/

## OVERVIEW

Node.js backend. Express + WebSocket. SimConnect to MSFS 2020.

## STRUCTURE

```
server/src/
├── index.ts              # Express + WS server
├── fmc-engine.ts         # Backend FMC state
├── aircraft-adapters/     # IAircraftAdapter, PMDG737Adapter
├── bridge-server.ts      # SimConnect bridge
├── security.ts           # Helmet, rate limiting
├── websocketValidation.ts # WS message validation
└── logging.ts            # Server logging
```

## WHERE TO LOOK

| Task             | Location             |
| ---------------- | -------------------- |
| SimConnect       | `bridge-server.ts`   |
| WS endpoints     | `index.ts`           |
| Aircraft adapter | `aircraft-adapters/` |
| FMC engine       | `fmc-engine.ts`      |

## CONVENTIONS

- Port 8080 default
- `@virtual-cdu/shared` imports
- TypeScript strict

## ANTI-PATTERNS

- No database (in-memory only)
- No auth (standalone mode)
