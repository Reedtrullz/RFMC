# Known Limitations

VirtualCDU is a web-based procedure trainer. It is not certified, approved, or suitable for real-world flight operations.

## Current Technical Limits

- Visual fidelity is not yet measured against a curated real-hardware reference set. Current Playwright screenshots and baseline capture prove render stability, not hardware accuracy.
- The Boeing display uses color-capable render data, but font metrics, character cell geometry, color Delta E, and bezel/key spacing still need Phase 0/1 measurement.
- The app uses an expanded mock navigation dataset, typed route fixtures, and lightweight route parser. It does not yet provide global AIRAC coverage, full ARINC 424 behavior, or real navdata update cycles.
- PMDG integration code exists, but the full keypress -> PMDG CDU update -> display readback loop still requires live validation on Windows with MSFS and PMDG installed.
- FBW A320 aircraft-state polling is scaffolded, but real MCDU display readback and key I/O are mock-only unless a dedicated mapping phase is approved.
- Airbus secondary pages such as PERF APPR, FUEL PRED, SEC F-PLN, RAD NAV, and DATA INDEX are partly display-only until explicitly wired and tested.
- CONTROL mode intentionally keeps some immediate frontend responsiveness while server display data becomes authoritative. This behavior must remain documented and tested.
- `npm audit` currently reports two moderate Vite/esbuild development dependency issues. The available automatic fix requires a breaking Vite upgrade and is deferred.

## Scope Boundaries

- No certification as a training device.
- No real-world operational-use claims.
- No proprietary Boeing/Airbus fonts or reference imagery unless licensing is clear.
- No full ARINC 424 all-leg support in the first navdata phase.
- No full FBW/Fenix integration in v1 unless separately scoped.
