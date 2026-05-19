# Work Plan: Boeing 737 ND Bezel Control Integration

## 1. Executive Summary

This plan outlines the integration of fully interactive physical controls directly into the Boeing 737 Navigation Display (ND) bezel (`BoeingNDFrame.tsx`). By doing so, we will eliminate the need for the generic bottom `<NDControls />` panel on the page, resulting in an exceptionally realistic 3D cockpit flight deck representation.

## 2. Core Decisions & Rationale

- **9-Button Layout Configuration**: We will expand the bezel controls panel to house **9 square buttons** (instead of 7). This guarantees that every single EFIS overlay setting and display mode control gets its own dedicated physical button cap on the cockpit panel!
- **Positional Overlay Mapping**: The 9 buttons on the bezel will map left-to-right to:
  - Button 1: `WPT` (Waypoints overlay toggle)
  - Button 2: `ARPT` (Airports overlay toggle)
  - Button 3: `STA` (VOR/ADF Stations overlay toggle)
  - Button 4: `DATA` (Altitude Constraints/Data overlay toggle)
  - Button 5: `POS` (GPS Position overlay toggle)
  - Button 6: `TERR` (EGPWS Terrain Awareness overlay toggle)
  - Button 7: `WXR` (Weather Radar overlay toggle)
  - Button 8: `TFC` (TCAS Traffic Information overlay toggle)
  - Button 9: `CTR` (Center Expanded Mode toggle - maps to `toggleNDCenter`)
- **Visual Label Markings**: Print the actual names of the settings (`WPT`, `ARPT`, `STA`, `DATA`, `POS`, `TERR`, `WXR`, `TFC`, `CTR`) directly on the console bezel as high-contrast labels above each button. This makes the cockpit exceptionally intuitive and realistic.
- **Rotary Range Control**:
  - Left-click on knob: Decrements the ND range.
  - Right-click on knob: Increments the ND range.
  - Scroll wheel over knob: Increments/decrements the range.
  - _Rationale_: Mimics physical rotary behavior accurately on desktop systems while maintaining simple left/right tap zone support for iPad touch surfaces.
  - _Rotational Angles_: Map the 8 ranges (`5, 10, 20, 40, 80, 160, 320, 640` NM) to specific rotation steps on the knob (`-135deg` to `135deg`).
- **Airbus Compatibility**: Conditionally render the `<NDControls />` bottom panel only for Airbus displays, keeping the Boeing display 100% self-contained and clean.

## 3. Scope Boundaries

### In Scope

- Refactoring `src/components/ND/frame/BoeingNDFrame.tsx` to handle state-aware clicks, scroll wheel, touch zones, and context menu suppression.
- Conditionally mounting `<NDControls />` based on `model.style` inside `src/components/ND/NavigationDisplay.tsx`.
- Adding visual "Green LED Indicator" dots on the physical buttons to show when an overlay is active.
- Dynamic rotation of the Range knob visual marker.

### Out of Scope

- Modifying underlying autopilot LNAV/VNAV state models.
- Redesigning Airbus A320 MCDU/ND physical bezels.

## 4. Implementation Steps

The integration will be carried out across these specific steps:

### [x] Step 1: Update `BoeingNDFrame.tsx` to handle Interactivity and Zustand Integration

- [x] Connect `useFMCStore` inside the component.
- [x] Accept an optional `side` prop (defaulting to `'L'`).
- [x] Upgrade visual styling of the physical bezel console:
  - [x] **Satin Metallic Gradients**: Apply multi-stop linear gradients (`bg-gradient-to-b from-[#383b3e] via-[#222426] to-[#121315]`) and micro-highlights for authentic 3D console texturing.
  - [x] **Recessed Button Slots**: Give each button slot a dark inset shadow (`bg-[#0a0b0c] p-[4px] rounded-[6px] border border-[#3a3d40] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]`) to represent depth in the panel.
  - [x] **Square Buttons**: Style the push-buttons as realistic physical square caps with subtle edge highlights (`w-7 h-7 rounded-[3px] bg-[#1a1b1d] border border-[#303336] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),_0_2px_4px_rgba(0,0,0,0.8)] active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]`).
- [x] Map overlay array keys and center display triggers to the 9 physical buttons:
  - [x] Add green light indicator LEDs (`bg-[#00ff66] shadow-[0_0_6px_#00ff66]`) above or below the buttons when their respective state (e.g., `efis.overlays[key]` or `efis.centered` for CTR) is true.
  - [x] Wire up `onClick` on each physical button to trigger `state.toggleNDOverlay(sideKey, key)` (or `state.toggleNDCenter(sideKey)` for the 9th CTR button).
- [x] Configure the Range Knob:
  - [x] Select current range from `efis.range`.
  - [x] Add interactive wheel listener via React ref (with passive false and `e.preventDefault()`) to increment/decrement range steps using `setNDRange`.
  - [x] Add `onContextMenu={(e) => e.preventDefault()}` to suppress browser menu, and map left/right clicks (or touch regions) to increment/decrement.
  - [x] Apply `transform: rotate(...)` styles to rotate the inner marker of the knob based on the selected range level.

### [x] Step 2: Conditionally render `<NDControls />` inside `NavigationDisplay.tsx`

- [x] Modify `src/components/ND/NavigationDisplay.tsx`.
- [x] Only mount `<NDControls model={model} side={side} />` when `model.style === 'airbus'`.
- [x] Pass the dynamic `side` state value to `BoeingNDFrame` (`<BoeingNDFrame model={model} side={side}>`).

### [x] Step 3: Add support for Mode Cycling and display interactions

- [x] Support cycling the flight modes (APP, VOR, MAP, PLN) when double clicking the screen background.

## 5. Final Verification Wave

- [x] **E2E Automation Gate**: Run and update existing visual regressions to match the borderless full-screen Boeing ND layout.
- [x] **Type Checking**: Verify that `npm run typecheck:all` compiles successfully.
- [x] **Functional Check**: Verify the buttons toggle and knob turns correctly under all views.
