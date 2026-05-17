# Known Limitations

VirtualCDU is a web-based procedure trainer. It is not certified, approved, or suitable for real-world flight operations.

## Current Technical Limits

- Visual fidelity is not yet measured against a curated real-hardware reference set. Current Playwright screenshots, focused-panel baselines, tablet-landscape baselines, and 3456x2234/Retina baselines prove render stability, not hardware accuracy.
- The visual measurement gate currently validates manifest/profile/snapshot readiness. Real hardware pixel measurement still requires approved reference crops and recorded measurement evidence.
- The app uses an expanded mock navigation dataset, typed route fixtures, and lightweight route parser. It does not yet provide global AIRAC coverage, full ARINC 424 behavior, or real navdata update cycles.
- PMDG integration code exists, but the full keypress -> PMDG CDU update -> display readback loop still requires live validation on Windows with MSFS and PMDG installed.
- FBW A320 aircraft-state polling is scaffolded, but real MCDU display readback and key I/O are mock-only unless a dedicated mapping phase is approved.
- Airbus secondary pages such as PERF APPR, SEC F-PLN, RAD NAV, and DATA INDEX are partly display-only until explicitly wired and tested. PROG and FUEL PRED consume shared trainer-grade LNAV/performance truth where currently implemented, but remain scoped trainer pages.
- The Navigation Display and Primary Flight Display are trainer-grade visualizations. They are not real avionics replicas, certified flight displays, weather/terrain/TCAS systems, or live simulator display mirrors.
- CONTROL mode intentionally keeps some immediate frontend responsiveness while server display data becomes authoritative. This behavior must remain documented and tested.
- `npm audit` currently reports two moderate Vite/esbuild development dependency issues. The available automatic fix requires a breaking Vite upgrade and is deferred.

## Scope Boundaries

- No certification as a training device.
- No real-world operational-use claims.
- No proprietary Boeing/Airbus fonts or reference imagery unless licensing is clear.
- No full ARINC 424 all-leg support in the first navdata phase.
- No full FBW/Fenix integration in v1 unless separately scoped.
- No hardware pixel-accuracy claim until the measurement report marks the specific surface as measured against approved references.
