# Visual Realism

**Last updated:** 2026-05-21

This document tracks visual realism measurements, design tokens, rendering effects, visual regression coverage, and known gaps for the Boeing/Airbus cockpit trainer displays.

## Hardware Realism Controls (Phase 1 + Phase 2)

**Added:** Visual Realism Pass — May 2026

A new always-visible avionics-styled control strip (`HardwareRealismControls`) gives users direct, granular control over the CDU display’s hardware character:

| Slider | Effect                                               | Range | Default |
| ------ | ---------------------------------------------------- | ----- | ------- |
| CRT    | Overall intensity (persistence, vignette, base glow) | 0–100 | 65      |
| WEAR   | Glass haze + physical wear                           | 0–100 | 35      |
| BLOOM  | Extra text glow / bloom strength                     | 0–100 | 40      |
| SCAN   | Independent scanline density                         | 0–100 | 25      |

### Phase 2 Dynamic Effects

- **Micro-scratches** — Fine diagonal texture that appears and intensifies with WEAR
- **Dynamic light reflection** — Subtle catchlight that softens and diffuses as wear increases
- **Live contrast filter** — Display bay contrast scales with wear intensity

These effects are implemented in `BoeingDisplayBay.tsx` and `AirbusDisplayBay.tsx` and respond in real time to the store.

### Technical Implementation

- Store: `src/store/displaySettingsStore.ts`
- Renderer: `src/renderers/ClassicCrtRenderer.ts` (now accepts `bloomIntensity` and `scanlineIntensity`)
- Controls: `src/components/CDU/HardwareRealismControls.tsx`
- Placement: Below CDU shell in both `Boeing737CDU.tsx` and `AirbusMCDU.tsx`

### Visual Regression Strategy

- Added `data-testid="hardware-realism-controls"`
- Masking applied in `e2e/visual/cockpit-layouts.spec.ts` and `e2e/visual/critical-screenshots.spec.ts`
- Recommended tolerance: `maxDiffPixelRatio: 0.04` on focused CDU panels

---

## Reference Measurements

Current executable visual-fidelity manifest/report:

- `npm run measure:visual`
- `docs/VISUAL_FIDELITY_REPORT.md`

The report separates app-owned snapshot protection from measured reference fidelity, pilot review, and live validation. It currently records hardware pixel accuracy as not measured because no rights-cleared hardware reference crops have been approved for measurement.

Full token-derived measurements are documented in:

- `docs/reference-library/boeing-737-cdu/measurements.md`
- `docs/reference-library/airbus-a320-mcdu/measurements.md`

### Quick Reference — Boeing 737 CDU

| Measurement         | Value                                 |
| ------------------- | ------------------------------------- |
| Shell (W×H)         | 146 × 228 mm                          |
| Bezel corner radius | 6 mm                                  |
| Bezel thickness     | 12 mm                                 |
| Screen (W×H)        | 102 × 78 mm                           |
| Screen aspect ratio | 1.308:1                               |
| Screen recess depth | 8 mm                                  |
| Display grid        | 14 rows × 24 columns                  |
| Row height          | 5.5 mm                                |
| Character width     | 4.25 mm                               |
| Keypad              | 5 × 7 grid, 12 mm keys, 16 mm spacing |
| Annunciators        | 18 × 8 mm, 4 mm spacing               |

### Quick Reference — Airbus A320 MCDU

| Measurement           | Value                                 |
| --------------------- | ------------------------------------- |
| Shell (W×H)           | 146 × 228 mm                          |
| Bezel corner radius   | 4 mm                                  |
| Bezel thickness       | 10 mm                                 |
| Screen (W×H)          | 116 × 86 mm                           |
| Screen area vs Boeing | +25.4%                                |
| Screen recess depth   | 4 mm                                  |
| Display grid          | 14 rows × 24 columns                  |
| Row height            | 6.1 mm                                |
| Character width       | 4.8 mm                                |
| Keypad                | 6 × 6 grid, 11 mm keys, 15 mm spacing |
