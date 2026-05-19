# RFMC Backlog Learnings

## 2026-05-16: Extract route/procedure/landing LSK actions into shared handlers

### Summary

Extracted 15 inline switch-case handlers from `useFMCStore.ts` (pressLSK) into shared action handler modules, following the existing delegation pattern used by `specialActions`, `radioActions`, `performanceActions`, `takeoffActions`.

### Files changed

| File                                                | Change                                                                                                                                                                                 |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/src/fmc/actionHandlers/routeActions.ts`     | Added `handleRouteAction` dispatcher + 5 individual handlers (`set_origin`, `set_dest`, `set_flt_no`, `set_route`, `set_direct_to`)                                                    |
| `shared/src/fmc/actionHandlers/procedureActions.ts` | **NEW** — `handleProcedureAction` dispatcher + 4 handlers (`set_sid`, `set_rwy`, `set_star`, `set_appr`)                                                                               |
| `shared/src/fmc/actionHandlers/landingActions.ts`   | **NEW** — `handleLandingAction` dispatcher + 7 handlers (`set_qnh`, `set_landing_runway`, `set_landing_flaps`, `set_landing_vref`, `set_ils_frequency`, `set_ils_course`, `set_flaps`) |
| `shared/src/__tests__/routeActions.test.ts`         | Extended with 20 new tests for `handleRouteAction`                                                                                                                                     |
| `shared/src/__tests__/procedureActions.test.ts`     | **NEW** — 10 tests                                                                                                                                                                     |
| `shared/src/__tests__/landingActions.test.ts`       | **NEW** — 21 tests                                                                                                                                                                     |
| `src/store/useFMCStore.ts`                          | Added 3 delegation blocks before the switch statement; removed 16 inline cases                                                                                                         |

### Verification

- `npm run typecheck:all` — **PASS** (all 3 workspaces)
- `npm test -- --run` — **PASS** (649 tests, 47 files)
- `npm run build` — **PASS**

### Key design decisions

- **sideEffect handling**: `sideEffect: 'expand_active_route'` is placed on `FmcActionSuccess` (via the shared interface). The store reads `result.success?.sideEffect` and calls `get().expandActiveRoute()`.
- **isModified/execLit**: Handlers include `isModified: true, execLit: true` in their patches (direct `set()` pattern), matching the existing `handleSetFromTo` pattern.
- **Placeholder comments**: Replaced extracted cases with `// set_xxx — delegated to handleXxxAction` for future maintainability.

### Bug found

The existing `set_from_to` delegation at line 765 checks `(routeResult as any).sideEffect` (top-level) but `handleSetFromTo` puts `sideEffect` inside `result.success.sideEffect`, meaning `expandActiveRoute()` was never called for `set_from_to`. Not fixed — left for separate bugfix.

## 2026-05-16: Post-Dispatcher Stabilization — 5 cleanup fixes

### Summary

After the LSK dispatcher merge (commit `9e829bc`), cleaned up 5 issues: centralized result application, removed blind MOD/EXEC, verified handler patches, updated docs.

### Files changed

| File                                              | Change                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/src/fmc/fmcScratchpadAdapter.ts`          | Added `applyDispatchResult()` — centralized side-effect handling and scratchpadMessage application. Imported `DispatchLskActionResult` from lskDispatcher. Used `(get() as any)` casts for store-specific methods (`expandActiveRoute`, `stepPlanForward`) since shared package only knows `FMCState` type. |
| `src/store/useFMCStore.ts`                        | Replaced 27 lines of inline else-block (blind MOD/EXEC, side effects, scratchpadMessage) with 4-line delegation to `applyDispatchResult`. Imported `applyDispatchResult` from shared adapter. Removed `AuralAlertService` usage from pressLSK (but kept import — still used at 4 other locations).          |
| `shared/src/fmc/actionHandlers/takeoffActions.ts` | Added `isModified: true, execLit: true` to 8 success patches across `handleSetV1`, `handleSetVr`, `handleSetV2`, `handleSetRunway` (both V-speeds-deleted and simple cases).                                                                                                                                |
| `src/store/__tests__/useFMCStore.test.ts`         | Changed FIX page test: `expect(state.execLit).toBe(true)` → `.toBe(false)` — FIX entries are reference data, not route modifications.                                                                                                                                                                       |
| `docs/STATUS.md`                                  | Updated test count (499→752), latest commit, Phase 1 gate reference.                                                                                                                                                                                                                                        |
| `docs/IMPLEMENTATION_STATUS.md`                   | Added `## Post-Dispatcher Stabilization` section with rationale and change table.                                                                                                                                                                                                                           |

### Verification

- `npm run typecheck:all` — PASS (all 3 workspaces)
- `npm test -- --run` — PASS (752 tests, 55 files)
- `npm run build` — PASS

### Key design decisions

- **No blind MOD/EXEC**: Store-level `set({ isModified: true, execLit: true, ...patch })` removed. Each handler must explicitly declare modification intent in its patch.
- **Type boundary**: `applyDispatchResult` lives in shared package but calls store-specific methods (`expandActiveRoute`, `stepPlanForward`) via `as any` casts. This is intentional — the shared package shouldn't know about Zustand store API.
- **AuralAlertService import kept**: Although the ATSU chime code was removed from pressLSK, `AuralAlertService` is still used at 4 other locations in useFMCStore.ts (GPWS, alert sounds). Import stays.
- **atsu_uplink_received dead code**: The pressLSK handler checked `dispatchResult.sideEffects?.includes('atsu_uplink_received')` but the atsu handler returns `success.sideEffect` (singular), never the `sideEffects` (plural) array. This code path was unreachable — removed cleanly.
- **Handler audit result**: `routeActions` (5 handlers), `procedureActions` (4 handlers) already had MOD/EXEC. `takeoffActions` (4 handlers) were missing them — added. `fixActions` intentionally do not set MOD/EXEC (FIX entries are reference data).
