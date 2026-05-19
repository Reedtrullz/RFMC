# VirtualCDU Implementation Status

## Current Verification Source

Current automated baseline, build/audit state, latest reviewed commit, and validation caveats are tracked in `docs/STATUS.md`. This file records implementation history and capability state only.

## Current Continuation Focus

The dispatcher/store cleanup and visible-polish cockpit slice are complete enough for the next milestone. The desktop Chromium broad visual gate has been repaired, 3456x2234 plus Retina-equivalent cockpit baselines now protect the large-desktop target, and a visual-fidelity manifest gate now separates snapshot protection from unproven hardware accuracy. The active public-demo track is now measured visual fidelity, workflow completion, state-aware training, and release hardening:

- Rights-cleared reference intake and measured geometry/color comparisons.
- Expand state-driven cockpit guidance into lesson packs, scoring, debrief, and highlighted expected controls.
- Boeing preflight workflow completion and Airbus workflow parity.
- Richer deterministic navdata, integration of the shared LNAV/VNAV/performance models, CONTROL-mode parity, PWA/iPad hardening, accessibility, and public-demo documentation.

## Public Documentation And Wiki Source Sync

- Refreshed the README around the current product shape: Boeing-first RFMC/VirtualCDU with scoped Airbus support, cockpit instruments, offline PWA use, CONTROL-mode foundations, and explicit non-operational limitations.
- Added repo-local wiki source pages under `docs/wiki/` so GitHub Wiki content can be generated or copied from versioned files.
- Reworked `docs/ROADMAP.md` so completed high-resolution, PFD, MCP/FCU, state-aware guidance, shared LNAV/VNAV/performance, and PWA foundation work is treated as baseline rather than future scope.
- Tightened release and limitation docs around status evidence, approved visual references, PMDG/MSFS live validation, and public-demo readiness.
- Extended the visual measurement gate to classify measurement profiles by reference approval state; derived profiles remain internal consistency checks until their sources are approved for pixel measurement.

## Boeing LEGS Staging And Keyboard Accessibility Hardening

- Confirmed Boeing LEGS insert/delete/discontinuity replacement already stage through `pendingFlightPlan` and commit only on EXEC in both frontend standalone mode and backend CONTROL mode.
- Added explicit regressions proving active route waypoints remain unchanged until EXEC for LEGS insert/delete and discontinuity resolution paths.
- Fixed physical keyboard LSK handling: `F1` through `F6` now target left LSK 1-6 instead of the invalid L0-L5 range, and `F7` through `F12` now target right LSK 1-6.
- Kept `Shift+F1` through `Shift+F6` as an alternate right-LSK mapping and updated the keyboard help overlay.
- Added Playwright coverage proving physical function keys can operate left and right LSK actions.
- Preserved `H` as normal CDU character input and narrowed the documented help shortcut to `?`.
- Added CSS/test coverage for cockpit high-contrast mode and reduced-motion behavior.

## PWA Prompt Testability

- Extracted the offline-ready/update prompt into `PwaUpdatePrompt` so the installed-app update UI can be tested without depending on a production service worker inside the dev-server E2E environment.
- Added unit coverage for hidden, offline-ready, update-available, reload, and close prompt states.
- Made the portrait orientation prompt genuinely dismissible, added dialog semantics, and added Playwright coverage that verifies the portrait mobile fallback layout remains usable after dismissal.
- Kept real service-worker/offline startup validation as a production/iPad manual gate because the dev server does not exercise the generated production service worker.

## Large-Desktop Visual Gate Update

- Repaired the legacy Boeing CDU selector contract so broad desktop visual specs can find `data-testid="boeing-cdu"` again while cockpit layout wrappers keep using `cdu-panel`.
- Added Playwright projects for the 3456x2234 physical-pixel target and the 1728x1117 deviceScaleFactor 2 Retina-equivalent viewport.
- Added serial high-resolution cockpit visual coverage for Boeing and Airbus task modes plus focused CDU/MCDU, ND, PFD, and MCP/FCU panels.
- Added reusable cockpit layout assertions for stage usage, visible-panel group size, clipping, PFD/ND pairing, MCP/FCU placement, help-sidebar docking, tray docking, and focused-panel centering.
- Tuned large-desktop cockpit grid sizing so the 3456x2234 full-deck composition uses the available canvas instead of rendering as a small centered cluster.

## Visual-Fidelity Manifest Gate

- Added `npm run measure:visual`, backed by `scripts/measure-visual-fidelity.mjs`.
- The gate validates `reference-library/references.json`, required measurement profile files, and the committed app-owned visual baseline directories.
- The generated `docs/VISUAL_FIDELITY_REPORT.md` classifies CDU/MCDU, ND, PFD, MCP/FCU, and high-resolution cockpit layouts as snapshot-protected, measured against references, pilot-reviewed, and live-validated.
- The report intentionally keeps hardware pixel accuracy at "not measured" until rights-cleared hardware reference crops are approved and measured.

## State-Aware Cockpit Guidance

- Added shared `buildTrainingProgress()` in `shared/src/training/trainingProgress.ts`.
- The selector derives current step, completed steps, next action, expected page/key/LSK/panel, missing fields, warnings, hints, and aircraft-family terminology from the current FMC and autoflight state.
- Mode help cards now use the shared selector so preflight setup, route verification, automation, approach, and flight-deck scan modes react to actual state instead of showing only static descriptions.
- Added unit coverage for Boeing position/route progression, discontinuity detection, Boeing automation completion, Airbus terminology separation, and Airbus approach completion.
- Updated affected cockpit layout and high-resolution visual baselines because the help card now displays live next-step guidance.

## Shared Autoflight And LNAV Display Models

- Added shared `buildPfdDisplayModel()` as the aircraft-family router over the existing Boeing and Airbus PFD/FMA model builders.
- Added unit coverage proving the unified PFD model returns Boeing-only and Airbus-only FMA branches for the active aircraft.
- Added shared `buildBoeingMcpDisplayModel()` and `buildAirbusFcuDisplayModel()` so MCP/FCU display-window formatting is no longer embedded only in React JSX.
- Boeing MCP and Airbus FCU components now consume the shared display models while preserving the existing hardware styling and handlers.
- Added shared `buildLnavState()` for trainer-grade LNAV active-leg truth: active waypoint, next waypoint, destination, direct-to state, discontinuity stop, bearing, and distance-to-go.
- Added unit coverage for Boeing IAS/MACH, heading, altitude, V/S formatting, Airbus managed-window formatting, direct-to LNAV behavior, discontinuity blocking, and empty-route behavior.
- Added shared `buildPerformancePrediction()` for trainer-grade performance availability, V-speed prediction, fuel-to-destination estimate, runway-length warning, and explicit non-operational notes.
- Added unit coverage for plausible trainer V-speeds, missing-performance VNAV unavailability, insufficient fuel, and a deliberately short runway warning.
- Added shared `buildVnavPrediction()` for trainer-grade VNAV availability, climb/descent phase, next altitude-constraint feasibility, T/C and T/D distance estimates, `UNABLE NEXT ALT`, `DRAG REQUIRED`, and route-discontinuity interruption messages.
- Added unit coverage for missing-performance VNAV unavailability, feasible climb constraints, impossible climb constraints, excessive descent path, and discontinuity interruption.
- Wired the Boeing PROGRESS page and grid renderer to shared LNAV/VNAV/performance predictions so TO/NEXT/DEST, fuel-at-destination, VNAV status, next constraint, and T/D data come from the same trainer-grade truth used by tests.
- Wired the Airbus PROG grid renderer to shared LNAV/performance predictions so origin/destination, distance-to-go, and EFOB use the same trainer-grade route/fuel truth instead of static placeholders.
- Wired the Airbus FUEL PRED grid renderer to shared performance predictions so route-based extra fuel, minimum destination fuel, alternate fuel, and insufficient-fuel color state are derived from the trainer-grade fuel model.
- Aligned the legacy exported Airbus PROG and FUEL PRED line renderers with the same shared LNAV/performance model to avoid parallel placeholder behavior in semantic tests and compatibility callers.
- Added backend `FMCEngine` coverage proving Airbus PROG and FUEL PRED render shared LNAV/performance-derived values through CONTROL-mode display generation.
- Updated the instructor console VNAV and performance sections to use shared LNAV/VNAV/performance predictions instead of local placeholder top-of-descent math.
- Updated `buildTrainingProgress()` so blocking shared performance predictions such as `INSUFFICIENT FUEL` and `RUNWAY TOO SHORT` send the user back to performance review before takeoff setup can be treated as complete.

## Coverage Hardening Update

- Added backend `FMCEngine` regression tests for null renderer fallback, route parsing into LEGS, DEP/ARR procedure entry, HOLD staging/EXEC commit, V-speed ordering rejection, DIR INTC, and N1 LIMIT mode output.
- Added frontend Zustand store regressions for route parsing, LEGS insert/delete, HOLD staging/commit, V-speed ordering, DEP/ARR, DIR INTC, and N1 LIMIT.
- Expanded Playwright coverage from smoke-only to include the Boeing IDENT → TAKEOFF REF flow, Airbus INIT/F-PLN/DEP-ARR/PERF TO flow, mocked SimBrief import, and screenshot-backed nonblank rendering checks for Boeing and Airbus displays.
- Fixed a frontend/backend parity issue found by the new tests: HOLD field setters now clear the scratchpad after each staged edit, matching backend behavior and preventing appended invalid entries.
- V-speed validation now reports the specific failed ordering constraint (`V1 MUST BE < VR` or `VR MUST BE < V2`) instead of only the generic all-field ordering message.

## Consolidated Masterplan Implementation Update

- Added current execution artifacts: `ROADMAP.md`, `METRICS.md`, `TEST_MATRIX.md`, `PILOT_REVIEW_RUBRIC.md`, `KNOWN_LIMITATIONS.md`, `SCOPE.md`, `CHANGELOG.md`, and ADR 0001.
- Marked older overlapping planning documents as superseded or planning-baseline-only so they no longer compete with the current tracker.
- Added `reference-library/references.json` to track real CDU/MCDU reference provenance, usage rights, crop rules, and measurement purpose.
- Added Phase 0 visual measurement documentation and `npm run capture:baseline`, a Playwright capture flow for Boeing, Airbus, tutorial, connection diagnostics, and iPad baseline screens.
- Added initial SimBrief/navdata fixture folder and `docs/NAVDATA_SCHEMA.md` for the ARINC-lite schema direction.
- Added typed navdata/route fixture validation so Phase 4 SimBrief fixtures are executable test data.
- Added `docs/MSFS_LIVE_VALIDATION.md` to keep PMDG live round-trip validation separate from CI-safe mock tests.
- Added shared display semantics (`title`, `label`, `activeData`, `modified`, `guidance`, `warning`, etc.) as the Phase 1 foundation for measured color work.
- Added rendered `data-semantic` hooks for display lines so future visual tooling can sample rows by semantic role.
- Applied semantic tagging to Boeing setup and Airbus page renderer helpers, with renderer tests to prevent regressions.
- Extended semantic tagging across the primary Boeing page renderers so visual measurement tooling can sample main Boeing pages consistently.
- Added a CI-safe `MockSimConnectAdapter` for future CONTROL/MSFS integration tests without claiming live PMDG validation.
- Added `AIRCRAFT_ADAPTER=mock` adapter selection and a GitHub Actions CI workflow that validates typecheck, unit tests, E2E, build, and high/critical audit policy without requiring MSFS.
- Refactored the bridge server into a reusable `createBridgeServer()` module and added a WebSocket mock-adapter test for sim connection, CONTROL-mode input, display broadcast, and aircraft key forwarding.
- Added Boeing procedural behavior for runway changes: changing takeoff runway after V-speeds are entered clears V1/VR/V2 and announces `V SPEEDS DELETED` in frontend and backend state.
- Added a supported Boeing `DES NOW` trainer action on the DES page that arms descent guidance feedback instead of showing an unsupported LSK.
- Expanded the versioned SimBrief route fixture set to 20 routes and enforced that minimum in regression tests.
- Added route-context validation for Boeing HOLD fixes so active-route holds reject fixes that are not in the loaded route.
- Added LEGS discontinuity resolution behavior: entering a waypoint on a discontinuity line replaces the discontinuity instead of inserting before it.
- Added Phase 2.5 Navigation Display context visuals to the masterplan and implemented the first standalone ND training panel with route, discontinuity, speed/altitude constraints, FIX, HOLD, procedure, range, mode, and overlay context.
- Fixed route-string constraint parsing so entries like `RBV/250FL100A` feed LEGS and ND constraint displays as structured speed/altitude data instead of waypoint text.
- Added DIR INTC awareness to the ND so direct-to selections move the active target/segment and appear in the ND context header.
- Added TAKEOFF REF page 2 trainer approach-reference support with landing runway, landing flaps, VREF, ILS frequency, and course entry in both frontend standalone mode and backend CONTROL-mode engine.
- Expanded Boeing FIX support from one trainer entry to two entry-specific FIX slots, with frontend/backend parity and multiple ND FIX overlays.
- Added CLR cancellation of pending modifications: pressing CLR with an empty scratchpad while in MOD state discards all pending route/flight-plan/hold changes and clears the EXEC light. Both frontend and backend in parity.
- Phase 2 Deeper Procedural Fidelity: Added interactive data entry for `CLB WIND`, `CRZ WIND`, `DES WIND`, and `ISA DEV` to the CLB, CRZ, and DES pages. Implemented frontend/backend sync, validation (`isValidWind`, `isValidTemperature`), and dynamic formatting.
- Phase 2 Deeper PROG Behavior: Overhauled the generic PROGRESS page to accurately match the Boeing 737 NG layout. It now dynamically calculates cumulative `greatCircleDistance` down the flight plan to accurately project `DTG` for the `TO`, `NEXT`, and `DEST` waypoints, maintaining a precise 24-character width.
- Phase 4 Navdata & Procedure Validation: Implemented an ARINC-Lite expansion engine that "unrolls" recognized SIDs/STARs into their constituent waypoint legs upon route parsing. Added advanced `ROUTE/SID MISMATCH` and `ROUTE/STAR MISMATCH` validation to cross-check typed RTE procedures against the current active selections on the DEP/ARR pages.
- Phase 5 MSFS Integration Hardening: Implemented a robust connection state machine with a 5-second server-side heartbeat. Added real-time latency tracking and session uptime monitoring to the frontend diagnostics panel. Updated shared WebSocket types and store logic to handle periodic health checks.
- Phase 6 Training Curriculum & Adaptive Polish: Upgraded the tutorial system into a training curriculum with A/B/C grading, mastery scores, and PF/PM role callouts. Implemented adaptive "smart" hinting that detects wrong page/field errors and provides contextual guidance. Added a star-based confidence rating system to track training effectiveness.
- Phase 1 Boeing Visual Fidelity Finalization: Downloaded and integrated the open-source **B612 Mono** font (designed specifically by Airbus/Boeing for high-legibility digital avionics) to lock in the 24x14 grid. Added a functional interactive `BRT` slider to the CDU bezel which dynamically controls screen brightness via CSS filters and global Zustand state.
- Airbus scope cleanup: removed misleading interactive arrows from display-only pages (FUEL PRED, SEC F-PLN, RAD NAV, DATA INDEX, PROG). Fixed LSK position mappings for INIT B and DEP/ARR. Added Airbus page status table to SCOPE.md.
- Phase 8 PWA/iPad Offline Hardening: migrated to `vite-plugin-pwa` for robust service worker generation and caching of all compiled assets. Added PWA update prompt UI in React to alert users of offline updates.
- Added iOS layout safe-area-inset boundaries to prevent the Home Indicator and notch from overlapping the CDU. Applied `touch-none` to root wrapper to prevent default browser elastic scrolling and pinch-to-zoom gestures, creating a native app feel on iPads.

## Oracle Round 28 Critical Blockers — FIXED

### BLOCKER 1+2: WebSocket connection sharing

- **Problem**: Each `CDU`/`AirbusCDU` component created separate `useWebSocket()` instance with its own `wsRef`. CONTROL mode input sent on unconnected socket. `connectionStatus` local to hook, never set to CONNECTED.
- **Fix**: Read `connectionStatus` from Zustand store (single source of truth). Added `setConnectionStatus('CONNECTED')` in `onopen` handler. Both CDU and AirbusCDU components now use store-based status.
- **Files**: `src/hooks/useWebSocket.ts`, `src/components/CDU/CDU.tsx`, `src/components/CDU/AirbusCDU.tsx`

### BLOCKER 3: Route parsing into waypoints

- **Problem**: RTE page `set_route` only stored `routeString`; `parseRouteString` was never called, `flightPlan.waypoints` never populated, `legsPageCount` never updated.
- **Fix**: `set_route` action now calls `parseRouteString()`, extracts waypoints, populates `flightPlan.waypoints`, recalculates `legsPageCount`. Works on both frontend and backend.
- **Files**: `src/store/useFMCStore.ts`, `server/src/fmc-engine.ts`

### BLOCKER 4: DEP/ARR terminal procedure selection

- **Problem**: DEP/ARR displayed SIDs, STARS, approaches as static text but every selectable LSK was `null`. Terminal procedures could not be selected.
- **Fix**: Rewired DEP page (SID, RUNWAY editable), ARR page (STAR, APPROACH, RUNWAY editable) with `set_sid`, `set_rwy`, `set_star`, `set_appr` handlers in both frontend and backend.
- **Files**: `shared/src/fmc/pages/route.ts`, `src/store/useFMCStore.ts`, `server/src/fmc-engine.ts`

## Oracle Round 29 Major Issues — FIXED

### MAJOR 5: THRUST LIM assumed temperature

- **Problem**: SEL OAT row showed assumed temperature but had no action to set it.
- **Fix**: Added `set_assumed_temp` action (`L2` on THRUST LIM page) with frontend/backend handlers. Updates `takeoff.assumedTemp`.
- **Files**: `shared/src/fmc/pages/setup.ts`, `src/store/useFMCStore.ts`, `server/src/fmc-engine.ts`

### MAJOR 6: DIR INTC / N1 LIMIT pages

- **Problem**: DIR INTC had no action for DIRECT TO entry. N1 LIMIT displayed static `---.-%` values.
- **Fix**: Added `set_direct_to` action with `directTo` field in `RouteData` type. N1 LIMIT page now shows mode-dependent N1 percentages (TO/TO 1/TO 2 presets).
- **Files**: `shared/src/types/fmc.ts`, `shared/src/fmc/pages/direct.ts`, `shared/src/fmc/pages/n1limit.ts`, `src/store/useFMCStore.ts`, `server/src/fmc-engine.ts`

### MAJOR 7: V-speed cross-field validation

- **Problem**: V1, VR, V2 validated individually but V1<VR<V2 ordering not enforced.
- **Fix**: `isValidVSpeeds()` updated to allow partial entry (0 values pass) and check ordering incrementally. `set_v1`, `set_vr`, `set_v2` now call cross-field validation on each entry. Detailed error messages: "V1<VR<V2 REQUIRED", "V1 MUST BE < VR", "VR MUST BE < V2".
- **Files**: `shared/src/fmc/validation.ts`, `src/store/useFMCStore.ts`, `server/src/fmc-engine.ts`

## Oracle Rounds 1-27 Summary (Previously Fixed)

### Core Infrastructure

- Server-side Airbus page rendering with `getAirbusPageRenderer()` fallback
- Backend LSK handling for CONTROL mode (L1-R6, page navigation, sub-pages, next/prev)
- `scratchpadError` field propagated through WebSocket to frontend display
- `advancePage()`/`rewindPage()` return boolean, only mark handled if state changes
- EXEC commits `holdPending` to `hold`; HOLD staged edits use `holdPending ?? hold`
- 25+ data-entry handlers with validation (ICAO, altitude, speed, temperature, wind, V-speeds, QNH)
- Frontend/backend validation parity for all data-entry actions
- All exposed `lskActions` now have corresponding frontend + backend handlers
- Backend special character keys: DOT→'.', SLASH→'/', SPACE→' ', PLUS_MINUS→'+/-', '+/-'→'+/-'
- `isModified`/`execLit` only set on successful data mutation, not on validation errors
- `handleDataEntry()` returns `boolean | 'error'` to distinguish validation failures

### Boeing Pages

- 7 missing function keys added (CLB, CRZ, DES, DIR_INTC, N1_LIMIT)
- 5 new page renderers: CLB, CRZ, DES, DIR INTC, N1 LIMIT
- LEGS delete flow (delete*wp*\* actions, deleteMode indicator)
- HOLD page with full staging (fix, inbound CRS, leg time/dist, direction)
- FIX page with radial/distance and ref fix input
- PROGRESS page with live aircraft state interpolation
- Nav database expanded (389 lines, 100+ airports)
- SimBrief XML/JSON import

### Airbus MCDU

- Full page suite: INIT A/B, F-PLN, PERF TO/APPR, PROG A, DEP/ARR A, SEC F-PLN, FUEL PRED, RAD NAV, DATA INDEX, MCDU MENU
- Airbus-specific function key mapping (DIR→DIR_INTC, DATA→DATA_INDEX)
- Airbus validation parity (from_to ICAO, crz_fl altitude, altn ICAO, block fuel, flex temp, CG)
- DisplayLine color support across all pages

### MSFS Integration

- PMDG 737 adapter via node-simconnect (SimConnect named pipe)
- FBW A320 adapter (mock data, documented limitation)
- Connection diagnostics panel with live aircraft state
- PMDG keypress event mapping (all 50+ CDU key events)
- PMDG CDU display polling (14 rows × 24 cols character readback)
- PMDG key mappings: DOT, PLUS_MINUS, SLASH, SPACE, INIT_REF, DIR_INTC, DEP_ARR, '+/-', all Airbus keys (INIT_A→INIT, F_PLN→RTE, PERF_TAKEOFF→PERF, PROG_A→PROG, DEP_ARR_A→DEP, MCDU_MENU→MENU, DATA_INDEX→MENU, RAD_NAV→MENU)
- Server fmc.display broadcasting with CDCDisplayData→DisplayData conversion

### Type Fixes

- `DisplayLine.color` changed from `string` to `DisplayColor` across all page renderers
- `TutorialState` interface added to FMCStore type
- `StoreAPI` type fixed to `import('zustand').StoreApi<FMCStore>`
- `connectedCapabilities` type fixed to `string[] | null`
- `devError` import added to useFMCStore.ts
- `src/tsconfig.json` include path fixed from `"src"` to `"."`

### Phase-by-Phase Completion

## Phase-by-Phase Completion

### Phase 0 (Bug Fixes) — COMPLETE

- [x] T0.1: Airbus MENU crash fixed
- [x] T0.2: Server FMCState fields added
- [x] T0.3: Null renderer check added
- [x] T0.4: TypeScript compilation clean
- [x] T0.5: Build verification passing

### Phase 1 (Display Engine) — COMPLETE

- [x] T1.1-T1.5: Color tokens, DisplayLine color support, Tailwind config, shared exports

### Phase 2 (Boeing Multi-Color) — COMPLETE

- [x] T2.1-T2.3: Cyan headers, white labels, green data applied to all pages
- [x] 7 missing function keys added

### Phase 3 (Airbus Accuracy) — COMPLETE

- [x] T3.1-T3.5: Corrected function key labels, MCDU MENU styling

### Phase 4 (Input Validation & Wiring) — COMPLETE

- [x] T4.1-T4.2: Input validation framework (9 validators) + store integration
- [x] T4.3: LEGS page waypoint editing (insert, delete, update constraints)
- [x] T4.4: HOLD page with staged changes
- [x] T4.5: FIX page with ref fix, radial/distance input
- [x] T4.6: Nav database expanded (389 lines, 100+ airports)
- [x] T4.7: SimBrief import UI

### Phase 5 (MSFS Integration) — MOSTLY COMPLETE

- [x] T5.1: node-simconnect installed
- [x] T5.2: Basic SimConnect connection in PMDG adapter
- [x] T5.3: Adapter interface updated
- [x] T5.4: PMDG keypress sending implemented
- [x] T5.5: FBW A320 adapter created (mock-only, documented)
- [x] T5.6: Connection diagnostics UI added
- [x] T5.7: MSFS data sync verified (server broadcasts, frontend receives)

### Phase 6 (Polish) — COMPLETE

- [x] T6.1: Failure mode annunciations (FAIL/OFF modes)
- [x] T6.2: Contextual LSK labels
- [x] T6.3: Button press animations
- [x] T6.4: Tutorial error detection (error count, hints, skip after 3 failures)
- [x] T6.5: Performance metrics (time tracking, localStorage, completion screen)

### Phase 7 (Testing, CI & Quality) — COMPLETE

- [x] T7.1: Vitest installed and configured with coverage thresholds.
- [x] T7.2-T7.6: Automated unit, E2E, and visual-regression baselines established. Current counts live in `docs/STATUS.md`.
- [x] T7.7: Audit Policy established in AUDIT_POLICY.md.

## Post-Oracle Fixes Applied

### Round 1

- [x] Missing Boeing page renderers created (CLB, CRZ, DES, DIR_INTC, N1_LIMIT)
- [x] Airbus color support added to all 12 pages
- [x] LEGS delete flow fixed (delete*wp*\* actions, visual indicator)
- [x] WebSocket fmc.display wired in frontend
- [x] Production console.log replaced with devLog/devError
- [x] `as any` usage removed from store and server

### Round 2

- [x] Remaining console.\* calls in useWebSocket.ts replaced
- [x] Server console.\* calls replaced (index.ts, PMDG adapter, FBW adapter)
- [x] Server fmc.display broadcasting added (converts CDUDisplayData → DisplayData)
- [x] FBW adapter stub comments removed
- [x] Airbus function key mapping fixed (DIR→DIR_INTC, DATA→DATA_INDEX)
- [x] Backend FMC engine support added for new Boeing pages

### Round 3

- [x] TypeScript compilation clean.
- [x] Automated unit and E2E tests passing at the time of that round.
- [x] Build successful.

### Round 4

- [x] 5 empty catch blocks replaced with devError logging
- [x] Airbus keys added to CDUKey type
- [x] Server fmc-engine.ts routes Airbus keys in processInput() and setPage()

### Round 5

- [x] Server-side Airbus page rendering fixed: `shared/src/fmc/pages/index.ts` getPageRenderer() now falls back to getAirbusPageRenderer() for Airbus pages
- [x] Verified: pressing Airbus keys (INIT_A, F_PLN, DATA_INDEX, etc.) in backend-authoritative/WebSocket CONTROL mode renders correct Airbus page instead of falling back to Boeing MENU

### Round 6

- [x] Backend LSK handling implemented in `server/src/fmc-engine.ts`
- [x] LSK actions (L1-R6) are now processed in CONTROL mode by looking up current page's lskActions
- [x] Page navigation actions mapped for both Boeing (pos_init, rte, legs, etc.) and Airbus (init_a, init_b, f_pln, perf_to, perf_appr, fuel_pred, sec_fpln, rad_nav, data_index, mcdu_menu, fpln_dep_arr)
- [x] Sub-page navigation (dep_page, arr_page, next_page, prev_page) handled
- [x] LEGS delete waypoint action handled when deleteMode is active
- [x] EXEC key handled (clears execLit and isModified flags)
- [x] NEXT_PAGE / PREV_PAGE handled for RTE and LEGS pages
- [x] Code refactored to remove comments — advancePage(), rewindPage(), handleLskAction() are self-documenting

### Round 7

- [x] Added `fpln_next` and `fpln_prev` action handling in backend handleLskAction (maps to advancePage/rewindPage)
- [x] Verified all Airbus lskActions have backend handlers

### Round 8

- [x] Backend `handleLskAction()` tracks `handled` flag
- [x] Unhandled actions set `scratchpadError = 'NOT SUPPORTED'` instead of silently no-oping

### Round 9

- [x] Added `scratchpadError` field to `DisplayData` shared type (`shared/src/types/fmc.ts`)
- [x] Server `getDisplayData()` includes `scratchpadError` from backend state
- [x] Frontend `setExternalDisplayData()` updates store `scratchpadError` from received display data
- [x] Backend `processInput()` clears `scratchpadError` on every new input
- [x] Fixed `advancePage()` / `rewindPage()` to return boolean — only mark `handled = true` if state actually changed
- [x] Fixed `fpln_next` / `next_page` false positives on unsupported pages (e.g., PERF_INIT, TAKEOFF_REF, F_PLN)

### Round 11

- [x] Added HOLD and FIX to backend functionKeys and pageMap
- [x] Backend DEL key toggles deleteMode on LEGS when scratchpad is empty
- [x] Added `handleDataEntry()` method with 25+ data-entry action handlers:
  - POS_INIT: set_ref_airport (ICAO validation), set_gate
  - RTE: set_origin, set_dest (ICAO validation), set_flt_no (flight number validation), set_route
  - PERF_INIT: set_crz_alt (altitude validation), set_cost_index, set_zfw, set_reserve
  - TAKEOFF_REF: set_runway, set_to_mode, set_v1/vr/v2 (speed validation), set_trim, set_oat (temperature validation), set_wind (wind validation), set_qnh
  - HOLD: set_hold_fix, set_inbound_crs, set_leg_time, set_leg_dist, set_hold_direction
  - FIX: set_fix_ref, set_fix_radial_distance
- [x] All data-entry handlers validate input and set scratchpadError on invalid data
- [x] TypeScript compilation clean (fixed `result.error` optional type with nullish coalescing)

### Round 12

- [x] EXEC key commits `holdPending` to `hold` (staged HOLD changes applied on EXEC)
- [x] HOLD staged edits use `holdPending ?? hold` as base — successive fields no longer overwrite each other
- [x] Added validation: set_cost_index (0-500), set_zfw (>0), set_reserve (>=0), set_runway (min 2 chars), set_to_mode (TO/TO 1/TO 2 only), set_trim (numeric), set_qnh (900-1100)
- [x] Added validation: set_inbound_crs (1-360), set_leg_time (0-9.9), set_leg_dist (>=0), set_hold_direction (L/R only)
- [x] Fixed set_fix_radial_distance: validates format "RADIAL/DISTANCE", both parts numeric and in range

### Round 13

- [x] Frontend validation parity with backend:
  - set_cost_index: 0-500 range
  - set_zfw: > 0
  - set_reserve: >= 0
  - set_runway: min 2 chars
  - set_to_mode: TO/TO 1/TO 2 only
  - set_trim: numeric validation
  - set_qnh: 900-1100 range
  - set_fix_radial_distance: radial 1-360 (was 0-360)
  - set_inbound_crs: 1-360 (was 0-360)
  - set_leg_time: max 9.9 (was 99.9)
  - set_hold_direction: validates L/R from scratchpad (was blind toggle)

### Round 14

- [x] Frontend set_flt_no: added isValidFlightNumber validation
- [x] Backend set_fix_radial_distance: distance upper bound 999
- [x] Backend set_leg_dist: upper bound 999
- [x] Backend set_hold_fix: added isValidWaypoint validation
- [x] Backend set_fix_ref: added isValidICAO validation
- [x] Imported isValidWaypoint in server/src/fmc-engine.ts

### Round 15

- [x] Added isValidFlightNumber import to frontend useFMCStore.ts
- [x] Fixed src/tsconfig.json include path to properly typecheck frontend files
- [x] Added backend Airbus data-entry handlers: set_from_to, set_crz_fl, set_altn, set_flt_nbr, set_block, set_sid, set_rwy, set_star, set_appr, set_flaps, set_flex, set_cg
- [x] Added TutorialState interface to FMCStore type
- [x] Fixed StoreAPI type to use import('zustand').StoreApi<FMCStore>
- [x] Changed DisplayLine.color from string to DisplayColor across all page renderers
- [x] Added devError import to useFMCStore.ts
- [x] Fixed connectedCapabilities type (string[] | null)

### Round 16

- [x] TypeScript: 0 errors in all 3 workspaces after fixing frontend tsconfig include
- [x] All unit tests pass (43/43)
- [x] All E2E tests pass (5/5)
- [x] Build successful

### Round 17

- [x] Frontend Airbus validation parity:
  - set_from_to: validates both ICAOs
  - set_crz_fl: validates with isValidAltitude
  - set_altn: validates with isValidICAO
  - set_block: rejects NaN and <= 0
  - set_rwy: rejects entries shorter than 2 chars
  - set_flex: rejects NaN
  - set_cg: rejects NaN

### Round 18

- [x] Removed unsupported Airbus lskActions from page renderers:
  - PERF_APPR: set_temp, set_mda, set_dh → null
  - FUEL_PRED: set_extra → null
  - SEC_FPLN: set_sec_from_to → null
  - RAD_NAV: set_vor1, set_vor2, set_adf1 → null
- [x] These actions were exposed but had no handlers; now they don't appear as interactive buttons

### Round 19

- [x] Removed remaining exposed but unhandled actions from all page renderers
- [x] Added backend handlers for select*to, select_to1, select_to2, atc, edit_wp*\*
- [x] All exposed lskActions now have corresponding frontend/backend handlers

### Round 21

- [x] Fixed INIT_REF mapping: backend now maps to POS_INIT (was IDENT), matching frontend
- [x] Backend special character keys: DOT→'.', SLASH→'/', SPACE→' ', PLUS_MINUS→'-'
- [x] Backend data entry sets isModified=true and execLit=true on successful entry
- [x] advancePage/rewindPage support PERF_INIT ↔ TAKEOFF_REF navigation

## Known Remaining Gaps (Acknowledged)

These are documented limitations and scope boundaries, not hidden completed work:

1. **npm audit**: 2 moderate vulnerabilities in esbuild/vite dev dependencies. Fixing requires `--force` breaking change to Vite 8.x. Deferred per original plan.

2. **FBW A320 adapter**: Aircraft state polling is scaffolded, but MCDU display readback and key I/O are mock-only in this build. The UI now states this explicitly in connection diagnostics.

3. **PMDG integration verification**: The PMDG 737 adapter has SimConnect connection, key-event mapping, aircraft-state polling, and CDU display polling code. The full keypress → PMDG CDU change → display readback round trip still requires live Windows + MSFS + PMDG validation and is not proven by automated tests on this macOS workspace.

4. **Airbus display-only pages**: PERF APPR, FUEL PRED, SEC F-PLN, RAD NAV, and DATA INDEX render, but several fields are static or intentionally non-interactive. They should be treated as display/training placeholders until real data-entry handlers and backend behavior are added.

5. **Navigation database accuracy**: The app uses an expanded mock nav dataset and lightweight route parser. It does not implement Navigraph/Aerosoft ingestion, ARINC 424 path/terminator logic, AIRAC cycle validity, or real global procedure expansion.

6. **CONTROL mode state divergence**: Frontend mutates local Zustand state immediately for responsiveness, then sends `fmc.input` to server. Server computes display and sends it back. The scratchpad text is local; display lines are server-authoritative. This is an intentional thin-client design pattern, not a bug.

7. **Test coverage limits**: Automated tests now cover the main preflight flow and key Oracle regressions. Still missing: live MSFS integration tests, deep visual pixel baselines against real hardware, full ARINC/navdata behavior, and exhaustive Airbus page interaction coverage.

8. **Visual accuracy**: Playwright now includes screenshot-backed nonblank rendering checks. There is still no formal pixel-diff baseline against real hardware photos, no licensed FMC bitmap font, and no claim of pixel-perfect hardware fidelity.

## What's Implemented and Working

### Automated Boeing Preflight Flow (IDENT → TAKEOFF REF)

1. IDENT page → LSK1 → POS INIT
2. POS INIT → REF AIRPORT (ICAO), GATE → LSK5 → RTE
3. RTE page 1 → ORIGIN (ICAO), DEST (ICAO), FLT NO, CO ROUTE → NEXT → page 2
4. RTE page 2 → ROUTE (parsed into waypoints via `parseRouteString`) → LSK6 → LEGS
5. LEGS → browse waypoints, edit constraints, delete with DEL mode → RTE3 → DEP/ARR
6. DEP/ARR → DEP page: SID (LSK2), RUNWAY (LSK3) → LSK6 → ARR page: STAR (LSK2), APPR (LSK3) → LSK6 → PERF INIT
7. PERF INIT → CRZ ALT, COST INDEX, ZFW, RESERVES → LSK5 → THRUST LIM
8. THRUST LIM → TO/TO1/TO2 modes, SEL OAT (LSK2) → LSK6 → TAKEOFF REF
9. TAKEOFF REF → RUNWAY, TO MODE, V1/VR/V2 (cross-field validated: V1<VR<V2), TRIM, OAT, WIND, QNH; page 2 supports landing runway, landing flaps, VREF, ILS frequency, and course → EXEC

### Secondary Flows

- HOLD page: set hold fix (waypoint), inbound course (1-360), leg time (0-9.9), leg dist (0-999), direction (L/R) → EXEC commits
- FIX page: set ref fix (ICAO), radial/distance (RADIAL/DIST format, radial 1-360, dist 0-999) → display radial/distance + abeam points
- PROGRESS page: shows live altitude, speed, heading, VS, DTG to next waypoint when MSFS connected
- CLB/CRZ/DES: display cruise altitude, wind, ISA deviation, optimal altitude, N1 (all static display — LSK actions for CRZ ALT entry)
- DIR INTC: set direct-to waypoint (ICAO) → display
- N1 LIMIT: displays mode-dependent N1 percentages based on TO/TO1/TO2 thrust mode
- Airbus MCDU: INIT A/B, F-PLN, PERF TO, PROG A, DEP/ARR A, SEC F-PLN, FUEL PRED, RAD NAV, DATA INDEX, MCDU MENU render correctly; INIT/F-PLN/DEP-ARR/PERF TO are covered by E2E flow tests, while several secondary pages remain static/display-only.
- SimBrief import: mocked API import is covered by E2E and loads origin/destination/route into the app.

## Phase 1 Hardening — Display/Scratchpad/EXEC Canonicalization

**Commit**: `2010195 feat(fmc): harden display grammar, scratchpad, and EXEC lifecycle`
**PR**: #4
**Date**: 2026-05-16

### What changed

| Workstream                           | Deliverable                                                                                                    | Status       |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------ |
| Strict 24x14 display-grid validation | `displayGridValidation.ts` — validates rows, cols, bounds, overflow, cell overlap                              | **Complete** |
| Renderer grammar conformance         | 18 validation tests + 19 renderer conformance tests (8 Boeing + 11 Airbus pages)                               | **Complete** |
| Scratchpad engine expansion          | Fixed `PERF/VNAV UNAVAILABLE` spelling; added 5 message factories; added adapter helpers                       | **Complete** |
| EXEC lifecycle helpers               | `fmcModificationAdapter.ts` — `deriveExecLit`, `deriveIsModified`, `isModificationActive`, `hasPendingChanges` | **Complete** |
| Grid bug fixes                       | 6 overflow/overlap bugs in IDENT, POS_INIT, TAKEOFF_REF, F-PLN                                                 | **Fixed**    |

### What remains transitional

- `scratchpad` and `scratchpadError` fields still exist in `FMCState` / `useFMCStore` — the new engine is exported but not yet the canonical runtime path
- `pendingRoute`, `pendingFlightPlan`, `isModified`, `execLit` boolean fields still used — not yet derived from `RouteModification`
- `pressLSK` in `useFMCStore` still contains hundreds of lines of inline action handling
- The store still directly manages scratchpad state, route changes, and EXEC lifecycle manually

### Known limitations

- Strict grid validation is active in tests only; production/debug-mode enforcement not yet wired
- Scratchpad engine integration into the store is partial (helpers available, not consumed)
- No action handler extraction from the monolithic store has been performed yet

### Tests added

- `displayGridValidation.test.ts` — 18 tests (bounds, overflow, overlap, edge cases)
- `rendererGrammar.test.ts` — 19 tests (8 Boeing + 11 Airbus renderer conformance)
- Test count: 180 → 499 (from prior baseline through Waves 1-4 and this hardening pass)

## Post-Dispatcher Stabilization

**Commit**: `9e829bc feat(fmc): introduce typed LSK dispatcher and complete store extraction (#17)`
**Date**: 2026-05-16

### What changed

| Cleanup                        | Detail                                                                                                                                                                                                                                                        | Status       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Blind MOD/EXEC removed         | Store-level `set({ isModified: true, execLit: true, ...patch })` eliminated; handlers now explicitly declare MOD/EXEC in their patches                                                                                                                        | **Complete** |
| Result application centralized | `applyDispatchResult()` added to `fmcScratchpadAdapter.ts`; side effects (`expand_active_route`, `step_plan`, `print_message`) and `scratchpadMessage` handling moved from store into shared module                                                           | **Complete** |
| Handler MOD/EXEC audit         | Verified `routeActions` (set_origin, set_dest, set_flt_no, set_route), `procedureActions` (set_sid, set_rwy, set_star, set_appr), and `takeoffActions` (set_v1, set_vr, set_v2, set_runway) explicitly set `isModified: true, execLit: true` in their patches | **Complete** |
| Docs updated                   | `STATUS.md` and `IMPLEMENTATION_STATUS.md` updated to reflect dispatcher milestone and post-stabilization state                                                                                                                                               | **Complete** |

### Rationale

Before the dispatcher merge, the store blindly set `isModified: true, execLit: true` on every successful patch, regardless of whether the action actually modified route data. This meant non-modifying actions (e.g., radio tuning, page navigation sub-state changes) would incorrectly light the EXEC indicator.

With the dispatcher extraction complete, each handler is responsible for declaring its own modification intent. The store now applies patches without adding MOD/EXEC flags, letting the handlers control this behavior explicitly.

## Post-Dispatcher Cleanup (#18–#22)

**Branch**: `main`
**Date**: 2026-05-16

| PR  | Detail                                                                                                                             | Status     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| #18 | Centralized dispatcher result application — removed duplicate `set({ isModified, execLit })` from store                            | **Merged** |
| #19 | Centralized HOLD field staging pattern — `stageHoldField()` shared helper                                                          | **Merged** |
| #20 | Added `atsu_uplink_received` side effect to `applyDispatchResult()`                                                                | **Merged** |
| #21 | Navigation result handling moved into `applyDispatchResult`; remaining `scratchpadError` writes migrated to `failScratchpad`       | **Merged** |
| #22 | Removed duplicate patch application in `applyDispatchResult`; fixed `clearScratchpad` order bug (must clear BEFORE applying patch) | **Merged** |

### Key fixes

- **`clearScratchpad` order**: The adapter was clearing scratchpad AFTER applying the state patch, which caused values set by the patch to be wiped. Fixed to clear first, then apply.
- **`failScratchpad` migration**: `pressEXEC` and `insertWaypoint` migrated from direct `set({ scratchpadError })` to typed `failScratchpad()` calls.
- **V-speed test flakiness**: Zustand state contamination between tests; fixed with explicit `resetState() + scratchpadState` in test setup.

## Cockpit Visual Regression (#23)

**Commit**: `5f46b79`
**Date**: 2026-05-17

| Deliverable       | Detail                                                                              | Status       |
| ----------------- | ----------------------------------------------------------------------------------- | ------------ |
| Test file         | `e2e/visual/cockpit-layouts.spec.ts` — 195 lines                                    | **Merged**   |
| Boeing tests      | FMC focus, navigation, automation, approach, full deck (5 tests)                    | **Merged**   |
| Airbus tests      | FMC focus, navigation, automation, approach, full deck (5 tests)                    | **Merged**   |
| Layout assertions | Full deck panel completeness, help sidebar docking, panel tray visibility (3 tests) | **Merged**   |
| Baselines         | 2 initial screenshots captured (approach + automation modes)                        | **Captured** |

### Test conventions

- `@Visual Regression` tag for grep-filtered execution (`npm run test:visual`)
- `maxDiffPixelRatio: 0.02` tolerance
- Store-based mode switching via `window.useCockpitLayoutStore` (avoids UI button dependency)
- Aircraft switch via `window.useAircraftStore.setAircraft('AIRBUS_A320')`
- Desktop viewport: 1440×900

## Navigation Display Realism (#24)

**Commit**: `4c87e84`
**Date**: 2026-05-17

| Deliverable             | Detail                                                                                                     | Status       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ |
| Boeing ND style         | MAP frame sharpened with Boeing-oriented green CRT treatment and data-dense route context                  | **Merged**   |
| Airbus ND style         | ARC presentation separated with Airbus LCD/bloom treatment and family-specific labeling                    | **Merged**   |
| Route context           | Active waypoint, segment, discontinuity, constraint, FIX/HOLD, procedure, and range context remain visible | **Merged**   |
| Failure/aligning states | Boeing MAP failure and Airbus ARC aligning states have visual baselines                                    | **Merged**   |
| Visual validation       | Current command result lives in `docs/STATUS.md`                                                           | **Verified** |

### Next visible gaps

- Training cards still need to become state-aware and react to real FMC/autoflight progress.
- Deeper flight-director, LNAV/VNAV, and approach cue behavior remains deferred until the guidance models are richer.
- Mobile/portrait PWA layouts still need stable local browser coverage before they can be treated as protected.

## Primary Flight Display And Autoflight Visual Polish

**Base commit**: `4268f7d`
**Date**: 2026-05-17

| Deliverable              | Detail                                                                                                                                                                      | Status          |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Shared PFD model         | Added selected heading, selected vertical speed, managed cues, and failure flags to the shared PFD state                                                                    | **Implemented** |
| Boeing PFD               | Added brighter attitude sphere, pitch ladder, bank scale, flight-director cue, speed/altitude tapes, VSI, selected heading/speed/altitude bugs, and Boeing-style bottom row | **Implemented** |
| Airbus PFD               | Wired Airbus PFD to `useAutopilotStore` FCU state, added Airbus colors, managed cue dots, cyan FD, speed/altitude tapes, VSI, and Airbus-style bottom row                   | **Implemented** |
| PFD follow-up baselines  | Added deterministic Boeing/Airbus focused, approach, and failure/unavailable PFD routes and snapshots                                                                       | **Captured**    |
| MCP/FCU hardware pass    | Refined Boeing MCP and Airbus FCU with distinct panel surfaces, display windows, annunciators, knobs, and push/pull affordances                                             | **Implemented** |
| Autoflight coupling      | Standalone cockpit MCP/FCU button presses now update the autoflight truth state that feeds the PFD FMA                                                                      | **Covered**     |
| Focused/tablet baselines | Added focused-panel baselines for CDU/MCDU, ND, PFD, MCP/FCU plus tablet-landscape full-deck and automation layouts                                                         | **Captured**    |
| Unit/E2E coverage        | Added PFD/FMA model tests and cockpit behavior checks for selected heading and Airbus managed/selected state                                                                | **Covered**     |

### Remaining PFD scope

- Deeper flight-director command behavior once the LNAV/VNAV/autoflight model is richer.
- Measured hardware-reference comparison for PFD/MCP/FCU dimensions, colors, and typography.
