# VirtualCDU Master Work Plan

## Visual Realism + Audit Fixes

This is the combined implementation plan for improving **https://fmc.reidar.tech/**. It merges the visual realism work plan with the strict visual/setup audit findings into one actionable backlog.

The goal is not just to make the app “look nicer.” The goal is to make every mode, display, panel, checklist, and interaction feel like a credible aircraft training interface instead of a generic dark UI with aircraft-themed graphics.

---

## Reference anchors

Use these as implementation references when defining visual rules, screen layout, and interaction semantics.

- **Airbus A320 MCDU layout:** the MCDU uses a structured 14-line, 24-character display model with a title line and scratchpad. Reference: FlyByWire A32NX MCDU Interface.
- **Airbus FCU behaviour:** managed vs selected mode must be visually different. Managed mode shows dashes and a dot in the corresponding FCU window; selected mode shows the selected value. Reference: FlyByWire A32NX FCU documentation.
- **737 CDU conventions:** line select keys, mandatory input boxes, optional dashes, prompts, and page-colour conventions need to be treated as rules, not decorative text. Reference: Boeing 737 Flight Management / Navigation controls and indicators material.
- **Data-entry pattern:** values are typed into the scratchpad first, then inserted into a field with the adjacent line select key. Reference: Airbus MCDU programming guidance and Boeing/FMC conventions.

---

## Priority map

| Priority | Meaning                                                                          | Apply to                                                                                  |
| -------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **P0**   | Current behaviour is misleading, confusing, or blocks training value. Fix first. | Wrong aircraft labels, Full Deck mismatch, unreadable controls, missing mode setup rules. |
| **P1**   | Major realism and usability improvement.                                         | CDU/MCDU grid renderer, MCP/FCU rebuild, PFD/ND layering, checklist integration.          |
| **P2**   | Polish, atmosphere, and fidelity.                                                | Glass effects, wear, reflections, sound, animation.                                       |
| **P3**   | Advanced quality/lifecycle work.                                                 | Storybook states, visual regression, mobile-specific layouts, reference review process.   |

---

# Phase 0 — Reference, design system, and project structure

## VCM-001 — Build a verified aircraft reference library

**Priority:** P0  
**Problem:** The app currently mixes generic UI styling with aircraft-like elements. Realism will stay inconsistent unless every component is grounded in references.

**Implementation tasks:**

1. Create these folders:
   - `/docs/references/737-ng/cdu/`
   - `/docs/references/737-ng/mcp/`
   - `/docs/references/737-ng/pfd/`
   - `/docs/references/737-ng/nd/`
   - `/docs/references/a320neo/mcdu/`
   - `/docs/references/a320neo/fcu/`
   - `/docs/references/a320neo/pfd/`
   - `/docs/references/a320neo/nd/`
   - `/docs/references/mode-layouts/`
   - `/docs/references/lighting/`
2. Save at least 10 reference images per instrument type.
3. Add a `notes.md` file in each folder with:
   - source URL or screenshot origin
   - aircraft type
   - instrument variant
   - what the reference proves
   - open questions
4. Add a `/docs/references/reference-index.md` that maps each cockpit component to its reference images.
5. Add a rule: no visual redesign PR can be merged unless it links to at least one reference image or reference note.

**Acceptance criteria:**

- Every major instrument has a reference folder.
- Every visual component has at least one linked reference.
- New visual work can be reviewed against explicit reference material instead of taste.

---

## VCM-002 — Create aircraft-specific design tokens

**Priority:** P0  
**Problem:** Boeing and Airbus currently share too much visual language. The A320 mode still uses cyan chrome in several UI areas, while Airbus instrument symbology should feel distinct from the Boeing setup.

**Implementation tasks:**

1. Create `/src/styles/aircraftTokens.ts`.
2. Define separate token objects:
   - `boeing737Tokens`
   - `airbusA320Tokens`
   - `sharedCockpitTokens`
3. Include:
   - instrument background colour
   - bezel material colours
   - keycap gradients
   - selected-state colour
   - inactive-state colour
   - screen phosphor/glow colour
   - warning/caution/advisory colours
   - panel screw colour
   - screen glass opacity
   - shadow depth scale
4. Replace hard-coded cyan/green/orange values in components with aircraft tokens.
5. Add a visible debug panel in development that shows the active aircraft token set.

**Acceptance criteria:**

- Switching from 737 to A320 changes UI accents consistently.
- A320 no longer uses Boeing-like cyan UI accents unless intentionally shared.
- Tokens can be adjusted without editing component internals.

---

## VCM-003 — Add a visual fidelity checklist to pull requests

**Priority:** P1  
**Problem:** Realism improvements can regress over time because there is no review checklist.

**Implementation tasks:**

1. Create `.github/pull_request_template.md`.
2. Add a required “Visual Fidelity” checklist:
   - references attached
   - aircraft-specific terminology checked
   - display grid alignment checked
   - day/dusk/night/dim states checked
   - high-contrast state checked
   - keyboard focus checked
   - screenshot comparison attached
3. Add a “Before / After” screenshot requirement for every visual PR.
4. Add a “Known deviations from real aircraft” section.

**Acceptance criteria:**

- Every visual PR includes a realism review.
- Deviations are documented instead of accidental.
- Screenshots become part of the review workflow.

---

# Phase 1 — Mode setup, layout, and discoverability fixes

## VCM-010 — Redesign each mode as an explicit training layout

**Priority:** P0  
**Problem:** Modes currently feel like visibility toggles. They do not clearly communicate the training goal of each setup.

**Implementation tasks:**

1. Create `/src/config/trainingModes.ts`.
2. Define every mode as data:
   ```ts
   type TrainingModeConfig = {
     id: 'fmc-focus' | 'navigation' | 'automation' | 'approach' | 'full-deck' | 'free-practice';
     label: string;
     purpose: string;
     aircraft: 'b737' | 'a320' | 'both';
     visiblePanels: PanelId[];
     primaryPanel: PanelId;
     layoutPreset: LayoutPresetId;
     defaultZoom: Record<PanelId, number>;
     defaultOverlays: OverlayId[];
     beginnerHint: string;
   };
   ```
3. Replace mode-specific conditional rendering with this configuration.
4. Add a one-line mode description under the selected tab or in a hover card.
5. Add a small “Why this layout?” info button beside the active mode name.

**Acceptance criteria:**

- Every mode has a defined purpose and panel list.
- Switching modes no longer creates unexplained blank space.
- Users can understand why the mode exists without prior knowledge.

---

## VCM-011 — Fix Full Deck mode so it actually shows the full deck

**Priority:** P0  
**Problem:** The audit found that Full Deck initially shows too little and requires hidden manual panel toggles. The mode name is currently misleading.

**Implementation tasks:**

1. In `trainingModes.ts`, set Full Deck defaults to show:
   - CDU/MCDU
   - MCP/FCU
   - PFD
   - ND
   - checklist
   - cockpit settings collapsed
   - connection status
2. Add a Full Deck layout grid:
   - top: MCP/FCU full width
   - middle-left: PFD
   - middle-center: ND
   - middle-right: CDU/MCDU
   - optional right drawer: instructor/checklist/settings
3. Add a “Reset Full Deck Layout” button.
4. Store user custom panel visibility separately from the default Full Deck preset.
5. Do not let an earlier hidden-panel state make Full Deck appear empty.

**Acceptance criteria:**

- Clicking Full Deck immediately displays all primary cockpit tools.
- The user never has to guess that “Panels” must be toggled.
- Full Deck is visually denser and more useful than Free Practice.

---

## VCM-012 — Add mode-specific empty-state protection

**Priority:** P0  
**Problem:** A user can toggle panels off and end up with huge black areas or a mode that looks broken.

**Implementation tasks:**

1. Add `validateVisiblePanels(mode, visiblePanels)`.
2. For each mode, define `minimumRequiredPanels`.
3. If the user hides the last required panel, show a confirmation:
   - “This will leave Navigation mode without an ND. Continue?”
4. If a mode has no visible primary panel, show a recovery card:
   - “Navigation mode needs the ND. Restore recommended layout.”
5. Add a one-click “Restore recommended layout” action.

**Acceptance criteria:**

- No mode can silently become visually empty.
- Users can recover from bad custom panel states in one click.
- Empty space is always explained.

---

## VCM-013 — Add instrument zoom and pop-out controls

**Priority:** P0  
**Problem:** The CDU/MCDU, MCP/FCU labels, and display text are too small even in focus modes.

**Implementation tasks:**

1. Add a shared `InstrumentFrame` wrapper.
2. Add controls to every frame:
   - zoom out
   - zoom in
   - reset zoom
   - pop out
   - full-screen focus
3. Store zoom per aircraft and panel:
   ```ts
   instrumentZoom: {
     b737: { cdu: 1.4, mcp: 1.2, pfd: 1.0, nd: 1.0 },
     a320: { mcdu: 1.4, fcu: 1.2, pfd: 1.0, nd: 1.0 }
   }
   ```
4. Add keyboard shortcuts:
   - `+` zoom active panel in
   - `-` zoom active panel out
   - `0` reset active panel
   - `F` focus active panel
5. Make FMC Focus default to at least `1.5x` CDU/MCDU scale on desktop.

**Acceptance criteria:**

- CDU/MCDU text is readable without browser zoom.
- Every instrument can be enlarged independently.
- Focus mode feels like an actual close-up trainer view.

---

## VCM-014 — Reclaim unused black space with responsive layout rules

**Priority:** P0  
**Problem:** Several modes waste most of the viewport. The app feels sparse and less professional.

**Implementation tasks:**

1. Build a `CockpitLayoutGrid` component.
2. Define breakpoints:
   - desktop wide
   - desktop standard
   - tablet landscape
   - tablet portrait
   - mobile
3. Use CSS grid areas instead of absolute positioning.
4. Set each mode’s layout preset:
   - `singleInstrumentFocus`
   - `twoPanelTraining`
   - `threePanelTraining`
   - `fullDeck`
   - `mobileSwipeDeck`
5. Add `min()`, `max()`, and `clamp()` sizing for instrument frames.
6. Prevent instruments from shrinking below their readable minimum size.
7. Add scroll or swipe only when necessary.

**Acceptance criteria:**

- On desktop, black space frames the cockpit but does not dominate it.
- Instruments scale predictably with viewport size.
- Small screens show usable panel-by-panel navigation instead of a crushed cockpit.

---

## VCM-015 — Add mode descriptions, tooltips, and first-run guidance

**Priority:** P1  
**Problem:** Hidden features and modes are not discoverable. Novices do not know what “Automation” or “Approach” mode is meant to teach.

**Implementation tasks:**

1. Add a `ModeHelpCard` component.
2. For each mode, write:
   - one-sentence purpose
   - visible instruments
   - recommended practice task
   - “what to look at”
3. Add tooltips to:
   - mode tabs
   - panel toggles
   - Day/Dusk/Night/Dim buttons
   - brightness slider
   - connection status
   - instructor/checklist/settings buttons
4. Add a first-run overlay:
   - choose aircraft
   - choose curriculum/free practice
   - explain mode tabs
   - explain panel toggles
5. Add “Do not show again” stored in local storage.

**Acceptance criteria:**

- A new user can understand the UI without external explanation.
- Every icon/button has a tooltip.
- Mode switching teaches the user what changed.

---

# Phase 2 — Aircraft-specific checklist and overlay fixes

## VCM-020 — Replace the generic checklist with aircraft-specific checklists

**Priority:** P0  
**Problem:** The audit found that the A320 still shows a Boeing/B738 checklist label and Boeing-specific MCP terminology. This is a credibility issue.

**Implementation tasks:**

1. Create:
   - `/src/checklists/b737Preflight.ts`
   - `/src/checklists/a320Preflight.ts`
   - `/src/checklists/types.ts`
2. Define checklist item model:
   ```ts
   type ChecklistItem = {
     id: string;
     aircraft: 'b737' | 'a320';
     phase: 'preflight' | 'taxi' | 'takeoff' | 'climb' | 'cruise' | 'descent' | 'approach' | 'landing';
     label: string;
     expectedStateText: string;
     relatedPanelIds: PanelId[];
     relatedControlIds: string[];
     helpText: string;
     autoCheck?: () => boolean;
   };
   ```
3. Use “B737” only for 737 checklists.
4. Use “A320” or “A320neo” for Airbus checklists.
5. Replace Boeing-only items in A320 mode:
   - “MCP” → “FCU”
   - “HDG” → “HDG/TRK” where relevant
   - “V2, HDG, ALT set” → Airbus-specific FCU/FMS wording
6. Add phase tabs inside the checklist.

**Acceptance criteria:**

- A320 mode never shows a B738 checklist tag.
- Checklist terminology matches the selected aircraft.
- Each checklist item has a help description and related controls.

---

## VCM-021 — Make checklist items highlight the correct cockpit controls

**Priority:** P1  
**Problem:** The checklist is currently passive. It tells the user what to check but does not teach them how to complete the action.

**Implementation tasks:**

1. Add `relatedControlIds` to every checklist item.
2. Create `ControlHighlightOverlay`.
3. When a checklist item is clicked:
   - highlight related control(s)
   - dim unrelated panels slightly
   - show a short instruction bubble
4. Add a “Show me” button beside each incomplete item.
5. Add a `highlightControl(controlId)` function to the cockpit store.
6. Add a pulse animation that stops after 3 seconds or when the user interacts with the highlighted control.

**Acceptance criteria:**

- Clicking a checklist item visually points to the correct instrument/control.
- New users can complete checklist items without guessing.
- Highlighting works in both 737 and A320 modes.

---

## VCM-022 — Collapse overlays by default when they cover primary instruments

**Priority:** P1  
**Problem:** The checklist and cockpit settings panels cover cockpit instruments and reduce usable space.

**Implementation tasks:**

1. Add overlay placement rules:
   - never cover active CDU/MCDU in FMC Focus
   - never cover ND in Navigation
   - never cover PFD/ND in Approach
2. Add draggable overlay behaviour.
3. Add minimized overlay chips:
   - Checklist
   - Settings
   - Instructor
4. Save overlay positions per mode.
5. Add “Reset overlay positions.”

**Acceptance criteria:**

- Overlays do not hide the main training instrument by default.
- Users can move or collapse every overlay.
- Layouts remain usable at 1024px width.

---

# Phase 3 — CDU/MCDU physical realism

## VCM-030 — Rebuild the 737 CDU bezel as a realistic hardware shell

**Priority:** P1  
**Problem:** The current CDU is recognizable but still looks like a flat UI panel. It needs hardware depth.

**Implementation tasks:**

1. Split the component:
   - `B737CduShell`
   - `B737CduScreen`
   - `B737CduKeypad`
   - `B737CduLineSelectKeys`
2. Add layered shell pieces:
   - outer casing
   - recessed screen cavity
   - raised LSK rails
   - keypad bed
   - screw heads
   - subtle surface noise
3. Use CSS gradients for bevels:
   - top-left highlight
   - bottom-right shadow
   - inner screen shadow
4. Add screw components with slight rotational variation.
5. Add left and right LSK columns as physical buttons, not generic rectangles.
6. Add darker recessed gaps between key rows.

**Acceptance criteria:**

- The CDU has clear physical depth.
- Screen, LSK rails, and keypad feel like separate materials.
- The 737 CDU shell is not reused for the Airbus MCDU.

---

## VCM-031 — Rebuild the A320 MCDU shell separately from the 737 CDU

**Priority:** P1  
**Problem:** Airbus and Boeing CDUs currently feel too similar. The A320 MCDU must have its own shape, spacing, key grouping, colour behaviour, and typography.

**Implementation tasks:**

1. Create:
   - `A320McduShell`
   - `A320McduScreen`
   - `A320McduKeypad`
   - `A320McduLineSelectKeys`
2. Match A320-style:
   - amber title/header area where appropriate
   - six LSKs per side
   - Airbus page-key grouping
   - larger alphabetic keys
   - Airbus-specific DIR/PROG/PERF/INIT/DATA/F-PLN/RAD NAV keys
3. Do not reuse Boeing CDU keypad sizing.
4. Add A320-specific panel label engraving.
5. Add aircraft token-based MCDU accent colours.

**Acceptance criteria:**

- A320 MCDU is visually distinct from 737 CDU at a glance.
- Button layout matches Airbus-style groupings.
- The implementation has no shared “generic CDU layout” assumptions except low-level button primitives.

---

## VCM-032 — Add realistic keycaps, press states, and tactile feedback

**Priority:** P1  
**Problem:** Keys currently look clickable but not physically convincing.

**Implementation tasks:**

1. Create a shared `CockpitKeycap` primitive with props:
   - `label`
   - `size`
   - `variant`
   - `pressed`
   - `disabled`
   - `illuminated`
   - `aircraft`
2. Add visual states:
   - idle raised bevel
   - hover slight highlight
   - active/pressed 1–2px depression
   - disabled low-contrast state
   - stuck/held state for testing
3. Add shadow changes on press.
4. Add optional click sound hook.
5. Add keyboard focus ring that looks like a modern accessibility layer, not aircraft lighting.
6. Add tests for press state.

**Acceptance criteria:**

- Pressing any key visibly depresses it.
- Keys have believable bevels and shadows.
- Focus states remain accessible without ruining cockpit realism.

---

## VCM-033 — Add optional wear, edge polish, and label aging

**Priority:** P2  
**Problem:** Real cockpit tools rarely look like perfect flat black UI components. Subtle wear improves realism.

**Implementation tasks:**

1. Add `wearLevel` setting:
   - `clean`
   - `normal`
   - `used`
2. Apply wear via CSS overlays:
   - keycap edge polish
   - light scratches on bezels
   - dust in recessed corners
   - minor label fading
3. Use deterministic pseudo-random patterns seeded by control ID.
4. Keep wear subtle and never reduce readability.
5. Add a “Clean training mode” toggle that disables all wear.

**Acceptance criteria:**

- Instruments look less sterile.
- Wear is consistent between reloads.
- Readability is preserved.

---

# Phase 4 — CDU/MCDU screen realism and data entry

## VCM-040 — Implement a real text-grid renderer for CDU/MCDU screens

**Priority:** P0  
**Problem:** The CDU/MCDU text must obey fixed-grid aviation display rules. Generic HTML text positioning will keep producing inaccurate pages.

**Implementation tasks:**

1. Create `FmsTextGrid`.
2. Support:
   - fixed rows
   - fixed columns
   - per-character colour
   - per-character style
   - inverse video
   - small/large text variants
   - line-select mapping
   - scratchpad row
3. For A320, support 14 lines and 24 characters.
4. For 737, define a matching page grid based on chosen reference.
5. Create a page model:
   ```ts
   type FmsPage = {
     title: GridTextRun[];
     rows: GridRow[];
     scratchpad: GridTextRun[];
     lskBindings: Record<'1L' | '2L' | '3L' | '4L' | '5L' | '6L' | '1R' | '2R' | '3R' | '4R' | '5R' | '6R', ActionId>;
   };
   ```
6. Replace hand-positioned page text with renderer output.
7. Add unit tests for row/column placement.

**Acceptance criteria:**

- Every page aligns to a fixed grid.
- LSK prompts line up exactly with their physical buttons.
- Scratchpad text always appears in the correct row.

---

## VCM-041 — Implement Airbus MCDU page semantics

**Priority:** P1  
**Problem:** Airbus pages need correct text layout, colour, prompts, scratchpad behaviour, and input states.

**Implementation tasks:**

1. Create `/src/fms/a320/pages/`.
2. Implement page models for:
   - INIT
   - F-PLN
   - PERF
   - DATA
   - RAD NAV
   - PROG
   - DIR
3. Add data-entry states:
   - blank field
   - optional field
   - mandatory field
   - invalid entry
   - modified but not inserted
   - inserted value
4. Enforce scratchpad-first input:
   - keypad types into scratchpad
   - LSK inserts scratchpad into mapped field
   - CLR clears scratchpad or selected value
5. Add error messages:
   - `FORMAT ERROR`
   - `NOT ALLOWED`
   - `ENTRY OUT OF RANGE`
6. Add Airbus-specific page title/header styling.

**Acceptance criteria:**

- A320 MCDU pages look structured and aircraft-specific.
- Input goes through scratchpad before insertion.
- Invalid entries produce realistic message feedback instead of silent failure.

---

## VCM-042 — Implement Boeing CDU page semantics

**Priority:** P1  
**Problem:** The Boeing CDU needs prompts, boxes, dashes, page titles, LSK notation, and colour behaviour that communicate mandatory/optional/actionable fields.

**Implementation tasks:**

1. Create `/src/fms/b737/pages/`.
2. Implement page models for:
   - IDENT
   - POS INIT
   - RTE
   - DEP/ARR
   - LEGS
   - PERF INIT
   - N1 LIMIT
   - TAKEOFF REF
   - PROG
3. Add field visual semantics:
   - boxes for mandatory input
   - dashes for optional input
   - `<` and `>` prompts
   - page counters
   - line-select prompts
4. Map each LSK to a page action.
5. Add support for route activation states:
   - inactive route
   - modified route
   - EXEC required
   - active route
6. Add EXEC light state when pending modifications exist.

**Acceptance criteria:**

- Boeing pages do not feel like Airbus pages with green text.
- Mandatory/optional fields are visually distinct.
- EXEC state is visible and tied to page changes.

---

## VCM-043 — Add realistic screen glass, glow, scanlines, and viewing-angle effects

**Priority:** P2  
**Problem:** Current screens are too flat and digitally perfect.

**Implementation tasks:**

1. Add a `ScreenGlassOverlay` component.
2. Include:
   - subtle inner glow
   - fine horizontal scanlines
   - faint phosphor bleed
   - very light dust/noise
   - glass reflection gradient
   - reduced contrast at off-axis angle
3. Tie effect strength to display brightness.
4. Ensure effects are disabled or reduced in high-contrast mode.
5. Add a setting:
   - `screenEffects: off | subtle | realistic`

**Acceptance criteria:**

- Screens feel like displays embedded behind glass.
- Effects never reduce training readability.
- Users can disable realism effects.

---

## VCM-044 — Add boot, refresh, and page-transition behaviour

**Priority:** P2  
**Problem:** Real displays do not instantly behave like static web cards.

**Implementation tasks:**

1. Add a short boot sequence per instrument:
   - blank screen
   - backlight fade
   - page appears
2. Add a tiny refresh/flicker transition on page change.
3. Add input latency of 30–80ms for CDU/MCDU keypresses.
4. Add a “reduced motion” setting that disables all animation.
5. Respect OS/browser `prefers-reduced-motion`.

**Acceptance criteria:**

- Page transitions feel more physical.
- Motion can be disabled.
- There is no annoying or excessive animation.

---

# Phase 5 — MCP and FCU realism

## VCM-050 — Rebuild the 737 MCP as a proper glareshield panel

**Priority:** P1  
**Problem:** The current 737 MCP is recognisable but too flat, small, and low-contrast.

**Implementation tasks:**

1. Split MCP into:
   - `B737McpPanel`
   - `B737McpDisplayWindow`
   - `B737McpButton`
   - `B737McpKnob`
   - `B737Annunciator`
2. Increase label size using responsive scaling.
3. Add correct panel sections:
   - A/T ARM
   - COURSE
   - N1
   - SPEED
   - LNAV
   - VNAV
   - HDG SEL
   - ALTITUDE
   - V/S
   - APP
   - VOR LOC
   - CMD A/B
   - CWS A/B
4. Add seven-segment display style for numeric windows.
5. Add realistic button press and annunciation states.
6. Add knobs with:
   - tick marks
   - drag/scroll interaction
   - coarse/fine adjustment
   - press state where relevant

**Acceptance criteria:**

- MCP labels are readable at default desktop scale.
- Buttons and knobs look physically separate from the panel.
- MCP annunciators clearly show armed/active states.

---

## VCM-051 — Rebuild the Airbus FCU with managed/selected mode states

**Priority:** P0  
**Problem:** The A320 FCU must show the difference between selected and managed modes. Without this, the Airbus automation trainer is visually and conceptually incomplete.

**Implementation tasks:**

1. Split FCU into:
   - `A320FcuPanel`
   - `A320FcuDisplayWindow`
   - `A320FcuKnob`
   - `A320FcuButton`
   - `A320FcuAnnunciator`
2. Add state for each FCU axis:
   - speed selected
   - speed managed
   - heading/trk selected
   - heading/trk managed
   - altitude selected
   - vertical speed/FPA selected
   - vertical speed/FPA idle
3. Display managed values as dashes/dots where applicable.
4. Display selected values as numeric windows.
5. Add push/pull interaction:
   - push = managed
   - pull = selected
6. Add visible tooltips:
   - “Push for managed mode”
   - “Pull for selected mode”
7. Add keyboard alternatives:
   - `Shift + wheel` for push/pull toggle
   - click center for push
   - click edge or modifier for pull

**Acceptance criteria:**

- A320 FCU visually distinguishes managed and selected modes.
- The user can learn Airbus automation logic from the UI.
- FCU display windows no longer behave like generic numeric inputs.

---

## VCM-052 — Add realistic rotary knob interactions

**Priority:** P1  
**Problem:** Knobs are central to MCP/FCU use, but they currently lack convincing rotation and input behaviour.

**Implementation tasks:**

1. Create a shared `RotaryKnob` primitive.
2. Support:
   - scroll wheel increments
   - drag rotation
   - keyboard arrows
   - fine/coarse mode
   - push/pull state
   - hover instruction
3. Add visual rotation indicator.
4. Add tactile sound hook for detents.
5. Add acceleration after repeated wheel movement.
6. Add bounds and wrap rules per control:
   - heading wraps 000–359
   - speed has min/max
   - altitude increments configurable
   - V/S increments configurable

**Acceptance criteria:**

- Knobs feel like cockpit controls, not sliders.
- Users can operate controls with mouse, keyboard, or touch.
- Values stay within realistic bounds.

---

## VCM-053 — Add annunciator-light realism

**Priority:** P1  
**Problem:** Active/armed modes need cockpit-style annunciation, not generic active buttons.

**Implementation tasks:**

1. Create `AnnunciatorLight`.
2. Support:
   - off
   - armed
   - active
   - failed
   - test
3. Add glow radius tied to cockpit brightness.
4. Add day/night contrast adjustments.
5. Add annunciator states to:
   - 737 LNAV/VNAV/APP/VOR LOC/CMD
   - A320 AP1/AP2/A/THR/LOC/APPR
6. Add a light-test mode in developer settings.

**Acceptance criteria:**

- Active/armed automation states are instantly readable.
- Lights feel embedded in the panel.
- Day/night modes preserve readability.

---

# Phase 6 — PFD realism

## VCM-060 — Rebuild the PFD as layered instrument symbology

**Priority:** P1  
**Problem:** The PFD currently looks simplified and flat. It needs layered aviation symbology.

**Implementation tasks:**

1. Create `PfdCanvas` or SVG-based renderer.
2. Separate layers:
   - background sky/ground
   - pitch ladder
   - horizon line
   - aircraft reference symbol
   - speed tape
   - altitude tape
   - vertical speed
   - FMA/mode annunciations
   - heading/track strip
   - flight director
   - warning/caution overlays
3. Build separate render configs:
   - `b737PfdConfig`
   - `a320PfdConfig`
4. Smooth pitch/roll changes with interpolation.
5. Add test states:
   - level flight
   - climb
   - descent
   - bank left/right
   - approach
   - abnormal attitude

**Acceptance criteria:**

- PFD elements are layered and independently testable.
- Boeing and Airbus PFDs do not share inaccurate layouts.
- Motion is smooth but can be disabled.

---

## VCM-061 — Add aircraft-specific PFD colour and typography rules

**Priority:** P1  
**Problem:** The PFD should use colours semantically, not decoratively.

**Implementation tasks:**

1. Create `displayColorSemantics.ts`.
2. Define semantic roles:
   - active lateral mode
   - active vertical mode
   - armed mode
   - managed target
   - selected target
   - caution
   - warning
   - advisory
3. Map those roles differently for 737 and A320 if needed.
4. Replace hard-coded PFD colours with semantic roles.
5. Add a high-contrast override.

**Acceptance criteria:**

- PFD colours communicate meaning.
- Colour changes are consistent across PFD, ND, CDU/MCDU, MCP/FCU.
- High-contrast mode remains readable.

---

## VCM-062 — Improve PFD readability and scaling

**Priority:** P0  
**Problem:** Some PFD labels and numbers are too small at default scale.

**Implementation tasks:**

1. Define minimum readable font sizes for PFD elements.
2. Use `clamp()` for all display text.
3. Increase PFD frame size in Automation and Approach modes.
4. Add `pfdZoom` setting to user preferences.
5. Add high-DPI rendering for canvas/SVG to avoid blurry text.

**Acceptance criteria:**

- PFD readouts are readable on 1080p desktop without browser zoom.
- Canvas/SVG text remains sharp on retina displays.
- PFD is never scaled below its minimum readable size.

---

# Phase 7 — ND realism

## VCM-070 — Rebuild the ND as a true navigation display layer stack

**Priority:** P1  
**Problem:** The ND currently has visual potential but needs more realistic layer structure and aircraft-specific symbology.

**Implementation tasks:**

1. Create `NavigationDisplay`.
2. Add layers:
   - background texture
   - range rings
   - compass rose/arc
   - aircraft symbol
   - heading/track line
   - active route
   - modified route
   - waypoints
   - navaids
   - constraints
   - weather overlay placeholder
   - TCAS overlay placeholder
   - mode/range labels
3. Add separate configs:
   - `b737NdConfig`
   - `a320NdConfig`
4. Make the visible ND mode buttons drive actual renderer state:
   - MAP
   - PLN
   - VOR
   - APP/ROSE NAV/ARC depending aircraft
5. Add range control states.

**Acceptance criteria:**

- ND is composed from named layers.
- Mode buttons actually change the ND view.
- Boeing and Airbus ND symbology are visually different.

---

## VCM-071 — Draw route data from entered FMC/MCDU data

**Priority:** P1  
**Problem:** The ND should respond to the FMS, not show static placeholder graphics.

**Implementation tasks:**

1. Create a shared `FlightPlanStore`.
2. Store:
   - origin
   - destination
   - route legs
   - active waypoint
   - modified route
   - constraints
3. When user inserts route data in CDU/MCDU, update `FlightPlanStore`.
4. Render route on ND.
5. Show modified route differently from active route.
6. Add EXEC/temporary insert logic:
   - pending changes visible as modified route
   - committed changes visible as active route

**Acceptance criteria:**

- Entering a route changes the ND.
- Modified route state is visually distinct.
- CDU/MCDU and ND are meaningfully interconnected.

---

## VCM-072 — Add ND symbol quality pass

**Priority:** P2  
**Problem:** The ND symbols need cleaner alignment, scale, and consistent line weights.

**Implementation tasks:**

1. Create an SVG symbol library:
   - aircraft symbol
   - waypoint
   - active waypoint
   - airport
   - VOR
   - NDB
   - top-of-descent marker
   - constraint marker
2. Define line weights per zoom/range.
3. Add anti-aliasing and pixel alignment checks.
4. Add visual regression states for every ND mode and range.
5. Add a `showSymbolBounds` developer debug toggle.

**Acceptance criteria:**

- Symbols are crisp at every range.
- Line weights feel intentional and consistent.
- No labels overlap in default scenarios.

---

# Phase 8 — Lighting, materials, and cockpit atmosphere

## VCM-080 — Replace global brightness with per-instrument lighting behaviour

**Priority:** P1  
**Problem:** One global brightness slider makes the app feel like a webpage dimmer, not a cockpit.

**Implementation tasks:**

1. Keep the existing global intensity slider as a master multiplier.
2. Add per-instrument brightness:
   - CDU/MCDU screen
   - CDU/MCDU keypad backlight
   - MCP/FCU panel lighting
   - PFD brightness
   - ND brightness
   - overlay brightness
3. Add lighting presets:
   - day
   - dusk
   - night
   - dim
4. Tie material shadows and glow to lighting preset.
5. Add cockpit settings drawer with sliders for advanced users.
6. Save lighting settings per aircraft.

**Acceptance criteria:**

- Day/dusk/night/dim affect instruments differently.
- Screen brightness and panel lighting are separate concepts.
- Night mode looks like a cockpit, not just a darker webpage.

---

## VCM-081 — Add consistent material depth and panel shadows

**Priority:** P2  
**Problem:** Some panels look flat while others have depth, creating an inconsistent cockpit.

**Implementation tasks:**

1. Define a shared shadow scale:
   - shallow inset
   - raised button
   - recessed screen
   - floating overlay
   - modal
2. Apply it to:
   - CDU/MCDU shell
   - MCP/FCU
   - PFD/ND frames
   - overlays
   - top navigation bar
3. Add material tokens:
   - matte black plastic
   - dark grey metal
   - rubber keycap
   - glass display
   - illuminated segment display
4. Replace ad-hoc shadows with tokens.

**Acceptance criteria:**

- Every instrument appears to belong in the same cockpit environment.
- Depth is consistent across panels.
- Floating UI overlays are visually distinct from cockpit hardware.

---

## VCM-082 — Add realistic screen reflections without harming readability

**Priority:** P2  
**Problem:** Displays need glass realism, but reflections can quickly damage usability.

**Implementation tasks:**

1. Add reflection overlays per display type.
2. Make reflections intensity-dependent.
3. Add position variation between instruments.
4. Disable or reduce reflections in:
   - high contrast mode
   - screen effects off
   - small screen mode
5. Add QA test screenshots for light/dark presets.

**Acceptance criteria:**

- Screens feel glass-covered.
- Text remains readable.
- Reflection behaviour respects accessibility settings.

---

# Phase 9 — Colour, contrast, and accessibility

## VCM-090 — Add high-contrast mode

**Priority:** P0  
**Problem:** The audit found low-contrast labels and hard-to-read markings, especially on MCP/FCU and ND details.

**Implementation tasks:**

1. Add `highContrast: boolean` to user settings.
2. Create high-contrast token overrides.
3. Increase contrast for:
   - MCP/FCU labels
   - panel tabs
   - inactive buttons
   - ND range labels
   - PFD numbers
   - overlay text
4. Add visible high-contrast toggle in settings.
5. Respect browser `prefers-contrast` if available.

**Acceptance criteria:**

- Low-contrast grey-on-grey labels are eliminated in high-contrast mode.
- Default mode is improved without looking cartoonish.
- High-contrast mode does not break aircraft-specific colour meaning.

---

## VCM-091 — Stop using colour alone to show state

**Priority:** P1  
**Problem:** Active states rely heavily on cyan/green, which is weak for colour-blind users and also makes aircraft identity inconsistent.

**Implementation tasks:**

1. Add non-colour indicators for selected states:
   - underline
   - filled dot
   - raised active border
   - label suffix
   - icon
2. Update:
   - mode tabs
   - panel toggles
   - ND mode buttons
   - checklist items
   - lighting preset buttons
3. Add colour-blind friendly token set.
4. Add automated contrast checks with `axe-core` or similar.

**Acceptance criteria:**

- Active state can be understood without relying on colour.
- Colour-blind mode is available.
- Accessibility checks pass for core navigation.

---

## VCM-092 — Add keyboard navigation and shortcuts

**Priority:** P1  
**Problem:** The app currently depends too much on mouse input.

**Implementation tasks:**

1. Add tab order for:
   - aircraft selector
   - mode tabs
   - panel toggles
   - active cockpit controls
   - overlays
2. Add shortcuts:
   - `1–6` switch modes
   - `C` toggle CDU/MCDU
   - `N` toggle ND
   - `P` toggle PFD
   - `M` toggle MCP/FCU
   - `?` open shortcut help
3. Add active panel focus.
4. Add keyboard operation for:
   - CDU/MCDU keys
   - line select keys
   - knobs
   - mode tabs
5. Add a shortcut help overlay.

**Acceptance criteria:**

- The main app can be operated without a mouse.
- Focus is always visible.
- Shortcuts do not interfere with CDU/MCDU text entry.

---

## VCM-093 — Add ARIA labels and screen-reader metadata

**Priority:** P2  
**Problem:** Canvas-like cockpit UI is difficult for assistive technology unless explicit semantic metadata is provided.

**Implementation tasks:**

1. Add accessible names to every cockpit control.
2. Add `aria-pressed` for toggle buttons.
3. Add `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` for knobs and sliders.
4. Add live regions for:
   - scratchpad messages
   - invalid entries
   - mode changes
   - checklist completion
5. Add text summaries for PFD/ND values:
   - heading
   - speed
   - altitude
   - vertical speed
   - active mode
6. Test with browser accessibility tree.

**Acceptance criteria:**

- Controls are identifiable to screen readers.
- Important cockpit state changes are announced.
- Accessibility metadata is maintained alongside visual state.

---

# Phase 10 — Interaction feedback and training quality

## VCM-100 — Add realistic invalid-entry and message feedback

**Priority:** P1  
**Problem:** A training tool must teach users when entries are wrong and why.

**Implementation tasks:**

1. Create `FmsMessageBus`.
2. Define message types:
   - invalid format
   - value out of range
   - required field missing
   - route discontinuity
   - execute required
   - not allowed
3. Render messages in the scratchpad/message line.
4. Add timeout/clear behaviour.
5. Add tests for invalid entries.

**Acceptance criteria:**

- Invalid entries are visible on the CDU/MCDU.
- Error messages are tied to specific rules.
- Users can learn from failed inputs.

---

## VCM-101 — Add a cockpit interaction sound system

**Priority:** P2  
**Problem:** Silent buttons feel less physical. Subtle sounds can improve realism when optional.

**Implementation tasks:**

1. Create `cockpitSounds.ts`.
2. Add sound categories:
   - CDU key click
   - LSK click
   - MCP/FCU button click
   - knob detent
   - annunciator test
   - invalid entry beep
3. Add volume slider and mute setting.
4. Respect browser autoplay restrictions.
5. Add “reduced sensory mode” that disables sounds.

**Acceptance criteria:**

- Sounds are subtle and optional.
- No sound plays before user interaction.
- Sound improves tactile feel without becoming annoying.

---

## VCM-102 — Add guided training hints per task

**Priority:** P1  
**Problem:** The UI shows instruments, but it does not yet teach workflows deeply enough.

**Implementation tasks:**

1. Create `TrainingStepOverlay`.
2. Add hints for curriculum lessons:
   - what to press
   - what should change
   - what screen confirms success
   - common mistakes
3. Tie hints to component IDs and FMS state.
4. Add “show hint” and “hide hints” controls.
5. Add “strict mode” that does not reveal the next action unless requested.

**Acceptance criteria:**

- Curriculum tasks can guide the user through actual cockpit interactions.
- Hints are contextual, not generic text.
- Users can disable hints for free practice.

---

# Phase 11 — Loading, connection, and app-state clarity

## VCM-110 — Add loading states between aircraft/mode transitions

**Priority:** P1  
**Problem:** The app can briefly appear blank or stalled during transitions.

**Implementation tasks:**

1. Add `CockpitLoadingOverlay`.
2. Show it when:
   - aircraft changes
   - initial cockpit loads
   - heavy display assets load
   - saved layout restores
3. Include:
   - aircraft name
   - target mode
   - loading step text
   - progress indicator if available
4. Keep transition under 500ms if possible.
5. Use skeleton instrument frames if loading takes longer.

**Acceptance criteria:**

- Users always know the app is responding.
- No unexplained black screen appears.
- Loading UI matches cockpit style.

---

## VCM-111 — Make connection status more informative

**Priority:** P2  
**Problem:** “Disconnected” is visible but not actionable enough.

**Implementation tasks:**

1. Replace static status chip with a clickable connection panel.
2. Show:
   - selected aircraft
   - sim bridge status
   - last heartbeat
   - connection target
   - reconnect button
   - troubleshooting link
3. Use aircraft-specific label:
   - `PMDG 737-800`
   - `FBW A320`
4. Add warning only when a feature requires connection.

**Acceptance criteria:**

- Users understand what “Disconnected” means.
- Offline/free-practice behaviour is clearly allowed.
- Connection issues are actionable.

---

# Phase 12 — Responsive and mobile/tablet support

## VCM-120 — Create tablet and mobile cockpit layouts

**Priority:** P2  
**Problem:** The current interface is desktop-first and may become unusable on smaller screens.

**Implementation tasks:**

1. Add `mobileSwipeDeck` layout preset.
2. On tablet/mobile, show one primary instrument at a time.
3. Add bottom navigation:
   - CDU/MCDU
   - PFD
   - ND
   - MCP/FCU
   - Checklist
4. Add swipe gestures between instruments.
5. Keep important controls at minimum 44px touch target size.
6. Add orientation warning for very small portrait screens:
   - “Rotate for full cockpit layout.”

**Acceptance criteria:**

- Tablet users can operate every panel.
- Mobile users can at least train CDU/MCDU workflows.
- No instrument becomes unreadably tiny.

---

## VCM-121 — Add touch-friendly knob and key interactions

**Priority:** P2  
**Problem:** Drag and tiny click targets are unreliable on touch screens.

**Implementation tasks:**

1. Add touch mode detection.
2. For knobs, open a touch adjustment popover:
   - plus/minus
   - fine/coarse toggle
   - push/pull for A320 FCU
3. For CDU/MCDU, increase hitboxes without changing visual size.
4. Add long-press help on controls.
5. Add vibration feedback where supported and enabled.

**Acceptance criteria:**

- Touch users can adjust values accurately.
- Push/pull FCU interaction is usable on tablets.
- Hitboxes pass touch-target guidelines.

---

# Phase 13 — QA, Storybook, and regression tests

## VCM-130 — Build Storybook stories for every major instrument state

**Priority:** P1  
**Problem:** Visual components are hard to review systematically without isolated states.

**Implementation tasks:**

1. Add Storybook if not already installed.
2. Create stories for:
   - 737 CDU shell
   - A320 MCDU shell
   - 737 MCP
   - A320 FCU
   - PFD 737/A320
   - ND 737/A320
   - checklist overlay
   - cockpit settings
3. Include stories for:
   - day/dusk/night/dim
   - high contrast
   - screen effects off/subtle/realistic
   - empty/error states
   - active/armed/inactive automation states
4. Add side-by-side Boeing/Airbus comparison stories.

**Acceptance criteria:**

- Every component can be reviewed without running a full lesson.
- Designers/developers can compare aircraft variants quickly.
- Storybook becomes the visual source of truth.

---

## VCM-131 — Add Playwright visual regression tests

**Priority:** P1  
**Problem:** Visual realism improvements can break silently.

**Implementation tasks:**

1. Add Playwright screenshot tests for:
   - selection screen
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
2. Test at:
   - 1920×1080
   - 1366×768
   - 1024×768
   - mobile width
3. Add separate tests for:
   - day
   - night
   - high contrast
   - screen effects off
4. Store baseline screenshots.
5. Require review when diff exceeds threshold.

**Acceptance criteria:**

- Every mode has baseline screenshots.
- Visual regressions are caught in CI.
- The Full Deck empty/misleading issue cannot reappear unnoticed.

---

## VCM-132 — Add accessibility testing to CI

**Priority:** P2  
**Problem:** Accessibility fixes will regress unless automated.

**Implementation tasks:**

1. Add `axe-core` integration to Playwright.
2. Test:
   - selection screen
   - all mode tabs
   - checklist overlay
   - settings drawer
   - active CDU/MCDU
3. Fail CI on:
   - missing accessible names
   - insufficient contrast in high-contrast mode
   - broken keyboard tab order
4. Generate accessibility report artifact.

**Acceptance criteria:**

- Accessibility regressions are caught automatically.
- High-contrast mode is validated.
- Keyboard navigation remains functional.

---

## VCM-133 — Add manual realism review checklist

**Priority:** P3  
**Problem:** Automated tests cannot decide whether a cockpit “feels real.”

**Implementation tasks:**

1. Create `/docs/qa/manual-realism-review.md`.
2. Include review prompts:
   - Does this look like the correct aircraft?
   - Are display colours semantic?
   - Are labels readable?
   - Do controls feel physical?
   - Does the selected mode show the expected instruments?
   - Does day/night lighting feel believable?
   - Does the checklist match the aircraft?
3. Add a scoring system:
   - 0 = absent/wrong
   - 1 = rough placeholder
   - 2 = acceptable
   - 3 = realistic
   - 4 = excellent
4. Require review before tagging a release.

**Acceptance criteria:**

- Releases include a manual realism score.
- Subjective issues are captured consistently.
- The app improves toward measurable realism.

---

# Integrated implementation sequence

## Sprint 1 — Stop misleading the user

1. **VCM-010:** mode configs
2. **VCM-011:** Full Deck actually shows full deck
3. **VCM-020:** aircraft-specific checklists
4. **VCM-013:** instrument zoom/pop-out
5. **VCM-090:** high-contrast mode foundations

**Sprint outcome:** The app becomes clearer, less misleading, and easier to read.

---

## Sprint 2 — Make the main tools credible

1. **VCM-040:** CDU/MCDU text-grid renderer
2. **VCM-041:** Airbus MCDU semantics
3. **VCM-042:** Boeing CDU semantics
4. **VCM-050:** 737 MCP rebuild
5. **VCM-051:** A320 FCU managed/selected states

**Sprint outcome:** The core flight-management and automation tools start behaving like aircraft instruments.

---

## Sprint 3 — Connect instruments together

1. **VCM-071:** route data from FMS to ND
2. **VCM-100:** FMS message feedback
3. **VCM-021:** checklist control highlighting
4. **VCM-102:** guided training hints
5. **VCM-053:** annunciator-light states

**Sprint outcome:** The app becomes a real trainer rather than a static visual mockup.

---

## Sprint 4 — Improve displays and cockpit feel

1. **VCM-060:** layered PFD
2. **VCM-070:** layered ND
3. **VCM-080:** per-instrument lighting
4. **VCM-081:** material depth
5. **VCM-043:** screen glass/glow/scanlines

**Sprint outcome:** The cockpit becomes visually coherent and much more realistic.

---

## Sprint 5 — Accessibility, responsive support, and regression protection

1. **VCM-092:** keyboard shortcuts
2. **VCM-093:** ARIA labels/summaries
3. **VCM-120:** tablet/mobile layouts
4. **VCM-130:** Storybook states
5. **VCM-131:** Playwright visual regression
6. **VCM-132:** accessibility tests

**Sprint outcome:** The app becomes maintainable, testable, and usable beyond a single desktop setup.

---

# First 25 GitHub issues to create

1. **Create aircraft-specific training mode configuration file**
2. **Fix Full Deck mode to show all primary panels by default**
3. **Replace generic checklist with B737 and A320 checklist data**
4. **Remove B738 label from A320 checklist overlay**
5. **Add zoom and full-screen focus controls to every instrument**
6. **Create aircraft-specific visual token system**
7. **Add high-contrast display mode**
8. **Add tooltips and mode help cards**
9. **Build fixed-grid CDU/MCDU text renderer**
10. **Implement A320 MCDU 14-line/24-character page model**
11. **Implement Boeing CDU page model with boxes/dashes/prompts**
12. **Rebuild 737 CDU shell as separate physical component**
13. **Rebuild A320 MCDU shell as separate physical component**
14. **Add realistic keycap primitive with pressed/focus states**
15. **Rebuild 737 MCP with readable labels and seven-segment displays**
16. **Rebuild A320 FCU with managed/selected push-pull behaviour**
17. **Add rotary knob primitive for MCP/FCU controls**
18. **Add annunciator light component and automation states**
19. **Build layered PFD renderer**
20. **Build layered ND renderer**
21. **Connect CDU/MCDU route entries to ND route rendering**
22. **Add checklist control highlighting**
23. **Add per-instrument lighting controls**
24. **Add Storybook stories for all instruments and states**
25. **Add Playwright visual regression tests for every mode**

---

# Definition of done for the combined work plan

A task is not complete when it merely “looks better.” It is complete only when all of the following are true:

1. It matches the selected aircraft’s terminology and layout.
2. It is readable at 1080p without browser zoom.
3. It works in Day, Dusk, Night, Dim, and High Contrast modes.
4. It has keyboard-accessible interaction where relevant.
5. It has at least one Storybook state.
6. It has at least one visual regression screenshot.
7. It does not rely on colour alone to communicate state.
8. It has documented references or explicit known deviations.
9. It does not create hidden or unexplained empty space in any mode.
10. It improves training value, not only visual decoration.

---

# Strict product direction

The final target should be:

- **FMC Focus:** a close-up, readable CDU/MCDU trainer.
- **Navigation:** a clear CDU/MCDU + ND workflow where entered route data affects the display.
- **Automation:** a readable MCP/FCU trainer with correct active/armed/managed/selected states.
- **Approach:** PFD/ND-first mode with automation controls still accessible.
- **Full Deck:** everything important visible by default.
- **Free Practice:** clean instrument practice without intrusive overlays.

Anything that does not support those goals should be treated as secondary polish.
