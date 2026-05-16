# Learnings

## Accessibility (ARIA) — Wave 1

- `LSKButton.tsx` already had a basic `ariaLabel` prop pattern (`"LSK ${side}${index}"`). Enhanced to include the field label: `"LSK L1: Select RTE 1"` when label exists, or `"LSK L1: empty field"` when not.
- `ScratchpadRow.tsx` had `aria-live="polite"` but scratchpad errors need assertive announcements. Changed to `aria-live="assertive"`.
- `CDUDisplayGrid.tsx` already had an `aria-live="polite"` region via the `<pre className="sr-only">` element — this correctly announces page content changes including title.
- `AvionicsKey.tsx` accepts `ariaLabel` prop and passes it to the `<button>` element's `aria-label`. When not provided, the button's visible text serves as the accessible name.
- `:focus-visible` should be used instead of `:focus` to avoid showing focus rings on mouse/touch clicks.
- `.avionics-key` already has `min-height: 44px` satisfying the 44px touch target requirement.
- Function keys (CLR, DEL, SP, EXEC, /, NEXT, PREV) benefit from explicit aria-labels since their abbreviated labels aren't self-explanatory to screen readers.

## Scratchpad Engine Type Definitions

- Created `shared/src/fmc/scratchpadEngine.ts` with `MessagePriority` enum (8 levels, lower=higher), `ScratchpadMessage`, `ScratchpadState` interfaces, 6 stub function signatures, and 8 factory functions.
- Message priority follows: SAFETY=1, NAV_IMPOSSIBLE=2, PERF_UNAVAIL=3, DB_ERROR=4, INVALID_ENTRY=5, ADVISORY=6, INFO=7, USER_INPUT=8.
- Safety band (priority 1-3) messages have `clearsOnInput=false`, meaning they persist through user typing.
- Factory functions use a simple `createMessage` helper with defaults: `clearsOnInput=false`, `clearsOnExec=true`, `clearsOnPageChange=true`.
- The `_nextId` counter must be module-scoped (not global) to avoid conflicts; the LSP/oxc parser is strict about `let` redeclaration.
- Write tool is preferred over Edit for complete file rewrites — Edit can leave old content if the match isn't unique.
- Export pattern: `export * from './fmc/scratchpadEngine'` added to `shared/src/index.ts`.
- Test pattern: tests go in `shared/src/__tests__/` matching the module name `scratchpadEngine.test.ts`.

## Wave 1 Post-Mortem — File Quality

- `shared/src/fmc/scratchpadEngine.ts` (127 lines): Wave 1 generated a clean file — types defined once, 6 function stubs with proper `throw` bodies, 8 message factories. **No duplication present** despite task description claiming lines 1-127 AND 128-356 existed.
- `shared/src/fmc/routeModification.ts` (70 lines): All 5 target functions (`initiateModification`, `queueChange`, `executeModification`, `cancelModification`, `getModificationState`) were generated with `{ throw new Error('Not implemented — Task 8'); }` bodies already in place. **No declaration-only stubs** to fix.
- Both files are untracked (`git status` shows `??`). Neither file appears in `git diff` because they have never been committed.
- `npm run typecheck -w shared` passes cleanly (zero errors) with both files as-is.
- **Takeaway**: Orchestrator task descriptions about subagent output quality can be stale or inaccurate. Always verify actual file content before making changes. These files were generated correctly by Wave 1 subagents and required zero modifications.

## Reference Library — Visual Fidelity Docs

- Created `docs/reference-library/boeing-737-cdu/measurements.md` and `README.md` — documents Boeing CDU token measurements from `boeing-cdu.tokens.ts`
- Created `docs/reference-library/airbus-a320-mcdu/measurements.md` and `README.md` — documents Airbus MCDU token measurements from `airbus-mcdu.tokens.ts`
- Both token files export via the same `CDUGeometryTokens` interface from Boeing; Airbus imports and overrides values
- Key differences observed: Airbus screen is 13.7% larger (116×86 mm vs 102×78 mm), shallower recess (4 mm vs 8 mm), 6×6 keypad vs 5×7, smaller annunciators (15×6 mm vs 18×8 mm)
- Both units share the same shell dimensions (146×228 mm) but differ in corner radius (4 mm Airbus, 6 mm Boeing) and bezel thickness (10 mm vs 12 mm)
- Token files are the source of truth; reference library docs derive from them and must be updated if tokens change
- `hardware/` and `pages/` subdirectories already existed empty under both variant directories
