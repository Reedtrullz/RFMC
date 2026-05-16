# Learnings

## Accessibility (ARIA) — Wave 1

- `LSKButton.tsx` already had a basic `ariaLabel` prop pattern (`"LSK ${side}${index}"`). Enhanced to include the field label: `"LSK L1: Select RTE 1"` when label exists, or `"LSK L1: empty field"` when not.
- `ScratchpadRow.tsx` had `aria-live="polite"` but scratchpad errors need assertive announcements. Changed to `aria-live="assertive"`.
- `CDUDisplayGrid.tsx` already had an `aria-live="polite"` region via the `<pre className="sr-only">` element — this correctly announces page content changes including title.
- `AvionicsKey.tsx` accepts `ariaLabel` prop and passes it to the `<button>` element's `aria-label`. When not provided, the button's visible text serves as the accessible name.
- `:focus-visible` should be used instead of `:focus` to avoid showing focus rings on mouse/touch clicks.
- `.avionics-key` already has `min-height: 44px` satisfying the 44px touch target requirement.
- Function keys (CLR, DEL, SP, EXEC, /, NEXT, PREV) benefit from explicit aria-labels since their abbreviated labels aren't self-explanatory to screen readers.

## Keyboard Accessibility — Wave 1 Task 7 (Function Key ARIA labels)

- `BoeingFunctionKeyPanel.tsx` — Added `ariaLabel` field to `FunctionKey` interface with descriptive text for all 14 keys (e.g., "Init Ref page", "Route page", "Climb page"). Passed `ariaLabel` prop to `AvionicsKey`.
- `AirbusFunctionKeyPanel.tsx` — Added typed `FunctionKey` interface with `ariaLabel` field for all 7 keys (e.g., "Direct Intercept page", "Progress page", "Flight Plan page"). Passed `ariaLabel` to `AvionicsKey`.
- `LSKButton.tsx` already generates `ariaLabel` as `"LSK ${side}${index}: ${ariaDescription}"` — LSK columns (Boeing & Airbus) don't need changes since they pass `label` to LSKButton which handles aria-label generation.
- `instruments.css` — `.avionics-key:focus-visible` already exists with 2px solid `#39ff14` outline. Added `.cdu-button:focus-visible` as a complementary selector for extra coverage.

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

## Scratchpad Priority Engine — Wave 2 Implementation

- Implemented all 6 priority engine functions: `pushMessage`, `clearMessage`, `typeChar`, `deleteChar`, `clearBuffer`, `getActiveDisplay`
- **pushMessage**: Inserts into priority-sorted queue (ascending priority, tie-break by createdAt), sets `message` to queue[0], adds to history
- **clearMessage**: Removes by ID from queue; if removed was current `message`, promotes next; no-op if ID not found; adds removed message to history
- **typeChar**: Appends char to buffer; removes messages with priority > PERF_UNAVAIL (ADVISORY, INFO, USER_INPUT) from queue; promotes next safety message if current was cleared; adds cleared messages to history
- **deleteChar**: Slices last char from buffer; no-op if buffer empty
- **clearBuffer**: Sets buffer to empty string
- **getActiveDisplay**: Returns message.text if message exists, else buffer if non-empty, else ''
- Priority-based clearing in `typeChar` uses numeric comparison with `MessagePriority.PERF_UNAVAIL`, not the `clearsOnInput` property — this keeps the safety band (priorities 1-3) persistent while clearing lower-priority messages (priorities 4-8)
- All functions are pure (return new ScratchpadState, no mutation)
- Added 26 TDD tests across 6 describe blocks (pushMessage, clearMessage, typeChar, deleteChar, clearBuffer, getActiveDisplay) covering: priority ordering, promotion/demotion, same-priority insertion order, safety message persistence, advisory clearing, empty state handling, idempotent operations
- Existing 300 lines / 41 tests in test file remain untouched and pass (340 total tests, all green)
- TDD flow: wrote tests first (RED → 26 failures), implemented functions (GREEN → 340 pass)

## Wave 2 — Route Discontinuity resolveDiscontinuity

- `resolveDiscontinuity(route, connectingLeg)` replaces a cleared `RouteDiscontinuity` with a `FlightPlanWaypoint` in-place using `splice(targetIndex, 1, waypoint)`.
- The discontinuity slot is **replaced** (not removed), so array length stays the same. This is correct because the discontinuity occupies a sequence position in the route; resolving fills that slot.
- The `connectingLeg` param is `Omit<FlightPlanWaypoint, 'discontinuity'>` — the function automatically sets `discontinuity: false` on the resulting waypoint.
- Only the **first** cleared discontinuity is resolved; subsequent cleared ones are left untouched.
- Throws `'No cleared discontinuity found in route'` when no cleared discontinuity exists (uncleared or absent).
- Tests: 8 new tests (30 total now). New tests cover: basic replacement, uncleared throw, no-discontinuity throw, first-of-many selection, immutability, all-fields preservation, empty route throw, full lifecycle (insert → clear → resolve).
- The LEGS page (`legs.grid.ts`) still uses `wp.discontinuity` boolean pattern for rendering — Wave 3 will migrate to the `RouteEntry` pattern.

## Wave 2 — EXEC Lifecycle State Machine (5 functions)

- Implemented all 5 previously-stubbed functions in `shared/src/fmc/routeModification.ts`:
  - `initiateModification(currentRoute)` — creates a `RouteModification` with deep copies of route, `state='NONE'`, empty `pendingChanges`, `id` via `crypto.randomUUID()` with fallback.
  - `queueChange(modification, change)` — validates via `canQueueChange`, appends change, transitions to `'MODIFIED'`. Returns new object — immutable.
  - `executeModification(modification)` — validates via `canExecuteModification`, applies all pending changes to `modifiedRoute` via `applyPendingChanges()` helper, sets `state='EXECUTED'`, clears `pendingChanges`, records `executedAt`.
  - `cancelModification(modification)` — validates via `canCancelModification`, reverts `modifiedRoute` to copy of `originalRoute`, sets `state='NONE'`, clears `pendingChanges`.
  - `getModificationState(modification)` — returns `modification.state`.
- Private helpers: `generateId()` (crypto.randomUUID with fallback), `applyPendingChanges()` (spreads route data, assigns change.field=change.newValue for each change).
- All guard checks throw descriptive errors with current state name.
- Immutability enforced: every function returns a new object via spread/copy — inputs are never mutated.
- EXEC_PENDING transition is reserved (no function to enter it yet) but cancelModification already handles it via `canCancelModification`.
- Tests: 26 tests across 7 describe blocks in `shared/src/__tests__/routeModification.test.ts`:
  - `initiateModification`: basic fields, copy independence
  - `queueChange`: NONE→MODIFIED, multiple changes, immutability, guard rejects EXECUTED/EXEC_PENDING
  - `executeModification`: MODIFIED→EXECUTED, change application, clears pendingChanges, guards reject wrong states
  - `cancelModification`: from MODIFIED reverts, from EXEC_PENDING reverts, guards reject NONE/EXECUTED
  - `getModificationState`: returns correct state after each transition
  - Full lifecycle: NONE→MODIFIED→EXECUTED (happy path), NONE→MODIFIED→NONE (cancel from MODIFIED), NONE→MODIFIED→EXEC_PENDING→NONE (cancel from EXEC_PENDING)
  - Immutability: confirms all functions return new objects
- Casting `Record<string, unknown>` to `RouteData` requires `as unknown as RouteData` (TS strict mode).

## Wave 2 — Playwright Test Suite Split (smoke, visual, full)

- Created `e2e/smoke/critical-path.spec.ts` with `@smoke` tag in test names — grep pattern `--grep="@smoke"` matches tests containing the literal string `@smoke`.
- Created `e2e/visual/critical-screenshots.spec.ts` with `@Visual Regression` tag in test names — grep pattern `--grep="Visual Regression"` (case-insensitive substring match).
- Subdirectories under `e2e/` are automatically picked up by Playwright since `testDir: './e2e'` recursively scans.
- Playwright's `grep` matches **anywhere** in the test title (tag-style `@smoke` works but is convention only — the `@` isn't special).
- `grep-invert` excludes tests matching the pattern — used originally for CI to skip visual tests.
- `test:e2e:ci` changed from `--grep-invert "Visual Regression"` to `--grep="@smoke"` to run only fast smoke tests in the PR gate.
- Import paths from subdirectories use `../helpers` (relative to `e2e/`).

## Wave 3 — Airbus Grid Migration Helpers

- Created `shared/src/fmc/pages/airbus/airbusGridHelpers.ts` — Airbus equivalent of `boeingGridHelpers.ts`.
- Key difference: Airbus default display color is `amber` (vs Boeing's `green`), using `AIRBUS_DEFAULT_COLOR` from `displayColors.ts`.
- `airbusTitleRow()` uses white inverse text at column 2 — no background fill segment (unlike Boeing which fills entire row with cyan).
- `airbusLineLabel()` creates labels with `semantic: 'label'` in white — left-aligned at col 0 or right-aligned based on label length.
- `airbusDataField()` defaults to green color with `semantic: 'activeData'`; caller overrides to amber for placeholders.
- `airbusSelectableField()` creates magenta segments with `semantic: 'guidance'` — LSK action binding is handled separately via `airbusPage()`'s `lskActions` parameter.
- The `_lskId` and `_fieldId` parameters on `airbusSelectableField` are reserved for future metadata association (prefixed with underscore to satisfy TS no-unused-vars).
- `airbusPage()` wraps segments + lskActions into `DisplayData` — follows same pattern as `boeingPage()`.
- Test file `shared/src/__tests__/airbusGridHelpers.test.ts`: 18 tests covering all 7 exported functions with edge cases (right-label clamping, page indicator positioning, option overrides).
