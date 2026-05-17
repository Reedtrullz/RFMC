# Visual Realism

**Last updated:** 2026-05-17

This document tracks visual realism measurements, design tokens, rendering effects, visual regression coverage, and known gaps for the Boeing/Airbus cockpit trainer displays.

## Reference Measurements

Current executable visual-fidelity manifest/report:

- `npm run measure:visual`
- `docs/VISUAL_FIDELITY_REPORT.md`

The report separates app-owned snapshot protection from measured reference fidelity, pilot review, and live validation. It currently records hardware pixel accuracy as not measured because no rights-cleared hardware reference crops have been approved for measurement.

Full token-derived measurements are documented in:
- `docs/reference-library/boeing-737-cdu/measurements.md`
- `docs/reference-library/airbus-a320-mcdu/measurements.md`

### Quick Reference — Boeing 737 CDU

| Measurement | Value |
|-------------|-------|
| Shell (W×H) | 146 × 228 mm |
| Bezel corner radius | 6 mm |
| Bezel thickness | 12 mm |
| Screen (W×H) | 102 × 78 mm |
| Screen aspect ratio | 1.308:1 |
| Screen recess depth | 8 mm |
| Display grid | 14 rows × 24 columns |
| Row height | 5.5 mm |
| Character width | 4.25 mm |
| Keypad | 5 × 7 grid, 12 mm keys, 16 mm spacing |
| Annunciators | 18 × 8 mm, 4 mm spacing |

### Quick Reference — Airbus A320 MCDU

| Measurement | Value |
|-------------|-------|
| Shell (W×H) | 146 × 228 mm |
| Bezel corner radius | 4 mm |
| Bezel thickness | 10 mm |
| Screen (W×H) | 116 × 86 mm |
| Screen area vs Boeing | +25.4% |
| Screen recess depth | 4 mm |
| Display grid | 14 rows × 24 columns |
| Row height | 6.1 mm |
| Character width | 4.8 mm |
| Keypad | 6 × 6 grid, 11 mm keys, 15 mm spacing |
| Annunciators | 15 × 6 mm |

## Design Token Philosophy

Design tokens separate physical measurements from rendering code. Each aircraft family has its own token file defining exact millimeter values for shell dimensions, screen geometry, keypad layout, and more. Components consume tokens via CSS custom properties, enabling:

- **Aircraft-specific rendering**: Changing Boeing tokens does not affect Airbus layout
- **Testable fidelity**: Tokens can be asserted in visual and unit tests
- **Measurable progress**: Each token value represents a measurable visual property
- **Responsive scaling**: Millimeter values scale proportionally on different screen sizes

Token files: `src/components/instruments/common/tokens/boeing-cdu.tokens.ts` and `airbus-mcdu.tokens.ts`

## Screen Effects

The `ScreenGlass` component applies post-processing effects to the display surface:

### CRT Effects (Boeing CDU)
- **Scanlines**: Horizontal lines emulating CRT raster scan
- **Phosphor glow**: Subtle green glow around bright characters
- **Vignette**: Darkening toward screen edges
- **Film grain**: Subtle noise overlay for texture
- **Phosphor persistence**: Faint after-image of previous frame content

### LCD Effects (Airbus MCDU)
- **LCD bloom**: Subtle light bleed around characters
- **Reduced scanlines**: Less pronounced than CRT (Airbus uses LCD-CRT hybrid)
- **Color temperature**: Warmer amber-white balance

### Night Glow System
When cockpit brightness is reduced:
- Screen brightness decreases proportionally
- Bezel edge glow increases (backlight bleed simulation)
- Keycap backlight intensity increases
- Ambient reflection decreases

## Shell Realism Layers

The `InstrumentShell` component applies multiple layers to create depth:

| Layer | Purpose |
|-------|---------|
| Base chassis | Dark gray/black body with subtle texture |
| Bezel | Thick raised frame around display area |
| Edge highlight | Subtle light catch on bezel edges |
| Wear texture | Microscopic scratches and wear marks |
| Screw heads | 4+ corner fasteners with slight rotation variation |
| Inner screen recess | Shadow gradient showing screen depth |
| Cockpit mounting | Contextual background for instrument placement |

## Visual Gaps Tracking

Currently identified gaps between rendered output and reference hardware:

| Gap | Status | Notes |
|-----|--------|-------|
| Flat display surface | Addressed | ScreenGlass provides recess depth |
| Insufficient bezel depth | Addressed | InstrumentShell with GeometryProfiles |
| Generic button styling | Addressed | AvionicsKey with aircraft-specific shapes |
| Weak screen glass/reflection | Addressed | ScreenGlass reflection overlay |
| Weak night glow | Addressed | Brightness-responsive glow system |
| LSK-to-row alignment | Addressed | BoeingDisplayBay/AirbusDisplayBay grid layout |
| Large-desktop scaling | Protected | 3456x2234 and Retina-equivalent cockpit baselines now protect major Boeing/Airbus modes |
| Mobile/tablet scaling | In progress | Desktop, Retina, 3456x2234, and tablet-landscape cockpit baselines now protect major layouts; portrait/mobile remain caveated |
| CRT scanline density | Needs tuning | Scanline frequency vs pixel density |
| ND aircraft-family separation | Addressed in PR #24 | Boeing MAP and Airbus ARC baselines now verify distinct visual treatment |
| PFD realism | Protected follow-up states | Boeing/Airbus PFDs now have distinct attitude, tapes, FMA, VSI, selected bugs, and automation/focused/approach/failure baselines |
| MCP/FCU realism | Initial hardware pass implemented | Boeing MCP and Airbus FCU now have distinct panel geometry, display windows, button/knob treatment, and autoflight/FMA coupling |
| Focused/tablet baselines | Expanded | Focused CDU/MCDU, ND, PFD, MCP/FCU, and tablet-landscape cockpit modes are covered |
| Visual-fidelity manifest | Implemented | `npm run measure:visual` checks reference metadata, measurement profile presence, and app-owned baseline coverage |

## Current Instrument Baseline Coverage

Current visual coverage includes:

- CDU/MCDU page baselines for core Boeing and Airbus pages.
- Cockpit layout baselines from PR #23 for Boeing/Airbus task modes.
- ND baselines from PR #24 for Boeing MAP, Boeing MAP failure, Airbus ARC, and Airbus ARC aligning.
- PFD baselines for Boeing/Airbus automation, focused, approach, and failure/unavailable states.
- Focused-panel baselines for Boeing/Airbus CDU/MCDU, ND, PFD, and MCP/FCU.
- Tablet-landscape baselines for Boeing/Airbus full-deck and automation modes.
- High-resolution cockpit baselines for Boeing/Airbus task modes and focused panels at 3456x2234 and 1728x1117 deviceScaleFactor 2.

The source of truth for the latest command results is `docs/STATUS.md`.

## Next Realism Priorities

1. Workflow integration: training cards should agree with selected values, active/armed modes, route state, and workflow progress.
2. Deeper guidance cues: LNAV/VNAV and approach guidance should eventually drive flight-director command behavior instead of static trainer cues.
3. Hardware measurement: cockpit screenshots and `npm run measure:visual` prove render stability and manifest completeness, but still need measured rights-cleared reference comparison before claiming hardware accuracy.
4. Tablet/portrait hardening: iPad portrait and mobile Safari still need stable local browser coverage before they can be claimed as protected.

## How to Measure and Improve Fidelity

1. **Collect reference images** from actual 737 CDU and A320 MCDU hardware (add to `docs/reference-library/*/hardware/`)
2. **Extract measurements** from reference images (pixel measurements against known dimensions)
3. **Update token files** with refined values
4. **Capture visual baselines** before and after changes: `npm run capture:baseline`
5. **Run the fidelity manifest**: `npm run measure:visual`
6. **Review diffs**: Compare Playwright screenshot diffs between baseline and updated renders
7. **Run visual regression tests**: `npm run test:visual`

## Visual Baseline Snapshots

Required baselines for fidelity tracking:
- Boeing CDU default cockpit mode
- Boeing IDENT, POS INIT, RTE, LEGS (with discontinuity), PERF INIT, TAKEOFF REF (complete)
- Boeing EXEC pending state
- Airbus MCDU default cockpit mode
- Airbus INIT A, F-PLN (with discontinuity), PERF TAKEOFF, PROG
- Boeing ND MAP and MAP failure
- Airbus ND ARC and ARC aligning
- Boeing and Airbus cockpit layout task modes
- Boeing and Airbus automation, focused, approach, and failure PFDs
- Focused Boeing/Airbus CDU/MCDU, ND, PFD, and MCP/FCU panels
- Tablet-landscape Boeing/Airbus full-deck and automation layouts
- 3456x2234 and Retina-equivalent Boeing/Airbus cockpit task modes and focused panels
- Mobile/portrait layouts (still caveated until local browser coverage is stable)

These are captured using Playwright: `CAPTURE_BASELINE=1 npx playwright test e2e/baseline-screenshots.spec.ts`
