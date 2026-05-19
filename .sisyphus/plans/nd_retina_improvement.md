# Work Plan: Boeing 737 Navigation Display (ND) Retina Refinement

This plan details the visual, typography, and layout refinements required to bring the simulation's Boeing 737 Navigation Display (ND) to the high-contrast Retina-level standard of AirTrack NG (https://haversine.com/web/airtrackng-nd1-375-retina.png).

---

## 1. Goal & Success Criteria

### Objectives

- **Eliminate Text Collisions**: Resolve overlapping layout bugs in the upper-left (GS, TAS, Wind, and Mode/Range) and upper-right (Active Waypoint) regions.
- **Retina Typography Refinement**: Implement uniform, crisp, monospaced-aligned typography for all digits and identifiers.
- **Double-Group Radio Alignment**: Format the bottom status blocks (VOR L / VOR R or VOR 1 / ADF 2) with precise grid alignments.
- **Responsive Visual Symmetry**: Ensure standard visual assets remain perfectly centered and scaled under different viewport aspect ratios.

### Success Criteria

- 0 pixel layout overlap on all ND text readouts under standard ranges (10 NM to 640 NM).
- Existing Playwright visual regression test suite runs and successfully captures/measures modified baselines.
- No regressions on Airbus A320 MCDU layout components or shared `@virtual-cdu/shared` state logic.

---

## 2. Scope

### IN

- SVG layout positioning, translate coordinates, text alignments, and typography adjustments in `src/components/ND/renderers/B737ND.tsx`.
- SVG text nodes and properties in `src/components/ND/symbology/WindVector.tsx` and `src/components/ND/symbology/ModeAnnunciations.tsx`.
- Refining EFIS control bar alignments and borders in `src/components/ND/NDControls.tsx` to match screenshot's high-contrast borders and alignments.

### OUT

- Implementation of new autoflight systems or navigation database elements in `@virtual-cdu/shared`.
- Textured outer metal bezel decorations (focus is strictly on inner SVG and control alignments).

---

## 3. Technical Approach & Architecture

### Layout Re-alignment

- Keep `<ModeAnnunciations>`'s primary Mode/Range indicator in the top-left at `(4, 6)`.
- Shift the Ground Speed (`GS`), True Air Speed (`TAS`), and Wind Vector block in `<WindVector>` downward by translating it to `(4, 15)` to avoid overlap.
- Enhance active waypoint styling: translate the active waypoint block at the top-right to align cleanly with the font sizes and standard boundaries, avoiding collision with the outer heading arc.
- Re-style the bottom VOR/ADF radio block elements using CSS class-based monospace font formatting for numeric fields.

---

## 4. Test & Verification Strategy

### E2E Visual Verification

- Run the existing visual regression suite to see visual changes in high-density and desktop presets:
  ```bash
  npm run test:e2e:visual
  ```
- Update the Playwright visual regression snapshots to establish the new Retina standard baselines:
  ```bash
  npm run test:visual:update
  ```

---

## 5. Implementation Tasks

### Wave 1: Layout Overlap Remediation & Typography Refinements

#### - [x] Task 1: Resolve Upper-Left Overlaps and Separate Mode & Wind Blocks

- **Files**:
  - `src/components/ND/renderers/B737ND.tsx`
  - `src/components/ND/symbology/WindVector.tsx`
  - `src/components/ND/symbology/ModeAnnunciations.tsx`
- **Details**:
  - Update `B737ND.tsx` to mount `<WindVector>` at a shifted coordinates layout, translating it to `(4, 15.5)` instead of `(4, 6)` or overlapping the mode block.
  - Revise `<ModeAnnunciations>` to keep EFIS Mode and Range clear at `(4, 6)`.
  - Apply standard monospace alignment classes (`font-avionics` or `font-mono`) to the speed readouts in `WindVector.tsx` so `GS` and `TAS` digits align perfectly.
- **QA Block**:
  - Open CockpitMode in browser.
  - Verify that the active mode readout (e.g. `MAP`) and current ground speed (e.g. `GS 429`) do not overlap or touch.
  - Check alignment under both centered and expanded modes.

#### - [x] Task 2: Precision Typography & Alignment for Active Waypoint (Top-Right)

- **Files**:
  - `src/components/ND/symbology/ModeAnnunciations.tsx`
- **Details**:
  - Update the active waypoint block at translate `(96, 6)` inside `ModeAnnunciations.tsx`.
  - Set custom font size (`3.2`), black/bold font weight (`font-black`), and appropriate letter-spacing (`tracking-wider`).
  - Optimize dynamic spacing so that the distance (`NM`) and ETA layout lines are perfectly readable and do not clash with the top edge of the heading arc.
- **QA Block**:
  - Program a standard route in the FMC with waypoints (e.g., `AMS`, `KLAX`).
  - Verify that the magenta active waypoint readout aligns beautifully in the top-right corner of the ND screen without clipping.

#### - [x] Task 3: Align Bottom Radio Blocks & Overlay Lists

- **Files**:
  - `src/components/ND/renderers/B737ND.tsx`
- **Details**:
  - Re-align the bottom VOR 1 / ADF 2 blocks.
  - Set coordinate transforms for VOR 1 to `(4, 82)` and ADF 2 to `(96, 82)`.
  - Use exact line heights (`3.2`) and spacing to match the high-contrast display layout of AirTrack NG.
  - Ensure inactive overlays in the left overlay list (`ARPT`, `WPT`, `STA`, `TERR`, `TFC`) have a consistent, muted high-contrast hex code (`#3a4d5c` or similar) to match the dark theme preset of the retina screenshot.
- **QA Block**:
  - Toggle each overlay state (WPT, ARPT) using the EFIS panel.
  - Verify active items turn bright cyan and inactive items turn to the muted dark-slate color.

### Wave 2: EFIS Controls & E2E Validation

#### - [x] Task 4: EFIS Controls Alignment & Border Styling

- **Files**:
  - `src/components/ND/NDControls.tsx`
- **Details**:
  - Refine the styling of the EFIS control buttons (STA, WPT, ARPT, DATA, POS, TERR, CTR, Range, etc.) underneath or surrounding the ND.
  - Apply high-contrast borders and sharp typography weights to match the precise AirTrack layout.
  - Align interactive boundaries to ensure touch targets are clean and visually aligned with the inner glass display edges.
- **QA Block**:
  - Verify that the layout borders on the control bar are sharp, high-contrast, and match the grid alignment of the ND container screen.

#### - [x] Task 5: Visual Regression Capture & Baseline Updates

- **Files**:
  - `e2e/visual/cockpit-highres.spec.ts`
  - Visual baseline images
- **Details**:
  - Execute the visual regression check commands to run tests across all viewport profiles (desktop-chromium, highres, retina).
  - Update the Playwright committed baselines to establish the clean, overlap-free ND layout as the new project gold standard.
- **QA Block**:
  - Ensure all e2e visual tests pass locally and no layout anomalies or regression flags are generated.

---

## 6. Final Verification Wave

1. **Local Dev Review**: Start the Vite dev server (`npm run dev`) and visually inspect the ND in `CockpitMode` under both Boeing and Airbus variations.
2. **Visual Regression Check**: Run the Playwright test suite to confirm the layout is crisp and all snapshots are cleanly generated.
3. **Explicit User Sign-off**: Verify each readout is pixel-perfect and obtain explicit user "okay" before marking the epic as complete.
