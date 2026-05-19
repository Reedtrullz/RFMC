# Post-Dispatcher Stabilization Plan

## TL;DR

Cleanup PR after LSK dispatcher merge: centralize result application, stop blind EXEC lighting, migrate remaining direct scratchpad writes, update stale docs.

## Problems to Fix

1. Blind MOD/EXEC marking — `set({ isModified: true, execLit: true, ...patch })` on ALL dispatcher success patches
2. Side effects handled inline in `pressLSK()`
3. Remaining direct `scratchpadError` writes outside dispatcher (pressEXEC, insertWaypoint)
4. Waypoint mutations manually set MOD/EXEC (insertWaypoint, deleteWaypoint, updateWaypointConstraint)
5. docs/STATUS.md stale (still says 499/499, commit 2010195)

## Scope

- `src/store/useFMCStore.ts` — cleanup result application, centralize side effects
- `shared/src/fmc/fmcScratchpadAdapter.ts` — applyDispatchResult helper
- `docs/STATUS.md`, `docs/IMPLEMENTATION_STATUS.md` — update

## Verification

- `npm run typecheck:all`
- `npm test -- --run`
- `npm run build`
- 752 tests must pass (or more)

## TODOs
