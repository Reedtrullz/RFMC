# Changelog

## Unreleased

- Added standalone ND training visuals with route, discontinuity, FIX, HOLD, procedure, range, mode, and overlay context.
- Added speed/altitude constraint labels to the ND training display.
- Fixed route-string constraint parsing so ND labels use structured speed/altitude constraints.
- Added DIR INTC active-target context to the ND training display.
- Added shared ND model and frontend/E2E coverage for Boeing/Airbus route context and iPad layout.
- Added Phase 0 implementation artifacts for the consolidated VirtualCDU masterplan.
- Added test matrix, pilot review rubric, known limitations, metrics, scope, roadmap, and reference-library metadata.
- Added repeatable Playwright baseline screenshot capture script.
- Added SimBrief route fixtures for future navdata/procedure realism tests.
- Added shared display semantics and unit tests.
- Added CI-safe mock SimConnect adapter and unit tests.
- Added typed navdata/route fixture validation and tests.
- Added display-line semantic DOM hooks for visual measurement tooling.
- Added V-speed invalidation when takeoff runway changes after speeds are entered.
- Hardened the service worker app-shell cache and avoided caching SimBrief/API-style dynamic requests.
- Added an aircraft adapter factory and CI mock-adapter path.
- Added GitHub Actions CI for typecheck, unit tests, E2E, build, and high/critical audit policy.
- Refactored the bridge server into a testable `createBridgeServer()` module and added mock WebSocket CONTROL-mode coverage.
- Applied display-semantic tagging to Boeing setup and Airbus page renderer helpers.
- Extended display-semantic tagging across the primary Boeing page renderers.
- Added baseline screenshot manifest attachments with viewport and page metadata.
- Added supported Boeing `DES NOW` trainer action with frontend/backend behavior.
- Expanded SimBrief route fixtures to the Phase 4 minimum of 20 routes.
