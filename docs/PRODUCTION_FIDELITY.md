# Production Fidelity Roadmap

VirtualCDU is positioned as a high-fidelity desktop procedural trainer. It must not imply certification, airline approval, or suitability for real-world navigation unless a separate qualification programme proves that claim.

## Vertical Slice Order

1. Boeing 737 NG CDU shell, key system, display grid, and screenshot gates.
2. Boeing CDU page-zone migration behind the existing page renderers.
3. Aircraft-profile measurement gates for shell geometry, display grid, colours, lighting, and touch targets.
4. ND profile split and replay-based symbology tests.
5. PFD replay slice with FMA, attitude, tapes, bugs, and flags.
6. Adapter gateway for SimBrief, navdata, and simulator telemetry.
7. Production hardening: branch protection, security checks, release/rollback, PWA/iPad validation.

## Profile-Driven Contract

The shared avionics profile types define the minimum production-fidelity contract:

- `AircraftProfile`: product positioning, aircraft family, scope limitations, and profile binding.
- `DisplayProfile`: shell geometry, 24x14 text grid, colour semantics, lighting, typography, and input policy.
- `ShellGeometry`: normalized display aperture, key matrix, function-key block, LSK centres, and screw fiducials.
- `AdapterCapabilities` and `AdapterHealth`: provider-independent capability, version, health, latency, nav-cycle, and stale-data reporting.
- `TelemetryFrame` and `FlightPlanModel`: canonical UI-facing models that keep provider-specific payloads out of instrument components.

The first concrete profile is `boeing-737ng-cdu-v1`. Airbus and later 737 MAX profiles should be added only after the Boeing CDU slice passes the measurement and screenshot gates.

## Reference Policy

Store derived measurements, palettes, masks, and metadata in `reference-library/`. Do not commit copyrighted manuals, third-party photos, or provider material unless redistribution rights are explicit.

Current seed artifacts:

- `reference-library/measurements/boeing-737ng-cdu.v1.json`
- `reference-library/palettes/boeing-737ng-cdu.v1.json`
- `reference-library/states/canonical-avionics-states.v1.json`

The seed measurements are normalized implementation fiducials. They are not evidence of measured hardware accuracy until replaced by rectified, rights-cleared reference measurements.

## Gates

- Status/doc gate: `npm run check:status-docs`.
- Static and unit gate: `npm run typecheck:all` and `npm test -- --run`.
- Behavioral gate: `npm run test:e2e`.
- Build gate: `npm run build`.
- Visual gate: `npm run capture:baseline` plus reviewed `toHaveScreenshot()` updates for intentional shell/display changes.
- Manual external gates: pilot review, licensing review, physical iPad review, and Windows/MSFS/PMDG live validation.
