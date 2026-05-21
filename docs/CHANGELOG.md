# Changelog

## [Unreleased] - Visual Realism Pass

### Visual Realism Controls (Phase 1 + Phase 2)

- Added **HardwareRealismControls** — always-visible avionics-styled panel with four independent sliders:
  - **CRT** — Overall intensity (persistence, vignette, base effects)
  - **WEAR** — Glass haze and physical wear simulation
  - **BLOOM** — Extra text glow / bloom strength
  - **SCAN** — Independent scanline density and opacity

- Extended `displaySettingsStore` with `bloomIntensity`, `scanlineIntensity`, and `resetRealism()`.

- Enhanced `ClassicCrtRenderer` to respect granular bloom and scanline controls while preserving existing multi-pass glow and persistence logic.

- Implemented **Phase 2 dynamic effects**:
  - Live micro-scratches that scale with WEAR
  - Dynamic light reflection / catchlight that softens with wear
  - Contrast filter on the display bay

- Added advanced bezel materials (brushed metal texture, multi-layer machined lighting, improved screws).

- Full parity on both Boeing 737 CDU and Airbus A320 MCDU.

### Testing & Quality

- Added masking strategy for visual regression tests on the new realism controls.
- Created unit tests for the extended display settings store.

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
