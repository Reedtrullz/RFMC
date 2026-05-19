# Visual Fidelity Targets

This document defines the measured visual standards for the RFMS instrument displays. No visual change is accepted unless it improves measured fidelity or preserves existing measured fidelity.

## Working Rule

Realistic instruments come first. Layouts must adapt around readable instrument sizes instead of shrinking every panel to make all instruments visible at once.

Use `reference-library/*/measurements.json` for measurement targets and `reference-library/*/notes.md` for source and implementation notes. Do not commit copyrighted source photos, manual pages, or proprietary fonts unless redistribution rights are clear.

## Boeing 737 CDU

- **Display Grid**: 24 columns x 14 rows.
- **LSK Alignment**: LSK buttons must align exactly to CDU display rows 2, 4, 6, 8, 10, and 12.
- **Page Layouts**: IDENT, POS INIT, RTE, LEGS, PERF INIT, and TAKEOFF REF must not overflow or cause layout shifts.
- **Screen Width**: Content should fill the usable display width (approx. 100% of the display bay interior).
- **Scratchpad**: Must remain exactly one row high.
- **Physical Targets**: Track shell aspect ratio, display bay position, bezel thickness, LSK spacing, keycap size, function-key row spacing, screw placement, and EXEC/MSG annunciator position.
- **Priority Pages**: IDENT, POS INIT, RTE 1/2, RTE 2/2, DEP/ARR, LEGS, PERF INIT, N1 LIMIT, TAKEOFF REF, PROG, FIX, and HOLD.

## Airbus A320 MCDU

- **Display Grid**: 24 columns x 14 rows.
- **Scratchpad**: Must remain exactly one row high.
- **Isolation**: Airbus visual changes must not affect Boeing screenshots, and vice versa.
- **Theme**: Must use Airbus-specific amber color semantics and title styling.
- **Physical Targets**: Airbus shell, screen bay, LSK, keypad, title bar, and scratchpad proportions must be measured separately from Boeing.
- **Priority Pages**: INIT A/B, F-PLN, DIR, PERF TO, and RAD NAV.

## Navigation Display

- **Baselines**: Boeing MAP and Airbus ARC must have separate, stable visual baselines.
- **Symbology**: Route lines, waypoints, range rings, and mode labels must not overflow the display frame.
- **Geometry**: Heading arc and data blocks must follow aircraft-specific design patterns (Boeing vs. Airbus).
- **Boeing Modes**: MAP, PLAN, VOR, APP, FIX overlay, HOLD overlay, and route discontinuity display.
- **Boeing Realism**:
  - **Digital Heading**: Centered numeric readout in a white-bordered box at the top of the compass.
  - **IRS Flags**: "MAP FAILURE" (Amber) or "IRS ALIGN" center flags when not in NAV mode.
  - **Nav Accuracy**: RNP/ANP readout in the bottom-right; ANP turns Amber when exceeding RNP.
- **Airbus Modes**: ARC, ROSE NAV, PLAN, constraints on/off, and approach display.
- **Airbus Realism**:
  - **Failure Modes**: "MAP NOT AVAIL" or "IRS ALIGN" (Red) flags when unaligned.
  - **Nav Accuracy**: "NAV ACCUR HIGH/LOW" status flags based on ANP/RNP monitoring.
  - **Path Colors**: Active (Green), Modified (Yellow), Secondary (White).

## PFD / FMA

- **FMA**: Boeing and Airbus FMA layouts must be separate and readable in Automation and Approach modes.
- **Primary Geometry**: Track speed tape, altitude tape, attitude sphere, bank scale, flight director, selected bugs, radio altitude, vertical speed, and heading cue positions.
- **Behavior**: MCP/FCU actions must produce visible FMA changes.

## MCP / FCU

- **Boeing MCP**: Track panel aspect ratio, section widths, seven-segment windows, knob positions, button sizes, screw placement, and annunciator lights.
- **Airbus FCU**: Track separate FCU geometry, push/pull knob affordance, selected vs. managed display state, AP1/AP2, A/THR, LOC, APPR, and EXPED.

## Layout Regression Targets

The cockpit layout tests in `e2e/visual-layouts.spec.ts` are the minimum guardrail. They must fail if a task mode makes instruments tiny, disappears an instrument, or overflows the viewport.

- **FMC Focus**: CDU width must stay above the desktop readable threshold.
- **Navigation**: ND and CDU must both remain usable.
- **Automation**: MCP, PFD, and ND must all remain visible and readable.
- **Full Deck**: Overview instruments must remain above minimum readable size; detailed CDU input belongs in focus/drawer behavior.

## Testing Workflow

1. **Develop**: Make visual improvements in the component files.
2. **Measure**: Compare against the relevant `reference-library/*/measurements.json` target.
3. **Verify**: Run `npm run typecheck:all`, `npm test -- --run`, `npm run build`, and targeted Playwright layout/visual tests.
4. **Approve**: If screenshot changes are intentional and improve fidelity, update Playwright snapshots with `npx playwright test --update-snapshots`.
