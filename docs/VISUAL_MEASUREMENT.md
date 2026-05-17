# Visual Measurement Method

## Baseline Capture

Run:

```bash
npm run capture:baseline
```

Playwright writes screenshots under `test-results/`. These are generated artifacts and are intentionally ignored by Git.

Each capture test also attaches a `baseline-manifest` JSON payload with screenshot name, output path, viewport, detected aircraft label, and first display row. Use that manifest when importing screenshots into a reference comparison run.

## Fidelity Manifest Gate

Run:

```bash
npm run measure:visual
```

This checks the reference manifest, measurement profile files, committed app-owned Playwright baselines, and whether any profile is backed by a reference explicitly approved for pixel measurement. It writes `docs/VISUAL_FIDELITY_REPORT.md`, which classifies each cockpit surface as snapshot-protected, measured against references, pilot-reviewed, and live-validated.

The current gate is intentionally conservative: it warns when no rights-cleared hardware reference crops are approved for pixel measurement and must not be used as a hardware-accuracy claim. Derived geometry or palette profiles protect internal consistency only until their source references are approved.

## Reference Intake

Use `reference-library/references.json` for source metadata. Before a reference image is used for measurement, record:

- Source and usage rights.
- Aircraft and unit generation.
- Display type.
- Page/screen shown.
- Crop bounds.
- Perspective correction assumptions.
- Whether the reference is suitable for color, geometry, or only qualitative comparison.
- `pixelMeasurementApproved: true` only after rights/provenance review is complete.

## Geometry

- Normalize the app and reference crop to the CDU/MCDU display area.
- Fit a 24-column x 14-row grid.
- Measure row baselines, column anchors, left/right label alignment, and scratchpad alignment.
- Use the `DisplaySegment`/`GridDisplayData` model as the app-side measurement contract. Every rendered glyph must have stable row and column coordinates exposed through DOM measurement hooks.
- Boeing CDU shell checks should include display bay bounds, LSK vertical alignment, keycap dimensions, key gaps, screw positions, bezel thickness, and function-key row placement.
- ND checks should include arc/rose center, clipping boundary, range-ring radii, route-segment clipping, FIX ring scale, and HOLD racetrack orientation once aircraft-specific ND frames are implemented.
- Phase 1 target: Boeing character-position variance <= 4%.
- End-state target: Boeing character-position variance <= 3%.

## Color

- Use calibrated or documented display assumptions.
- Sample Boeing white, cyan, green, magenta, shaded/inverse, amber/warning.
- Sample Airbus white, blue, green, amber, magenta.
- Convert to CIELAB and compute Delta E.
- Phase 1 Boeing target: Delta E <= 4.
- End-state Boeing target: Delta E <= 3.
- Airbus near-term target: Delta E <= 5.

## Performance

- Measure iPad or iPad-profile frame rate during page changes, keypresses, tutorial highlight, and connection diagnostics.
- Target: >= 55 fps with animations enabled.
