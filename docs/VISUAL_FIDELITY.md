# Visual Fidelity Targets

This document defines the measured visual standards for the RFMS instrument displays. No visual change is accepted unless it improves measured fidelity or preserves existing measured fidelity.

## Boeing 737 CDU

- **Display Grid**: 24 columns x 14 rows.
- **LSK Alignment**: LSK buttons must align exactly to CDU display rows 2, 4, 6, 8, 10, and 12.
- **Page Layouts**: IDENT, POS INIT, RTE, LEGS, PERF INIT, and TAKEOFF REF must not overflow or cause layout shifts.
- **Screen Width**: Content should fill the usable display width (approx. 100% of the display bay interior).
- **Scratchpad**: Must remain exactly one row high.

## Airbus A320 MCDU

- **Display Grid**: 24 columns x 14 rows.
- **Scratchpad**: Must remain exactly one row high.
- **Isolation**: Airbus visual changes must not affect Boeing screenshots, and vice versa.
- **Theme**: Must use Airbus-specific amber color semantics and title styling.

## Navigation Display

- **Baselines**: Boeing MAP and Airbus ARC must have separate, stable visual baselines.
- **Symbology**: Route lines, waypoints, range rings, and mode labels must not overflow the display frame.
- **Geometry**: Heading arc and data blocks must follow aircraft-specific design patterns (Boeing vs. Airbus).

## Testing Workflow

1.  **Develop**: Make visual improvements in the component files.
2.  **Verify**: Run `npm run test:e2e` to check for regressions.
3.  **Approve**: If changes are intentional and improve fidelity, update snapshots with `npx playwright test --update-snapshots`.
