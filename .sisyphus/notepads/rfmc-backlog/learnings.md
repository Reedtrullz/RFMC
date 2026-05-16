# RFMC Backlog Learnings

## 2026-05-16: Extract route/procedure/landing LSK actions into shared handlers

### Summary
Extracted 15 inline switch-case handlers from `useFMCStore.ts` (pressLSK) into shared action handler modules, following the existing delegation pattern used by `specialActions`, `radioActions`, `performanceActions`, `takeoffActions`.

### Files changed

| File | Change |
|------|--------|
| `shared/src/fmc/actionHandlers/routeActions.ts` | Added `handleRouteAction` dispatcher + 5 individual handlers (`set_origin`, `set_dest`, `set_flt_no`, `set_route`, `set_direct_to`) |
| `shared/src/fmc/actionHandlers/procedureActions.ts` | **NEW** — `handleProcedureAction` dispatcher + 4 handlers (`set_sid`, `set_rwy`, `set_star`, `set_appr`) |
| `shared/src/fmc/actionHandlers/landingActions.ts` | **NEW** — `handleLandingAction` dispatcher + 7 handlers (`set_qnh`, `set_landing_runway`, `set_landing_flaps`, `set_landing_vref`, `set_ils_frequency`, `set_ils_course`, `set_flaps`) |
| `shared/src/__tests__/routeActions.test.ts` | Extended with 20 new tests for `handleRouteAction` |
| `shared/src/__tests__/procedureActions.test.ts` | **NEW** — 10 tests |
| `shared/src/__tests__/landingActions.test.ts` | **NEW** — 21 tests |
| `src/store/useFMCStore.ts` | Added 3 delegation blocks before the switch statement; removed 16 inline cases |

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
