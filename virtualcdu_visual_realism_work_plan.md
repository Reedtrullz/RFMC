# VirtualCDU Visual Realism Work Plan

This adds an actionable realism layer to the visual audit. Each task is written so it can be turned directly into GitHub issues, implementation tickets, or checklist items.

## Working principle

Do not treat the CDU, MCDU, MCP, FCU, PFD, or ND as generic UI widgets. Treat each one as a separate aircraft instrument with its own physical shell, screen technology, typography, symbology, colour rules, alignment rules, lighting behaviour, and interaction model.

---

# 0. Reference and design system setup

## VR-001 — Build a verified visual reference board for each aircraft

**Goal:** Stop guessing. Create one source of truth for what each simulated instrument should look like.

**Implementation tasks:**

1. Create `/docs/references/737-ng/` and `/docs/references/a320neo/`.
2. Add subfolders:
   - `cdu-mcdu/`
   - `mcp-fcu/`
   - `pfd/`
   - `nd/`
   - `lighting/`
   - `mode-layouts/`
3. Save at least 10 reference images per instrument type.
4. For each reference image, create a matching `.md` note with:
   - aircraft type
   - instrument name
   - source name
   - visible state, for example `IDENT page`, `INIT page`, `MAP mode`, `FCU selected speed`
   - useful observations: font, colours, bezel shape, screw placement, button style, spacing, wear, labels
5. Create `/docs/visual-realism/reference-decisions.md` that records final decisions such as:
   - 737 CDU screen colour palette
   - A320 MCDU screen colour palette
   - exact button labels per aircraft
   - bezel material style
   - display scanline/noise strength
   - selected/unselected MCP/FCU button visual state

**Implementation idea:** Use a simple Notion board, Figma board, or local markdown gallery. Every future visual ticket must reference a specific board item.

**Acceptance criteria:**

- Each instrument has reference images.
- Each instrument has at least one annotated screenshot explaining what must change in the current app.
- Developers can answer “what should this look like?” without searching again.

---

## VR-002 — Create an aircraft-specific design token system

**Goal:** Make 737 and A320 visuals intentionally different instead of sharing one generic cockpit style.

**Implementation tasks:**

1. Create `src/styles/aircraftTokens.ts`.
2. Define separate token objects:
   - `boeing737Tokens`
   - `airbusA320Tokens`
3. Include tokens for:
   - shell material colour
   - bezel edge colour
   - screw colour
   - display background
   - display glow
   - display text colours
   - active annunciator colour
   - disabled text colour
   - selected button background
   - unselected button background
   - warning/amber colour
   - magenta flight-plan colour
   - cyan modifiable-data colour
   - green active-data colour
4. Replace hardcoded colours in CDU/MCDU, MCP/FCU, ND, PFD, checklist, top tabs, and settings panels with token references.
5. Add a unit test or Storybook check that verifies both aircraft token objects expose the same keys.

**Implementation idea:** Start by replacing only the top-level accent colours, then migrate individual instruments one by one.

**Acceptance criteria:**

- Switching aircraft changes the cockpit accent theme.
- A320 no longer uses Boeing-style cyan for every selected UI element unless intentionally defined.
- All major colours are controlled from one token file.

---

## VR-003 — Add a “visual fidelity checklist” to every cockpit component PR

**Goal:** Prevent realistic improvements from regressing during normal feature work.

**Implementation tasks:**

1. Add `.github/pull_request_template.md`.
2. Include a required visual checklist:
   - reference image linked
   - 737 and A320 checked separately if component is shared
   - day/dusk/night/dim checked
   - zoom at 100%, 125%, and 150% checked
   - text alignment checked
   - button hover/pressed/disabled states checked
   - screenshot attached
3. Add a `docs/visual-realism/pr-screenshot-guide.md` with exact screenshots expected for every PR.

**Implementation idea:** Require before/after screenshots from the same browser size so visual differences are obvious.

**Acceptance criteria:**

- Every visual PR includes screenshots.
- Reviewers can compare changes against reference material.
- Aircraft-specific styling regressions are caught before merge.

---

# 1. CDU and MCDU physical realism

## VR-010 — Rebuild the 737 CDU bezel as a realistic hardware shell

**Goal:** Make the Boeing CDU look like a physical flight deck component, not a flat web panel.

**Implementation tasks:**

1. Create a dedicated component: `B737CduShell.tsx`.
2. Split the CDU into layers:
   - outer mounting plate
   - recessed faceplate
   - screen well
   - left/right line-select-key columns
   - function-key rows
   - alphanumeric keypad
   - bottom status/brightness area
3. Add bevels using layered `box-shadow`, `border`, and inset highlights.
4. Add subtle material texture using CSS gradients or an SVG noise overlay.
5. Add four visible mounting screws with correct placement near the faceplate corners.
6. Add separate shadow direction for top-left light and bottom-right depth.
7. Add a thin inner shadow around the display to make the screen look recessed.
8. Add a `data-fidelity="medium" | "high"` prop so low-power devices can disable expensive texture effects.

**Implementation idea:** Use CSS pseudo-elements for screws and noise first. Only move to SVG/Canvas if CSS cannot achieve the needed realism.

**Acceptance criteria:**

- The CDU has clear physical depth.
- The display looks recessed inside the frame.
- Screws, bevels, and material texture remain visible in Day, Dusk, Night, and Dim modes.
- The shell still scales cleanly from 80% to 200% zoom.

---

## VR-011 — Rebuild the A320 MCDU shell separately from the 737 CDU

**Goal:** Stop reusing Boeing physical proportions for the Airbus unit.

**Implementation tasks:**

1. Create `A320McduShell.tsx` instead of styling the Boeing CDU conditionally.
2. Give the A320 shell its own:
   - taller faceplate proportions
   - amber title/header strip
   - Airbus-style line-select keys
   - wider rectangular alphanumeric keys
   - dedicated `DIR`, `PROG`, `PERF`, `INIT`, `DATA`, `F-PLN`, `RAD NAV` top key row
3. Move all Airbus-specific key layout data to `src/data/a320McduKeyLayout.ts`.
4. Move all Boeing-specific key layout data to `src/data/b737CduKeyLayout.ts`.
5. Add visual snapshot stories:
   - `A320 MCDU / INIT page`
   - `A320 MCDU / F-PLN page`
   - `B737 CDU / IDENT page`
   - `B737 CDU / POS INIT page`

**Implementation idea:** Treat the MCDU and CDU as sibling components that share only generic utilities: key rendering, screen glow, and key press animation.

**Acceptance criteria:**

- A320 and 737 units are visibly different at a glance.
- Key labels and layout match the selected aircraft.
- Switching aircraft never leaves a Boeing-specific key or label on the Airbus unit.

---

## VR-012 — Add realistic keycaps and press states

**Goal:** Make every key feel like a physical, backlit cockpit button.

**Implementation tasks:**

1. Create a reusable `CockpitKey` component.
2. Add props:
   - `label`
   - `subLabel`
   - `shape`
   - `size`
   - `aircraft`
   - `isPressed`
   - `isIlluminated`
   - `isDisabled`
3. Replace flat buttons with a 3-layer keycap:
   - base shadow
   - sloped cap face
   - top highlight
4. Add a pressed animation:
   - `transform: translateY(1.5px)`
   - reduce shadow size
   - increase inner shadow
5. Add a short keypress highlight lasting 120–180 ms.
6. Add per-key hover cursor and focus outline.
7. Add optional key click audio behind a user setting.
8. Add tests that verify Enter, CLR, EXEC, NEXT/PREV, and LSKs trigger the same visual press state when used by mouse or keyboard.

**Implementation idea:** Implement keycap realism once, then use layout data arrays to render all instrument key groups.

**Acceptance criteria:**

- Keys visually depress when clicked.
- Keys are readable in all lighting modes.
- Pressing a keyboard shortcut triggers the same visible key animation as clicking the cockpit key.

---

## VR-013 — Add key wear, edge polish, and label aging as optional high-fidelity effects

**Goal:** Avoid the “new plastic web button” look.

**Implementation tasks:**

1. Add a `wearLevel` prop to CDU/MCDU/MCP/FCU components:
   - `none`
   - `light`
   - `medium`
2. Use CSS variables to control:
   - subtle edge shine
   - small scratches
   - slightly uneven key label opacity
   - fingerprint smudges on high-use keys
3. Apply heavier wear to frequently used keys:
   - `EXEC`
   - `CLR`
   - number keys
   - LSKs
   - `DIR INTC` / `DIR`
   - `LEGS` / `F-PLN`
4. Keep wear disabled by default for maximum clarity.
5. Add a setting: `Visual fidelity -> cockpit wear`.

**Implementation idea:** Use a transparent PNG/SVG noise mask applied to keycap surfaces rather than manually drawing every scratch.

**Acceptance criteria:**

- Wear is subtle and never harms readability.
- The app can switch between clean training mode and worn cockpit mode.
- High-fidelity wear can be disabled for performance.

---

# 2. CDU/MCDU screen realism

## VR-020 — Implement a real FMC/MCDU text grid renderer

**Goal:** Stop positioning screen text like normal web text. CDU/MCDU pages should use a fixed character grid.

**Implementation tasks:**

1. Create `FmcScreenGrid.tsx`.
2. Represent each screen page as rows and columns, for example:
   - `rows: 14`
   - `cols: 24`
3. Render each character in a fixed grid cell.
4. Support per-character colour.
5. Support per-character size:
   - small label text
   - large data text
6. Support inverse/header bars.
7. Support scratchpad row as a dedicated bottom row.
8. Add page metadata:
   - title
   - page number
   - left prompts
   - right prompts
   - scratchpad content
9. Replace current manually spaced text with structured page definitions.

**Implementation idea:** Store pages as arrays of `FmcCell` objects or a compact DSL such as `{ row, col, text, color, size, align }`.

**Acceptance criteria:**

- Text aligns consistently across pages.
- Scratchpad always appears in the correct row.
- LSK prompts align with the physical line-select keys.
- Pages still look correct after browser zoom changes.

---

## VR-021 — Implement Airbus MCDU colour and font rules

**Goal:** Make Airbus pages follow recognizable Airbus-style text logic.

**Implementation tasks:**

1. Add `src/renderers/a320McduTextRules.ts`.
2. Define semantic colour roles:
   - `titleWhite`
   - `modifiableBlue`
   - `activeGreen`
   - `mandatoryAmber`
   - `constraintMagenta`
   - `advisoryWhite`
3. Add semantic font roles:
   - `titleLarge`
   - `dataLarge`
   - `labelSmall`
   - `computedSmall`
4. Update A320 pages so:
   - labels use small text
   - modifiable fields use blue/cyan
   - active values use green
   - mandatory empty boxes/prompts use amber
   - constraints use magenta
5. Add visual test pages for `INIT`, `F-PLN`, `PERF`, and `RAD NAV`.

**Implementation idea:** Do not hardcode `color: green` inside page components. Use semantic roles like `role="activeData"` so the same page structure can be validated.

**Acceptance criteria:**

- Each A320 page uses at least two text sizes where appropriate.
- Mandatory fields are visually distinct from completed fields.
- Modifiable fields are visually distinct from computed/active data.

---

## VR-022 — Implement Boeing CDU page text rules

**Goal:** Make the Boeing CDU pages read like a 737 FMC instead of a generic green terminal.

**Implementation tasks:**

1. Add `src/renderers/b737CduTextRules.ts`.
2. Define text roles:
   - `pageTitle`
   - `lineTitle`
   - `lineData`
   - `prompt`
   - `scratchpad`
   - `execRequired`
   - `message`
3. Make every 737 CDU page use the 6-left/6-right LSK structure.
4. Ensure the bottom scratchpad row can display typed entries and FMC messages.
5. Add visual states:
   - blank scratchpad
   - typed value
   - invalid entry message
   - EXEC pending state
6. Add a visible EXEC-key illumination when a modification is pending.

**Implementation idea:** Build a page definition schema first. Example: `B737PageDefinition` with `leftLines[6]`, `rightLines[6]`, `scratchpad`, and `pageIndex`.

**Acceptance criteria:**

- Every Boeing page aligns to the 6-row left/right LSK structure.
- Typed scratchpad entries appear in the same place on every page.
- EXEC illumination appears only when a change needs execution.

---

## VR-023 — Add screen glass, CRT/LCD glow, scanlines, and viewing-angle effects

**Goal:** Make the displays look like lit cockpit screens rather than flat coloured rectangles.

**Implementation tasks:**

1. Create `InstrumentScreenSurface.tsx` used by CDU/MCDU/ND/PFD.
2. Add layered screen effects:
   - dark glass base
   - subtle radial glow behind bright text
   - horizontal scanlines
   - low-opacity pixel/noise texture
   - faint reflection gradient
   - edge vignette
3. Add CSS variables to control intensity per lighting mode.
4. Add `reducedEffects` mode for low-end devices.
5. Ensure effects are disabled or reduced when `prefers-reduced-motion` is enabled.

**Implementation idea:** Use CSS background layers first: repeating-linear-gradient for scanlines, radial-gradient for glow, and a small inline SVG noise texture.

**Acceptance criteria:**

- Screen text appears emitted from the display, not painted on top.
- Effects are visible but do not reduce readability.
- Night mode increases glow while Day mode reduces it.

---

## VR-024 — Add CDU/MCDU screen boot and refresh behaviour

**Goal:** Add aircraft-like “alive” behaviour when instruments power on or change pages.

**Implementation tasks:**

1. Add a power-state model:
   - `off`
   - `booting`
   - `ready`
   - `failed`
2. Add a short boot animation:
   - screen black
   - dim glow appears
   - page text fades in line by line
3. Add a page-change refresh flicker of 50–100 ms.
4. Add a setting to disable flicker.
5. Add a failure/blank screen state for future training scenarios.

**Implementation idea:** Keep boot behaviour purely presentational at first. Later connect it to aircraft electrical state.

**Acceptance criteria:**

- The screen does not instantly teleport between states unless reduced effects are enabled.
- Page transitions feel mechanical but remain fast.
- The screen can be rendered off, booting, ready, and failed from Storybook.

---

# 3. MCP and FCU realism

## VR-030 — Rebuild the 737 MCP as a proper glareshield panel

**Goal:** Make the Boeing MCP look like a real horizontal flight guidance control panel.

**Implementation tasks:**

1. Create `B737McpPanel.tsx`.
2. Split into functional zones:
   - left course and flight director area
   - autothrottle arm area
   - speed/Mach area
   - LNAV/VNAV area
   - heading area
   - altitude area
   - vertical speed area
   - approach/VOR LOC/command areas
3. Add a dark glareshield base behind the panel.
4. Add recessed digital display windows for COURSE, SPEED, HEADING, ALTITUDE, and V/S.
5. Add orange/red seven-segment style numerals for selected values.
6. Add rotary knob bezels and ticks around knobs.
7. Add panel screws and section dividers.
8. Add proper active-state illumination for LNAV, VNAV, HDG SEL, ALT HOLD, V/S, APP, VOR LOC, CMD A/B, and CWS.

**Implementation idea:** Build display windows and knobs as reusable primitives, then compose the MCP from a config file.

**Acceptance criteria:**

- The MCP reads as a single physical panel, not scattered buttons.
- Selected modes are visually obvious.
- Digital windows look recessed and illuminated.
- Knobs are clearly distinguishable from pushbuttons.

---

## VR-031 — Rebuild the Airbus FCU with managed/selected visual behaviour

**Goal:** Make the A320 FCU visually reflect Airbus automation philosophy.

**Implementation tasks:**

1. Create `A320FcuPanel.tsx`.
2. Split into zones:
   - SPD/MACH
   - HDG/TRK
   - ALTITUDE
   - V/S-FPA
   - AP1/AP2
   - A/THR
   - LOC
   - APPR
3. Add FCU display windows that support:
   - selected numeric value
   - managed dashes
   - managed dot indicator
4. Add push/pull knob interaction states:
   - hover: show tooltip “Push = managed, Pull = selected”
   - click/drag: rotate value
   - secondary click or modifier click: push/pull mode toggle
5. Use green illumination for active AP/FD/A/THR states.
6. Add a small label explaining when the display is managed vs selected in training mode.

**Implementation idea:** Store each FCU knob as `{ value, mode: 'managed' | 'selected', displayText, hasManagedDot }`.

**Acceptance criteria:**

- Managed SPD/HDG display can show dashes and a dot.
- Selected SPD/HDG display can show numeric values.
- The user can visually understand the difference between managed and selected states.

---

## VR-032 — Add realistic rotary knob interactions

**Goal:** Make knobs feel like cockpit controls instead of static circles.

**Implementation tasks:**

1. Create `RotaryKnob.tsx`.
2. Support interactions:
   - mouse wheel changes value
   - click-and-drag rotates value
   - keyboard arrow keys adjust value when focused
   - shift key increases step size
3. Add visual rotation angle tied to the selected value.
4. Add small tick marks and pointer line on the knob.
5. Add pressed/pulled state for Airbus FCU knobs.
6. Add short tactile animation on value change.

**Implementation idea:** Use `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` so each knob is usable by keyboard and assistive technologies.

**Acceptance criteria:**

- Users can adjust knobs without clicking tiny plus/minus zones.
- Knob movement is visible.
- Keyboard and mouse interactions produce the same state changes.

---

## VR-033 — Add realistic annunciator lights

**Goal:** Replace generic active button colour with aircraft-style illuminated annunciators.

**Implementation tasks:**

1. Create `AnnunciatorLight.tsx`.
2. Support states:
   - off
   - armed
   - active
   - caution
   - failed
3. Add illumination effects:
   - inner glow
   - text glow
   - slightly blooming edge
4. Use different logic per aircraft:
   - Boeing MCP modes illuminate on selected/active pushbuttons.
   - Airbus FCU AP/A/THR/LOC/APPR illuminate using Airbus-style green indicators.
5. Connect actual mode state to the annunciator state.

**Implementation idea:** Keep active modes in a small state machine, then map them to display states. Avoid setting visual state manually in multiple components.

**Acceptance criteria:**

- Active modes have a clear illuminated state.
- Armed modes are visually different from active modes.
- Disabled/inoperative modes do not appear clickable or active.

---

# 4. PFD realism

## VR-040 — Rebuild the PFD as layered instrument symbology

**Goal:** Move from a simplified artificial horizon to a more convincing primary flight display.

**Implementation tasks:**

1. Create `PfdCanvas.tsx` or `PfdSvg.tsx`.
2. Render separate layers:
   - sky/ground attitude background
   - horizon line
   - pitch ladder
   - bank scale
   - roll pointer
   - aircraft reference symbol
   - speed tape
   - altitude tape
   - vertical speed indicator
   - flight mode annunciator row
   - selected speed/heading/altitude bugs
   - radio altitude area
   - localizer/glideslope indicators
3. Add aircraft-specific renderers:
   - `B737PfdRenderer`
   - `A320PfdRenderer`
4. Connect MCP/FCU selected values to PFD bugs.
5. Make the FMA row reflect automation state.

**Implementation idea:** Use SVG if the symbology is mostly vector shapes. Use Canvas only if performance becomes a problem.

**Acceptance criteria:**

- PFD has speed tape, altitude tape, attitude, selected value bugs, and FMA row.
- Boeing and Airbus PFDs do not use identical symbology.
- Selected MCP/FCU values visibly appear on the PFD.

---

## VR-041 — Add aircraft-specific PFD colour rules

**Goal:** Make the PFD colours meaningful, not decorative.

**Implementation tasks:**

1. Define `PfdColorRoles`:
   - `activeMode`
   - `armedMode`
   - `selectedBug`
   - `warning`
   - `caution`
   - `normalScale`
   - `referenceSymbol`
2. Map Boeing and Airbus colours separately.
3. Audit every PFD text/symbol element and replace raw colour values with semantic roles.
4. Add snapshot tests for:
   - takeoff configuration
   - climb
   - cruise
   - approach
   - warning/caution placeholder state

**Implementation idea:** Add a small debug overlay that shows each PFD colour role name when hovering in development mode.

**Acceptance criteria:**

- Colours have semantic meaning.
- The same state always uses the same role.
- Boeing and Airbus can diverge without duplicating all PFD code.

---

## VR-042 — Add realistic PFD motion smoothing

**Goal:** Avoid UI-jumpy movement when attitude, speed, heading, or altitude values change.

**Implementation tasks:**

1. Add an animation interpolation utility.
2. Smooth transitions for:
   - attitude pitch/roll
   - heading tape movement
   - altitude tape movement
   - speed tape movement
   - vertical speed needle
3. Clamp extreme values so symbology does not jump outside its frame.
4. Respect `prefers-reduced-motion` by reducing animation duration to near-zero.

**Implementation idea:** Use `requestAnimationFrame` with a small easing function and a maximum delta per frame.

**Acceptance criteria:**

- Instrument values move smoothly.
- No display element jumps outside the PFD frame.
- Reduced-motion users do not get unnecessary animation.

---

# 5. ND realism

## VR-050 — Rebuild the ND as a true navigation display layer stack

**Goal:** Make the ND look more like a real map/radar/navigation instrument.

**Implementation tasks:**

1. Create `NdDisplay.tsx` with layered rendering:
   - background glass/noise
   - range rings
   - compass arc or rose
   - heading bug
   - ownship symbol
   - active route line
   - waypoints
   - navaids
   - airport symbols
   - trend vector
   - wind vector
   - top-left data block
   - mode/range labels
2. Add mode support:
   - Boeing: APP, VOR, MAP, PLN style modes
   - Airbus: ROSE NAV, ARC, PLAN, ROSE ILS, ROSE VOR style modes
3. Make range buttons update ring spacing and labels.
4. Draw active leg in magenta and inactive route in a dimmer colour.
5. Add optional terrain/weather placeholder layers even if not functional yet.

**Implementation idea:** Use a single geometric coordinate system so changing range simply changes scale, not hand-coded positions.

**Acceptance criteria:**

- Range rings scale correctly when range changes.
- Heading/track markers align with the compass arc.
- Active route line and waypoints are visually distinct.
- Boeing and Airbus mode labels differ correctly.

---

## VR-051 — Add real route drawing from entered FMC/MCDU data

**Goal:** Make the ND respond visually to FMC/MCDU programming.

**Implementation tasks:**

1. Create a shared `FlightPlanModel`.
2. Store route legs as:
   - waypoint identifier
   - latitude/longitude or mock coordinates
   - leg type
   - altitude constraint
   - speed constraint
   - active/inactive status
3. When the user enters ORIGIN/DEST/route data, update the model.
4. Render the active route on the ND.
5. Add discontinuity rendering.
6. Add a temporary route preview before EXEC.
7. Make EXEC commit route changes and update the ND.

**Implementation idea:** Start with mock waypoint coordinates for demo airports, then add real navdata later.

**Acceptance criteria:**

- CDU/MCDU route edits create visible ND route changes.
- Unexecuted route changes look different from committed route changes.
- Route discontinuities are visible.

---

## VR-052 — Add ND symbol quality pass

**Goal:** Replace toy-like icons with cockpit-style symbols.

**Implementation tasks:**

1. Create SVG symbols for:
   - aircraft ownship
   - waypoint
   - airport
   - VOR
   - NDB
   - top-of-climb marker
   - top-of-descent marker
   - altitude constraint marker
   - active waypoint
2. Store them in `src/assets/instruments/ndSymbols/`.
3. Create `NdSymbol.tsx` that renders symbols by type and aircraft.
4. Add consistent stroke width and scaling rules.
5. Add symbol labels with correct offset and collision avoidance.

**Implementation idea:** Build symbols in Figma or directly in SVG. Keep them monochrome and colour them through CSS variables.

**Acceptance criteria:**

- Symbols are crisp at all zoom levels.
- Labels do not overlap the ownship symbol.
- Active symbols are visually stronger than inactive symbols.

---

# 6. Layout and mode realism

## VR-060 — Redesign each mode as a cockpit training layout, not just a visibility toggle

**Goal:** Make each mode feel intentionally composed for the training task.

**Implementation tasks:**

1. Create `modeLayoutDefinitions.ts`.
2. For each aircraft and mode, define:
   - visible panels
   - panel size
   - panel priority
   - panel position
   - whether checklist is open
   - whether instructor is open
   - default zoom level
3. Remove ad-hoc CSS positioning from individual mode components.
4. Add a layout preview dev page showing every mode side by side.
5. Add automated screenshot tests for every mode at 1440×900 and 1920×1080.

**Implementation idea:** Use CSS grid with named areas: `mcp`, `fcu`, `pfd`, `nd`, `cdu`, `checklist`, `settings`, `instructor`.

**Acceptance criteria:**

- Every mode has a documented layout definition.
- Full Deck actually shows all relevant cockpit instruments.
- No mode wastes more than 25% of available viewport width as empty black space unless intentionally reserved.

---

## VR-061 — Add instrument zoom and pop-out controls

**Goal:** Make small details readable while preserving overview layouts.

**Implementation tasks:**

1. Add a visible zoom button to each instrument frame.
2. Support zoom levels:
   - 100%
   - 125%
   - 150%
   - 200%
3. Add `Fit to width` and `Fit to height` options.
4. Add a pop-out modal view for CDU/MCDU, PFD, ND, MCP, and FCU.
5. Save the user’s last zoom preference in local storage.
6. Add keyboard shortcuts:
   - `+` zoom in selected instrument
   - `-` zoom out selected instrument
   - `Esc` close pop-out

**Implementation idea:** Implement the pop-out as an internal modal first. Browser-window pop-out can come later.

**Acceptance criteria:**

- CDU/MCDU text is readable without browser zoom.
- Users can enlarge one instrument without destroying the whole layout.
- Zoomed instruments still keep correct aspect ratio.

---

## VR-062 — Fix Full Deck mode behaviour

**Goal:** Make the mode match its name.

**Implementation tasks:**

1. When selecting Full Deck, automatically show:
   - CDU/MCDU
   - PFD
   - ND
   - MCP/FCU
   - checklist collapsed by default
   - settings collapsed by default
2. Add a compact toolbar to toggle optional panels.
3. Add a one-line hint: “Full Deck shows all major training instruments. Use panel buttons to hide instruments.”
4. Store custom user changes separately from the default Full Deck layout.
5. Add a reset button: `Reset Full Deck Layout`.

**Implementation idea:** Treat default Full Deck as a preset. User toggles should modify a temporary layout override, not the base mode definition.

**Acceptance criteria:**

- Full Deck never opens as an empty screen with only one instrument.
- Users can return to the default layout with one click.
- The mode behaves consistently for both 737 and A320.

---

# 7. Lighting, material, and atmosphere

## VR-070 — Replace global brightness with per-instrument lighting behaviour

**Goal:** Make lighting feel like cockpit backlighting rather than a page opacity slider.

**Implementation tasks:**

1. Add lighting variables per instrument:
   - screen brightness
   - key backlight brightness
   - panel label brightness
   - ambient shadow strength
   - glow bloom strength
2. Map Day, Dusk, Night, and Dim to different variable sets.
3. Make screen brightness independent from panel backlighting.
4. Add minimum readability constraints so text never becomes unreadable.
5. Add a settings control for:
   - screen brightness
   - panel backlight
   - ambient cockpit light

**Implementation idea:** Create a `LightingProvider` context that exposes current lighting values to every instrument.

**Acceptance criteria:**

- Night mode increases backlight/glow without simply darkening everything.
- Dim mode reduces glare while preserving readability.
- Day mode reduces screen bloom and increases panel surface visibility.

---

## VR-071 — Add cockpit material depth and shadow consistency

**Goal:** Make all instruments look like they exist in the same physical space.

**Implementation tasks:**

1. Define one virtual light direction for the cockpit UI.
2. Audit every shadow and highlight so they follow that direction.
3. Create reusable CSS classes:
   - `.panel-shell`
   - `.panel-recess`
   - `.panel-bevel`
   - `.panel-screw`
   - `.screen-glass`
   - `.keycap-raised`
   - `.keycap-pressed`
4. Replace one-off shadows with these classes.
5. Add a screenshot comparison page with all instruments under the same lighting.

**Implementation idea:** Use a simple top-left light model. Highlights go top/left, shadows go bottom/right.

**Acceptance criteria:**

- Buttons, panels, and screens have consistent shadow direction.
- Components no longer look pasted from different design systems.
- Material depth remains visible in all modes.

---

## VR-072 — Add realistic screen reflections without harming readability

**Goal:** Add glass realism while preserving training value.

**Implementation tasks:**

1. Add a very low-opacity reflection layer to each display.
2. Make reflection intensity configurable by lighting mode.
3. Add a user setting: `Screen reflections: off / subtle / realistic`.
4. Ensure reflection never crosses critical text at more than 8–10% opacity.
5. Disable reflections in high-contrast accessibility mode.

**Implementation idea:** Use a diagonal linear gradient and a soft oval radial gradient as pseudo-elements.

**Acceptance criteria:**

- Reflections are visible only as a subtle glass cue.
- Text remains readable at all times.
- Users can disable reflections.

---

# 8. Aircraft-specific checklists and overlays

## VR-080 — Replace generic checklist with aircraft-specific checklist components

**Goal:** Stop showing Boeing-specific checklist content in Airbus mode.

**Implementation tasks:**

1. Create checklist data files:
   - `src/data/checklists/b737Preflight.ts`
   - `src/data/checklists/a320Preflight.ts`
2. Add fields per checklist item:
   - `label`
   - `expectedState`
   - `linkedInstrument`
   - `linkedControlId`
   - `completionCondition`
   - `helpText`
3. Render checklist title using selected aircraft:
   - `B737 Normal Checklist`
   - `A320 Normal Checklist`
4. Replace Boeing-specific A320 checklist items with Airbus-specific FCU/MCDU items.
5. Add tests that assert A320 mode never renders `B738`, `MCP`, or Boeing-only labels.

**Implementation idea:** Build checklist rendering once, but load aircraft-specific data.

**Acceptance criteria:**

- A320 mode never displays Boeing labels.
- 737 mode never displays Airbus labels.
- Checklist items can link to cockpit controls.

---

## VR-081 — Add control highlighting from checklist items

**Goal:** Make checklist and cockpit visuals connected.

**Implementation tasks:**

1. Give every interactive cockpit control a stable `controlId`.
2. When hovering a checklist item, highlight its linked control.
3. When clicking a checklist item’s help icon, pan/zoom to the linked instrument.
4. Add a pulsing outline around the target control for 2 seconds.
5. Add `aria-describedby` so screen readers can connect checklist item and control.

**Implementation idea:** Use a global `HighlightedControlContext` that instruments subscribe to.

**Acceptance criteria:**

- Users can locate the relevant control from the checklist.
- Highlighting works across CDU/MCDU, MCP/FCU, PFD, and ND.
- Highlight state clears automatically.

---

# 9. Interaction realism and feedback

## VR-090 — Add a unified cockpit interaction sound system

**Goal:** Make button and knob interactions feel tactile.

**Implementation tasks:**

1. Create `CockpitSoundProvider.tsx`.
2. Add sound categories:
   - key click
   - rotary tick
   - guarded switch click
   - invalid entry beep
   - EXEC chime or subtle confirmation
3. Add volume setting.
4. Add mute setting.
5. Respect browser autoplay rules by enabling sounds only after first user interaction.
6. Keep sound files small and loop-free.

**Implementation idea:** Start with generated or licensed short click sounds. Store in `/public/sounds/cockpit/`.

**Acceptance criteria:**

- Every major button press has consistent audio feedback when enabled.
- Sound can be fully disabled.
- Invalid entries produce a distinct but non-annoying sound.

---

## VR-091 — Add realistic invalid-entry and message feedback

**Goal:** Make user mistakes feel like FMC/MCDU workflow, not normal web form validation.

**Implementation tasks:**

1. Add validation for common input fields:
   - airport ICAO format
   - runway format
   - speed/altitude format
   - cruise flight level format
   - cost index format
2. Invalid entries should write a message to the scratchpad instead of showing a browser alert.
3. Airbus messages should use amber/white importance states.
4. Boeing messages should use the Boeing CDU scratchpad/message style.
5. Add CLR behaviour:
   - first press clears last character or message
   - hold clears full scratchpad
6. Add test cases for invalid entries.

**Implementation idea:** Create a shared validation layer, then map validation result to aircraft-specific scratchpad display.

**Acceptance criteria:**

- Invalid input appears inside the CDU/MCDU screen.
- Message colour and behaviour differ correctly between aircraft.
- CLR removes messages and data consistently.

---

# 10. Quality assurance and visual regression

## VR-100 — Build Storybook stories for every instrument state

**Goal:** Make visual review fast and repeatable.

**Implementation tasks:**

1. Add Storybook if not already present.
2. Create stories for:
   - B737 CDU: IDENT, POS INIT, RTE, DEP/ARR, LEGS, PERF INIT
   - A320 MCDU: INIT, F-PLN, PERF, RAD NAV, DATA
   - B737 MCP: preflight, LNAV/VNAV armed, climb, approach
   - A320 FCU: managed climb, selected heading, approach armed
   - PFD: ground, takeoff, climb, approach
   - ND: MAP/ARC/PLAN modes and ranges
3. Add Day/Dusk/Night/Dim variants for each story.
4. Add high-contrast and reduced-effects variants.

**Implementation idea:** Use Storybook args to switch aircraft, mode, lighting, and state without duplicating stories manually.

**Acceptance criteria:**

- Designers and developers can inspect every instrument without loading the full app.
- Visual regressions are easier to spot.
- Lighting states are reviewed consistently.

---

## VR-101 — Add visual regression screenshots

**Goal:** Catch accidental visual breakage automatically.

**Implementation tasks:**

1. Add Playwright screenshot tests.
2. Capture screenshots for:
   - aircraft selection modal
   - 737 FMC Focus
   - 737 Navigation
   - 737 Automation
   - 737 Approach
   - 737 Full Deck
   - 737 Free Practice
   - A320 FMC Focus
   - A320 Navigation
   - A320 Automation
   - A320 Approach
   - A320 Full Deck
   - A320 Free Practice
3. Capture each at:
   - 1440×900
   - 1920×1080
4. Add screenshot diff thresholds.
5. Upload diffs as CI artifacts.

**Implementation idea:** Keep thresholds strict for layout and loose for subtle glow/noise effects.

**Acceptance criteria:**

- CI fails when layout shifts unexpectedly.
- Screenshots are available for every failed visual test.
- Aircraft-specific UI regressions are caught before deployment.

---

## VR-102 — Add a manual realism review checklist

**Goal:** Give the team a strict final-pass checklist before calling a component realistic.

**Implementation tasks:**

1. Create `/docs/visual-realism/manual-review-checklist.md`.
2. Include the following checks for each instrument:
   - correct aircraft labels
   - correct key layout
   - correct screen text grid
   - correct colour roles
   - correct button depth
   - correct knob behaviour
   - readable in all lighting modes
   - keyboard accessible
   - zoomable
   - no wasted layout space
   - screenshot matches reference within acceptable tolerance
3. Require reviewer initials and date for each completed section.

**Implementation idea:** Use this as a release checklist before deploying a “realism pass” milestone.

**Acceptance criteria:**

- Every major instrument has a signed-off realism review.
- Known visual compromises are documented instead of hidden.
- The checklist can be reused for future aircraft.

---

# Suggested implementation order

## Phase 1 — Foundation

1. VR-001 — Build visual reference board.
2. VR-002 — Aircraft-specific design tokens.
3. VR-060 — Mode layout definitions.
4. VR-061 — Instrument zoom and pop-out controls.
5. VR-062 — Fix Full Deck mode behaviour.

## Phase 2 — CDU/MCDU realism

1. VR-020 — Text grid renderer.
2. VR-010 — 737 CDU shell.
3. VR-011 — A320 MCDU shell.
4. VR-012 — Realistic keycaps.
5. VR-021 — Airbus text rules.
6. VR-022 — Boeing text rules.
7. VR-023 — Screen glass/glow/scanlines.

## Phase 3 — MCP/FCU realism

1. VR-030 — 737 MCP rebuild.
2. VR-031 — Airbus FCU rebuild.
3. VR-032 — Rotary knob interactions.
4. VR-033 — Annunciator lights.

## Phase 4 — Displays

1. VR-040 — PFD layered symbology.
2. VR-041 — PFD colour rules.
3. VR-050 — ND layer stack.
4. VR-051 — Route drawing from FMC/MCDU data.
5. VR-052 — ND symbol quality pass.

## Phase 5 — Polish and QA

1. VR-070 — Per-instrument lighting.
2. VR-071 — Material depth and shadows.
3. VR-080 — Aircraft-specific checklist.
4. VR-081 — Checklist control highlighting.
5. VR-090 — Interaction sounds.
6. VR-100 — Storybook states.
7. VR-101 — Visual regression tests.
8. VR-102 — Manual realism review checklist.

---

# Immediate next 10 GitHub issues to create

1. `Create aircraft-specific design token system for 737 and A320 visuals`
2. `Fix Full Deck mode so it displays CDU/MCDU, PFD, ND, and MCP/FCU by default`
3. `Create fixed-grid renderer for CDU/MCDU screen text`
4. `Separate Boeing CDU shell from Airbus MCDU shell`
5. `Implement realistic cockpit keycap component with pressed states`
6. `Rebuild 737 MCP as a physical glareshield panel`
7. `Rebuild A320 FCU with managed/selected dash and dot display states`
8. `Add per-instrument lighting variables for Day, Dusk, Night, and Dim`
9. `Replace generic checklist with aircraft-specific 737 and A320 checklist data`
10. `Add Playwright screenshot tests for all aircraft modes`
