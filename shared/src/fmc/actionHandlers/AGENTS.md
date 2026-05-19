# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** shared/src/fmc/actionHandlers/

## OVERVIEW

Extracted LSK action handlers — pure functions mapping LSK actions to typed `FmcActionResult`. Isolated from store for testability. 18 modules, ~2,500 lines.

## STRUCTURE

```
actionHandlers/
├── actionResult.ts         # FmcActionResult, FmcActionFailure, FmcActionSuccess types
├── navigationActions.ts    # 30+ Boeing/Airbus page navigation LSKs → resolveLskNavigation()
├── specialActions.ts       # 7 special actions (des_now, step_plan, align_irs, erase, copy_active, print_msg, view_msg)
├── radioActions.ts         # VOR/ADF tuning (set_vor1, set_vor2, set_adf1)
├── routeActions.ts         # Route edits (set_origin, set_dest, set_flt_no, set_route, set_direct_to, set_from_to)
├── legActions.ts           # LEGS waypoint edit/delete detection
├── performanceActions.ts   # 5 PERF INIT handlers (CRZ ALT, COST INDEX, ZFW, RESERVE)
├── takeoffActions.ts       # 12 TAKEOFF REF handlers (V-speeds, runway, thrust, trim, oat, wind)
├── procedureActions.ts     # 4 procedure handlers (SID, STAR, approach, runway)
├── landingActions.ts       # 7 landing/approach handlers (runway, flaps, VREF, ILS, QNH)
├── fixActions.ts           # FIX page entries (ref fix, radial/distance)
├── holdActions.ts          # HOLD page entries (fix, course, leg time, leg dist, direction)
├── irsActions.ts           # IRS position entry
├── airbusActions.ts        # 6 Airbus INIT/F-PLN fields (CRZ FL, ALTN, BLOCK, FLT NBR, FLEX, CG)
├── lskDispatcher.ts        # dispatchLskAction() → 16 handler families
├── positionActions.ts      # POS INIT gate/lat/lon
├── windActions.ts          # CLB/CRZ/DES wind data
├── atsuActions.ts          # Airbus ATSU uplink messages
```

## WHERE TO LOOK

| Task                     | Location                                                        | Notes                                |
| ------------------------ | --------------------------------------------------------------- | ------------------------------------ |
| Handler result types     | `actionResult.ts`                                               | `FmcActionResult` + 13 failure codes |
| Page navigation dispatch | `navigationActions.ts`                                          | Resolves page → action map           |
| Boeing-specific handlers | `routeActions.ts`, `performanceActions.ts`, `takeoffActions.ts` |                                      |
| Airbus-specific handlers | `airbusActions.ts`                                              |                                      |
| Common validation        | Import from `../validation.ts`                                  |                                      |
| Scratchpad integration   | Import from `../fmcScratchpadAdapter.ts`                        | `applyFmcActionResult()`             |

|
| LSK dispatcher | `lskDispatcher.ts` | dispatchLskAction() routes to 16 handler families |
| Position entry | `positionActions.ts` | POS INIT gate/lat/lon |
| Wind entry | `windActions.ts` | CLB/CRZ/DES wind data |
| ATSU messaging | `atsuActions.ts` | Airbus ATSU uplink messages |

## CONVENTIONS

- **Pure functions**: Every handler is `(action: string, state: FMCState, scratchpad: string) => FmcActionResult`
- **Typed failures**: Never return raw error strings — always use `FmcActionFailure { code, text, source }`
- **No side effects**: Handlers return patches/messages; store applies them via `applyFmcActionResult()`
- **Export pattern**: One `handle*Action()` dispatcher per module + private handler functions
- **Test coverage**: Every handler has unit tests in `shared/src/__tests__/`
-
- **Dispatcher**: dispatchLskAction() is the single entry point → routes to handler families by priority

## ANTI-PATTERNS

- **No direct `scratchpadError` writes** — return `failure` with typed code instead
- **No direct store mutations** — return patches to be applied by store wrapper
- **No inline validation** — delegate to shared validation modules (`validation.ts`)
- **No Boeing/Airbus crossover** — aircraft-specific handlers must not mix
-
- **No bypassing dispatcher** — always dispatch via dispatchLskAction, never call handlers directly from store
