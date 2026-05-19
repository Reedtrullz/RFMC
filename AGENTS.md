# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Commit:** a469942
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
│       ├── fmc/             # Page functions, parsers, nav data, engines
│       │   ├── pages/       # Boeing + Airbus page functions
│       │   ├── actionHandlers/ # Extracted LSK action handlers (18 modules)
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

| Task                    | Location                                         | Notes                                                     |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| FMC page logic          | `shared/src/fmc/pages/`                          | Boeing/Airbus page functions                              |
| LSK action handlers     | `shared/src/fmc/actionHandlers/`                 | Extracted from store (18 modules)                         |
| LSK dispatcher          | `shared/src/fmc/actionHandlers/lskDispatcher.ts` | Typed `dispatchLskAction()` → 16 handler families         |
| Action result types     | `shared/src/fmc/actionHandlers/actionResult.ts`  | FmcActionResult, FmcActionFailure, FmcActionSuccess       |
| Scratchpad engine       | `shared/src/fmc/scratchpadEngine.ts`             | 8-level priority queue, message factories                 |
| Scratchpad adapter      | `shared/src/fmc/fmcScratchpadAdapter.ts`         | applyFmcActionResult, applyDispatchResult, failScratchpad |
| EXEC lifecycle          | `shared/src/fmc/routeModification.ts`            | MOD/EXEC state machine + adapter                          |
| Display grid validation | `shared/src/fmc/displayGridValidation.ts`        | Strict 24×14 grid validation                              |
| FMC state machine       | `src/store/`                                     | Zustand stores (10 modules)                               |
| React components        | `src/components/CDU/`                            | CDU display/inputs                                        |
| Navigation Display      | `src/components/ND/`                             | ND symbology + layers + frame                             |
| Cockpit layout          | `src/components/CockpitMode/`                    | CSS grid layout presets                                   |
| WebSocket bridge        | `server/src/`                                    | MSFS integration                                          |
| Aircraft adapters       | `server/src/aircraft-adapters/`                  | SimConnect adapters                                       |
| Playwright tests        | `e2e/`                                           | Visual regression + e2e                                   |

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
- **No unsafe non-null optional chain assertions**: Wires safe fallback operators like ?? instead of combining ! and ?.
- **No barrel exports**: Import from specific files, not index

## UNIQUE STYLES

- **Aviation validation**: ICAO airports, V1<VR<V2 cross-field check, QNH 900-1100
- **Visual realism**: Green-on-black AMOLED display, amber select highlight, CRT scanlines
- **PWA-first**: Service worker, offline kiosk mode, add-to-homescreen, install screenshots
- **SimConnect bridge**: Named pipe to MSFS, not direct HTTP
- **GPWS speech cues**: Synthesized voice callouts for all 7 modes (pull up, terrain, windshear)

## COMMANDS

```bash
npm run dev           # Vite dev server :5173
npm run server        # Node.js WS bridge :8080
npm run build         # Vite build to dist/
npm run typecheck:all # TypeScript check all workspaces
npm run test          # Vitest unit tests (845 pass, 65 files)
npm run test:e2e      # Playwright e2e (all)
npm run test:e2e:ci   # Playwright CI smoke (@smoke)
npm run test:e2e:visual # Visual regression
npm run test:visual   # Visual regression (grep filter)
npm run test:visual:update # Update visual snapshots
npm run capture:baseline   # Capture Playwright baselines
```

## NOTES

- `docs/STATUS.md` — current validation status (don't copy test counts to README)
- `docs/ARCHITECTURE.md` — system architecture and design decisions
- `docs/IMPLEMENTATION_STATUS.md` — recent changes and transitional state
- 962 total files, ~58k lines of code, depth 5 max
- 9 files >500 lines (useFMCStore.ts is largest at 2,260 lines)
- Monorepo with npm workspaces, not Turborepo/pnpm
- `shared/src/fmc/actionHandlers/` — 18 extracted LSK handler modules (store extraction complete)
- CI: GitHub Actions (typecheck + unit + e2e + Docker build + format + lint), VPS deploy via Ansible
- Coverage thresholds: Lines 57%, Functions 52%, Branches 52%, Statements 54% (Vitest, v8 provider)
- ESLint & Prettier strict check: Fully configured eslint.config.js and .prettierrc pipelines, automatically enforced on commit.
