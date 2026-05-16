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

## Wave 3 — PERF TAKEOFF / PERF APPR Grid Migration

- Created `shared/src/fmc/pages/airbus/perfTakeoff.grid.ts` — `renderPerfTakeoffGrid()` with 22 segments across 14 rows.
- Created `shared/src/fmc/pages/airbus/perfAppr.grid.ts` — `renderPerfApprGrid()` with 14 segments across 13 rows (row 13 is empty).
- Layout conventions from `initB.grid.ts`: `< LABEL` with selectable marker at col 0 (white, semantic='label'), values at col 0 or col 1 (magenta for guidance/placeholder, green for active data, white for labels).
- V1/VR/V2 are RHS fields: label at col 1, value at col 20 (right-aligned with `padStart(4)` to align `[  ]` placeholders).
- FLAPS/THS and FLEX TO TEMP are LHS fields: label at col 1, value also at col 1 on the next row (magenta, semantic='guidance').
- `NEXT PHASE>` indicator at col 13 (11 chars) — verified fits within 24-col grid (13+11=24). Placing at col 14 caused the `>` to overflow (14+11=25>24).
- When migrating from legacy `fmt()` to grid segments: values that were `rightLabel` in legacy require explicit column positioning. The `rightLabel` text appears as a separate span outside the 24-char grid in legacy mode, but grid segments must fit within the 24 columns.
- FLEX TO TEMP placeholder is `'---'` (not `'---°'`) when `flexTemp` is undefined to match original legacy output.
- LSK actions map preserved exactly: L1=set_v1, L2=set_vr, L3=set_v2, L5=set_flaps, L6=set_flex, R6=perf_appr for TO; L1=set_qnh, L5=set_wind, R6=perf_to for APPR.
- Grid tests follow `initB.grid.test.ts` pattern: `toGridText(displayData)` helper, segment content/color assertions, LSK action assertions, complete plain text layout verification.
- PERF APPR values are hardcoded (1013, 15°C, ---/---, ----, FULL) — state data is not used for these fields in the current implementation.
- PERF TAKEOFF snapshot updated via `--update` flag; INIT_A and MCDU_MENU snapshots were also stale (pre-existing) and got updated together.
- Pre-existing failure: `pageRenderers.test.ts > Airbus Page Renderers > renders INIT A page with alignment prompt` and `renders PROG page with Nav Accuracy` — both check `data.lines` on pages already migrated to grid format (lines=[], segments used instead). These were failing before this task.

## Wave 3 — Airbus INIT A Grid Migration

- Created `shared/src/fmc/pages/airbus/initA.grid.ts` with `renderInitAGrid(state)` using `airbusPage()`, `airbusTitleRow()`, and `airbusDisplaySegment()` — follows exact pattern from `initB.grid.ts`.
- Registered in `shared/src/fmc/pages/airbus/index.ts` by adding import and changing `INIT_A: renderInitA` → `INIT_A: renderInitAGrid`.
- Preserved all fields: FROM/TO, ALTN/CO RTE (alternate), FLT NBR, COST INDEX, CRZ FL/TEMP, TROPO, IRS/Nav status
- Preserved all LSK actions: L1=data_index, L2=set_flt_nbr, L3=set_cost_index, L4=set_crz_fl, L6=align_irs/irs_relay, R1=set_from_to, R2=set_altn, R6=init_b
- Grid version returns `lines: []` from `airbusPage()` — existing tests that check `data.lines` need updating to check `data.segments` instead (or do dual checks with fallback).
- Created `shared/src/__tests__/initA.grid.test.ts` with 22 tests covering: title/page indicator, grid format verification (14×24 dimensions), placeholder values, populated values, all data fields (FROM/TO, FLT NBR, ALTN, COST INDEX, CRZ FL, TROPO, IRS states), IRS states (OFF→<IRS INIT, ALIGNING→IN ALIGN X MIN, NAV→IRS RELAY >), LSK actions including IRS-state-dependent L6, color/semantic verification, complete layout, and TMPY INIT rendering.
- Key pattern: grid pages use `airbusDisplaySegment(row, col, text, color, { semantic })` directly rather than the higher-level helpers (`airbusLineLabel`, `airbusDataField`, `airbusSelectableField`). The higher-level helpers exist but grid page files follow `initB.grid.ts`'s simpler pattern.
- Existing test regression: `pageRenderers.test.ts` checks `data.lines` for Airbus INIT A — fixed to check `data.segments` with `data.lines` fallback.

## Wave 3 — Airbus INIT B Grid Migration

- Created `shared/src/fmc/pages/airbus/initB.grid.ts` with `renderInitBGrid(state)` — uses `airbusTitleRow('INIT', 'B')`, `airbusDisplaySegment` for labels/values, and `airbusPage()` wrapper.
- Fields map: ZFW (L1, rows 1-2), BLOCK fuel (L2, rows 3-4), CG (L3, rows 5-6), INIT A navigation (R1).
- Data values displayed in magenta (selectable fields) — matches `airbusSelectableField` color semantics.
- Labels in white with `semantic: 'label'`, data in magenta with `semantic: 'activeData'`.
- LSK actions preserved: L1=set_zfw, L2=set_block, L3=set_cg, R1=init_a.
- `airbusTitleRow` positions page indicator at `PAGE_WIDTH - len - 1` (col 22 for "B"), which differs from the original legacy string that had it at col 20. This shifted the snapshot by 2 characters — acceptable since it's more consistent.
- Registered in index.ts via `import { renderInitBGrid } from './initB.grid'` and mapped `INIT_B: renderInitBGrid`.
- Test file `shared/src/__tests__/initB.grid.test.ts`: 9 tests covering default/placeholder values, formatted values (ZFW/BLOCK/CG), LSK actions, grid format verification, color semantics, and full plain-text layout comparison.
- Snapshot test `PageSnapshots.test.tsx` required update (2 snapshots) due to the page indicator position shift.
- Key difference from INIT A: INIT B is simpler (3 fields + navigation), no state-dependent logic (no alignment/IRS checks).

## Wave 3 — Airbus F-PLN Grid Migration

- Created `shared/src/fmc/pages/airbus/fpln.grid.ts` with `renderFplnGrid(state)` — most complex Airbus page migration.
- Layout: Row 0 = title (`airbusTitleRow` with "F-PLN    origin / dest" + page indicator), Row 1 = " SPD/ALT" header (white), Rows 2-11 = waypoints (2 rows each, 4 per page), Row 12-13 = bottom area.
- Waypoints display: ident in white at col 2, constraint `spd/alt` in green at col 3 on the next row.
- Route discontinuities: `----- F-PLN DISCONTINUITY -----` in amber across 2 rows (same visual as legacy).
- `formatAltitude()` uses `constraint: any` to bridge type mismatch between `fmc.ts`'s `AltitudeConstraint` (`.altitude` field) and `navdataTypes.ts`'s `AltitudeConstraint` (`.value` field) — same pattern as legacy.
- `buildFplnActions()` preserved identically from legacy: uses perPage=5 for page nav (separate from visual perPage=4), waypoint indices 0-4 always mapped to L2-L6 regardless of current page (legacy quirk).
- Title gap computed dynamically: `titleGap = Math.max(2, 15 - title.length)` to handle both "F-PLN" (5 chars) and "TMPY F-PLN" (9 chars) with appropriate spacing to origin/dest.
- Registered in `index.ts` by replacing `renderFpln` with `renderFplnGrid` import and renderer map entry. Removed old `renderFpln`, `formatAltitude`, `buildFplnActions` and unused `formatAltitudeConstraint` import.
- Test file `shared/src/__tests__/fpln.grid.test.ts`: 15 tests covering title/origin, page indicator, TMPY mode, SPD/ALT header, waypoint colors, discontinuity rendering, empty list, LSK actions (L1=fpln_dep_arr, L2-L6=edit_wp, delete mode, page nav), erase in modified mode, page indicator multi-page, visual pagination (4 per page), and grid format verification.
- Model state created locally with `makeState()` fixture (not `createBaseState` from `testUtils.ts`) since that helper defaults to Boeing aircraft which would be semantically incorrect for Airbus F-PLN tests.
- 461/462 tests pass (1 pre-existing PROG page failure), all 3 workspaces typecheck cleanly.

## Wave 3 — Airbus Remaining Pages Grid Migration (FUEL PRED, SEC F-PLN, DATA INDEX, MCDU MENU, DEP/ARR)

- Created 5 grid files in `shared/src/fmc/pages/airbus/`:
  - `fuelPred.grid.ts` — `renderFuelPredGrid()`: FOB/EXTRA/MIN DEST FOB/ALTN/ALTN FOB/EXTRA-TIME/FINAL-TIME. Right-side values at col 18. All fields preserved. No LSK actions (empty `{}`).
  - `secFpln.grid.ts` — `renderSecFplnGrid()`: COPY ACTIVE (L1=copy_active), FROM/TO with origin/dest. Uses pendingRoute when isModified. Page indicator "1/1" at col 20.
  - `dataIndex.grid.ts` — `renderDataIndexGrid()`: 8 menu items (A/C STATUS through ROUTES). L1=ac_status. Page indicator "INDEX" at col 18.
  - `mcduMenu.grid.ts` — `renderMcduMenuGrid()`: 4 system entries (FMGC, ATSU, AIDS, CFDS) with magenta selectable names and green "SELECT" descriptors. L1=f_pln, L2=atsu. SELECT at col 1 (left-aligned, matching legacy format).
  - `depArr.grid.ts` — `renderDepArrA320Grid()`: DEPARTURE/ARRIVAL sections with SID/RWY/STAR/APPR selectable fields. LSK arrows (`<`) as separate segments at col 0. L2=set_sid, L3=set_rwy, L5=set_star, L6=set_appr.
- All registered in `index.ts` with imports and renderer map updates replacing legacy renderers.
- `createMinimalState()` helper pattern for tests — cast through `as unknown as FMCState` for incomplete mock state. Required `NavigationPerformance` has 8 fields (anpNm, anp, rnpNm, rnp, rnpManual, activeSource, phase, xteNm).
- Page indicator position in `airbusTitleRow` follows formula: `col = PAGE_WIDTH(24) - indicator.length - 1`. Tests must match this (col 20 for "1/1", col 18 for "INDEX").
- Pre-existing snapshot failures from earlier grid migrations (INIT_A, PROG_A, PERF_TAKEOFF, RAD_NAV) are not caused by new work.

## Wave 3 — Airbus PROG & RAD NAV Grid Migration

- Created `shared/src/fmc/pages/airbus/prog.grid.ts` with `renderProgGrid(state)`:
  - Fields: origin/destination (row 1, green), CRZ FL/OPT FL/REC MAX FL/DIST/ETA/EFOB (rows 2-7, labels col 0 'white', values col 17-21 right-aligned 'white'), WIND (row 8 label, row 9 data green), NAV ACCUR (row 10 ACTUAL label 'white', HIGH/LOW at col 8 'green', RNP at col 18 'amber'), REQUIRED label right-aligned via `airbusLineLabel(side='R')`.
  - RNP/ANP display: `navPerformance.anpNm <= navPerformance.rnpNm ? 'HIGH' : 'LOW'` — RNP value shown in amber (AIRBUS_DEFAULT_COLOR), accuracy indicator in green.
  - CRZ FL extracts first 3 chars of altitude: `String(performance.crzAlt).slice(0,3)`, prefixed with "FL" — matches legacy `renderProgA320`.
  - No LSK actions — all null, matching the display-only nature of the PROG page.
- Created `shared/src/fmc/pages/airbus/radNav.grid.ts` with `renderRadNavGrid(state)`:
  - Layout: VOR1/FREQ (row 1 label), `< --- / freq` (row 2, magenta selectable), VOR2/FREQ (row 3), `< --- / freq` (row 4), ADF1/FREQ (row 5), `< freq` (row 6).
  - Selectable `<` markers at col 0 (magenta, `guidance` semantic), frequency text at col 2 — both using `airbusSelectableField` for magenta styling.
  - LSK actions preserved: L1=set_vor1, L2=set_vor2, L3=set_adf1.
- Both registered in `index.ts`: imports added, renderer map updated (RAD_NAV: renderRadNavGrid, PROG_A: renderProgGrid), legacy renderRadNav/renderProgA320 kept for backward compat.
- Grid output tests appended to `airbusGridPages.test.ts` (20 new tests across renderProgGrid + renderRadNavGrid):
  - Uses existing `createMinimalState()` and `checkSegment()`/`checkPageStructure()` helpers.
  - PROG: 13 tests covering all fields, accuracy states (HIGH/LOW), missing route fallback, empty LSK actions.
  - RAD NAV: 7 tests covering all radio labels, frequency display, LSK actions, guidance semantic verification.
  - Ordered right-labeled values work at col 17-19 (`---- NM`=7 chars at col 17, `----Z`=5 chars at col 19, etc.).
  - `navPerformance` override in test must include full interface (8 fields) — TypeScript strict mode catches partial objects in `createMinimalState` overrides.
