# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** shared/src/fmc/

## OVERVIEW

Core FMC logic. Page functions, parsers, nav data, action handlers, scratchpad engine, MOD/EXEC lifecycle. 49 files — largest logic area in project.

## STRUCTURE

```
fmc/
├── actionHandlers/           # Extracted LSK action handlers (16 modules, typed dispatcher)
│   ├── lskDispatcher.ts      # dispatchLskAction() → 16 handler families
│   └── actionResult.ts       # FmcActionResult, FmcActionFailure, FmcActionSuccess
├── pages/                    # Boeing/Airbus page functions
├── training/                 # Tutorial scenarios
├── FmsRuntimeEngine.ts       # Core engine
├── LegSequencer.ts           # Waypoint sequencing
├── validation.ts             # Aviation validation
├── displayGridValidation.ts  # Strict 24×14 grid validation
├── scratchpadEngine.ts       # 8-level priority queue, message factories
├── fmcScratchpadAdapter.ts   # applyFmcActionResult, applyDispatchResult, failScratchpad
├── routeModification.ts      # MOD/EXEC state machine
├── fmcModificationAdapter.ts # Route modification adapter
├── routeModel.ts             # RouteDiscontinuity type + helpers
├── flightPlanParser.ts       # ICAO route string → waypoints
├── navDatabase.ts            # Navigation database
└── navdataSchema.ts          # Nav data types
```

## WHERE TO LOOK

| Task                    | Location                                   | Notes                                               |
| ----------------------- | ------------------------------------------ | --------------------------------------------------- |
| Boeing pages            | `pages/boeing/`                            |                                                     |
| Airbus pages            | `pages/airbus/`                            |                                                     |
| Action handlers         | `actionHandlers/`                          | Pure functions → typed FmcActionResult              |
| LSK dispatcher          | `actionHandlers/lskDispatcher.ts`          | dispatchLskAction() → 16 handler families           |
| Action result types     | `actionHandlers/actionResult.ts`           | FmcActionResult, FmcActionFailure, FmcActionSuccess |
| Scratchpad engine       | `scratchpadEngine.ts`                      | 8-level priority queue, message factories           |
| Scratchpad adapter      | `fmcScratchpadAdapter.ts`                  | applyFmcActionResult, applyDispatchResult           |
| EXEC lifecycle          | `routeModification.ts`                     | MOD/EXEC state machine                              |
| Display grid validation | `displayGridValidation.ts`                 | 24×14 grid strict validation                        |
| Route model             | `routeModel.ts`                            | RouteDiscontinuity type + helpers                   |
| Flight plan parser      | `flightPlanParser.ts`, `waypointParser.ts` | ICAO route string → waypoints                       |
| Nav database            | `navDatabase.ts`, `navdataSchema.ts`       |                                                     |
| Tutorials               | `training/`, `tutorialEngine.ts`           |                                                     |

## CONVENTIONS

- ICAO airports validation
- V1<VR<V2 cross-field check
- `@virtual-cdu/shared` imports
- Parallel Boeing/Airbus implementations
- **LSK handlers**: Pure functions returning typed FmcActionResult, no side effects
- **Scratchpad**: Messages through scratchpadEngine (typed priority queue), errors through failScratchpad()
- **EXEC lifecycle**: routeModification state machine for MOD/EXEC behavior

## ANTI-PATTERNS

- Redundant page logic (shared/src/fmc/pages/)
- Duplicated data structures
- No blind isModified: true / execLit: true (handlers self-declare modification intent)
- No direct scratchpadError writes — use failScratchpad() with typed codes
