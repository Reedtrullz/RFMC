# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-15
**Commit:** 72bcdd0
**Branch:** main
**Project:** VirtualCDU — Boeing 737 NG FMC Trainer
**Stack:** React 18 + TypeScript + Vite + Zustand (frontend), Node.js + Express + WebSocket (backend), TypeScript shared

## OVERVIEW
A web-based Boeing 737 NG Flight Management Computer (FMC) / Control Display Unit (CDU) simulator with MSFS 2020 integration. Monorepo with 3 workspaces: `shared`, `src` (React frontend), `server` (Node.js bridge).

## STRUCTURE
```
RFMS/
├── shared/                  # Types + FMC logic (workspace)
│   └── src/
│       ├── types/           # FMCState, DisplayData, WebSocket types
│       ├── fmc/             # Page functions, parsers, nav data, tutorials
│       │   ├── pages/       # Boeing + Airbus page functions
│       │   └── training/    # Tutorial scenarios
│       └── index.ts
├── src/                     # React frontend (workspace)
│   ├── components/
│   │   ├── CDU/            # Display, Keypad, LSK, Scratchpad, Bezel
│   │   ├── ND/             # Navigation Display symbology/layers
│   │   ├── instruments/   # BoeingMCP, common instruments
│   │   ├── CockpitMode/    # Full cockpit view
│   │   └── Training/      # Tutorial overlay
│   ├── hooks/             # useTouchFeedback, useWebSocket, useKioskMode, useSound
│   └── store/             # Zustand FMC state machine
├── server/                  # Node.js backend (workspace)
│   └── src/
│       ├── aircraft-adapters/  # IAircraftAdapter + PMDG737Adapter
│       ├── fmc-engine.ts   # Backend FMC state machine
│       └── index.ts       # Express + WebSocket server
├── e2e/                    # Playwright e2e tests
├── docs/                   # Status docs, research
└── playwright.config.ts
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| FMC page logic | `shared/src/fmc/pages/` | Boeing/Airbus page functions |
| FMC state machine | `src/store/` | Zustand store |
| React components | `src/components/CDU/` | CDU display/inputs |
| WebSocket bridge | `server/src/` | MSFS integration |
| Aircraft adapters | `server/src/aircraft-adapters/` | SimConnect adapters |
| Playwright tests | `e2e/` | Visual regression + e2e |

## CONVENTIONS (THIS PROJECT)
- **Monorepo**: npm workspaces — `shared`, `src`, `server` (order matters for install)
- **TypeScript strict**: All packages use strict TypeScript, run `typecheck` per workspace
- **Workspace imports**: `@virtual-cdu/shared` for shared package
- **Vitest**: Unit tests in `__tests__` folders, config at root `vitest.config.ts`
- **Playwright**: E2E tests in `e2e/`, visual snapshots in `e2e/*/snapshots`
- **Touch-first**: 44px touch targets, iOS safe areas, ripple feedback
- **Airbus vs Boeing**: Parallel directories for each variant

## ANTI-PATTERNS (THIS PROJECT)
- **No auth**: No authentication — standalone/offline mode works
- **No database**: FMC state is ephemeral (Zustand), server stores in-memory only
- **No router**: Single-page app, no React Router
- **No Redux**: Zustand only for state management
- **No ESLint/Prettier config**: Inconsistent — no project-wide lint/style config
- **No barrel exports**: Import from specific files, not index

## UNIQUE STYLES
- **Aviation validation**: ICAO airports, V1<VR<V2 cross-field check, QNH 900-1100
- **Visual realism**: Green-on-black AMOLED display, amber select highlight, CRT scanlines
- **PWA-first**: Service worker, offline kiosk mode, add-to-homescreen
- **SimConnect bridge**: Named pipe to MSFS, not direct HTTP

## COMMANDS
```bash
npm run dev           # Vite dev server :5173
npm run server        # Node.js WS bridge :8080
npm run build         # Vite build to dist/
npm run typecheck:all # TypeScript check all workspaces
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright e2e (all)
npm run test:e2e:ci   # Playwright CI (no visual)
npm run test:e2e:visual # Visual regression
```

## NOTES
- `docs/STATUS.md` — current validation status (don't copy test counts to README)
- `virtualcdu_combined_master_work_plan.md` — large planning doc, reference only
- 427 total files, 29.6k lines of code, depth 6 max
- 6 large files (>500 lines)
- Monorepo with npm workspaces, not Turborepo/pnpm