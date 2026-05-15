# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-15
**Area:** shared/src/fmc/

## OVERVIEW
Core FMC logic. Page functions, parsers, nav data, tutorials for Boeing/Airbus CDU. 37 files — largest in project.

## STRUCTURE
```
fmc/
├── pages/             # Boeing/Airbus page functions
├── training/          # Tutorial scenarios
├── FmsRuntimeEngine.ts # Core engine
├── LegSequencer.ts    # Waypoint sequencing
└── validation.ts      # Aviation validation
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Boeing pages | `pages/boeing/` |
| Airbus pages | `pages/airbus/` |
| Parser logic | `flightPlanParser.ts`, `waypointParser.ts` |
| Nav database | `navDatabase.ts`, `navdataSchema.ts` |
| Tutorials | `training/`, `tutorialEngine.ts` |

## CONVENTIONS
- ICAO airports validation
- V1<VR<V2 cross-field check
- `@virtual-cdu/shared` imports
- Parallel Boeing/Airbus implementations

## ANTI-PATTERNS
- Redundant page logic (shared/src/fmc/pages/)
- Duplicated data structures