# Changelog

## [1.0.0] - 2026-05-12

### Visual & Fidelity
- Finalized high-fidelity Navigation Display (ND) evolution with family-specific CRT/LCD aesthetics (Airbus bloom/Boeing sharp).
- Integrated the open-source **B612 Mono** font for high-legibility digital avionics (24x14 grid).
- Added a functional interactive **BRT** (brightness) slider to the CDU bezel.
- Overhauled Boeing IDENT and POS INIT pages for 737-specific visual semantics and standard LSK mappings.
- Implemented data-dense ND anchor zones for TAS, GS, Wind, and active waypoint navigation data.
- Added display-line semantic DOM hooks for visual measurement tooling.

### Procedural & Logic
- Implemented a complete training curriculum with A/B/C grading, mastery scores, and PF/PM role callouts.
- Added adaptive "smart" hinting for contextual error guidance.
- Implemented ARINC-Lite procedure expansion for SIDs/STARs and route validation.
- Added V-speed cross-field validation (V1 < VR < V2) with descriptive error messages.
- Added Boeing `DES NOW` trainer action and runway-change V-speed invalidation.
- Implemented LEGS discontinuity resolution and route-string constraint parsing.
- Added secondary Boeing pages: CLB, CRZ, DES, DIR INTC, N1 LIMIT.
- Expanded Airbus MCDU suite: INIT A/B, F-PLN, PERF TO/APPR, PROG A, DEP/ARR A, SEC F-PLN, FUEL PRED, RAD NAV, DATA INDEX, MCDU MENU.

### Integration & Infrastructure
- Established a robust MSFS connection state machine with heartbeats and latency tracking.
- Implemented a CI-safe mock SimConnect adapter for testing.
- Added SimBrief XML/JSON import support with 20 versioned route fixtures.
- Migrated to `vite-plugin-pwa` for robust offline iPad cockpit mode.
- Added iOS-specific safe-area support and native-feel touch controls.
- Established a GitHub Actions CI pipeline for automated quality gates (tests, types, build, audit).

### Quality & Testing
- Hardened E2E suite to 15 passing tests with visual regression baselines.
- Achieved 112 unit tests covering core FMC logic and edge cases.
- Resolved all type-parity issues between frontend store and backend authoritative engine.
- Established the VirtualCDU Audit Policy and consolidated the roadmap/metrics/scope artifacts.

## [0.1.0] - 2026-05-01
- Initial release with basic Boeing 737 CDU functionality and SimConnect bridge.
