# VirtualCDU Comprehensive Test & Improvement Plan

> **Partially superseded:** Critical bug and early implementation sections are historical. Remaining useful test/quality ideas have been migrated into `TEST_MATRIX.md`, `METRICS.md`, `KNOWN_LIMITATIONS.md`, and `ROADMAP.md`.

## Document Information

- **Created:** 2026-05-10
- **Purpose:** Consolidated findings from comprehensive codebase analysis, build testing, functional verification, and real hardware comparison
- **Status:** Active - Implementation Required

---

## Executive Summary

This document consolidates findings from a comprehensive test of the VirtualCDU application. The app is functionally solid with good architecture but has **critical bugs**, **visual inaccuracies**, and **missing functionality** that must be addressed.

### Overall Score: 6.5/10

| Category                 | Score | Notes                         |
| ------------------------ | ----- | ----------------------------- |
| Code Architecture        | 8/10  | Well-structured monorepo      |
| Build System             | 6/10  | Builds but TypeScript fails   |
| Visual Accuracy (Boeing) | 5/10  | Wrong colors, missing keys    |
| Visual Accuracy (Airbus) | 6/10  | Better color but wrong labels |
| Functional Completeness  | 6/10  | Core works, many placeholders |
| Tutorial System          | 8/10  | Good scenarios                |
| MSFS Integration         | 3/10  | Stub only                     |
| Mobile/PWA               | 8/10  | Good touch support            |

---

## 1. Critical Bugs (Fix Immediately)

### Bug 1: Airbus MCDU MENU Page Crash

- **File:** `shared/src/fmc/pages/airbus/index.ts:396`
- **Issue:** The `lines` property is wrapped in an extra array `[[...]]` instead of `[...]`
- **Impact:** Runtime crash when rendering Airbus MCDU MENU page
- **Current Code:**
  ```typescript
  lines: [
    [
      inv('  MCDU MENU'),
      // ... more lines
    ],
  ];
  ```
- **Fix:** Remove extra array wrapper
  ```typescript
  lines: [
    inv('  MCDU MENU'),
    // ... more lines
  ];
  ```
- **Priority:** CRITICAL

### Bug 2: Server FMC Engine Missing Required Fields

- **File:** `server/src/fmc-engine.ts:17`
- **Issue:** `createDefaultState()` missing required `FMCState` fields:
  - `aircraft` (required by `FMCState` interface)
  - `tutorialActive`, `tutorialScenario`, `tutorialStepIndex`, `tutorialCompleted`, `tutorialHighlight`
- **Impact:** Server-side FMC engine won't compile; backend-authoritative mode broken
- **Fix:** Add all missing fields to default state
- **Priority:** CRITICAL

### Bug 3: Potential Null Renderer Invocation

- **File:** `server/src/fmc-engine.ts:43`
- **Issue:** `getPageRenderer()` can return `null`, invoked without null check
  ```typescript
  getDisplayData(): DisplayData {
    const renderer = getPageRenderer(this.state.currentPage);
    return renderer(this.state); // Crashes if renderer is null
  }
  ```
- **Fix:** Add null check with fallback
  ```typescript
  getDisplayData(): DisplayData {
    const renderer = getPageRenderer(this.state.currentPage);
    if (!renderer) return getPageRenderer('MENU')!(this.state);
    return renderer(this.state);
  }
  ```
- **Priority:** HIGH

### Bug 4: npm Vulnerabilities

- **Issue:** `npm install` reports 2 moderate severity vulnerabilities
- **Fix:** Run `npm audit fix`
- **Priority:** MEDIUM

---

## 2. Visual Accuracy Issues

### 2.1 Boeing 737 NG CDU

#### Color Inaccuracy (HIGH Priority)

- **Current:** All text uses bright green `#39ff14`
- **Real Hardware:** Full-color LCD with:
  - Cyan for inactive page titles
  - Green for active/VOR data
  - Magenta for FMC guidance
  - White for most data
  - Shaded white for modifications
- **Fix:** Implement color-coded display system per Boeing FCOM conventions

#### Missing Function Keys (HIGH Priority)

- **Current:** INIT REF, RTE, DEP ARR, LEGS, PERF, PROG, MENU (7 keys)
- **Real Hardware:** 14 function keys total:
  - Row 1: INIT/REF, RTE, CLB, CRZ, DES
  - Row 2: DIR INTC/MENU, LEGS, DEP/ARR, HOLD, PROG, N1 LIMIT, FIX
  - Row 3: PREV PAGE, NEXT PAGE
- **Fix:** Add missing function keys to CDU.tsx

#### Font Inaccuracy (MEDIUM Priority)

- **Current:** Generic `Courier New` monospace
- **Real Hardware:** Custom FMC font with specific glyph metrics
- **Fix:** Source or create FMC-specific bitmap font

#### Keypad Layout (MEDIUM Priority)

- **Current:** Custom 4×4 numeric + 5×5 alpha grid
- **Real Hardware:** Standard CDU layout with specific key groupings
- **Fix:** Reorganize keypad to match real CDU layout

#### Bezel Appearance (LOW Priority)

- **Current:** Flat dark gray `#1a1a1a` with rounded corners
- **Real Hardware:** Aluminum housing with straight edges, DZUS fasteners
- **Fix:** Add realistic bezel styling with proper shadows/depth

### 2.2 Airbus A320 MCDU

#### Wrong Function Key Labels (HIGH Priority)

- **Current:** AIR PORT, F-PLN, PERF, PROG, RAD NAV, MCDU MENU
- **Real Hardware:** DIR, PROG, PERF, INIT, DATA, F-PLN, RAD NAV
- **Fix:** Update function key labels in AirbusCDU.tsx

#### No Color Semantics (MEDIUM Priority)

- **Current:** All text uses amber `#ffb000`
- **Real Hardware:** Color-coded semantics:
  - White = titles/advisories
  - Blue = modifiable data
  - Green = active/non-modifiable
  - Amber = mandatory/important messages
  - Magenta = constraints
- **Fix:** Implement color-coded display per Airbus conventions

#### Missing Pages (MEDIUM Priority)

- Missing: SEC F-PLN management, RAD NAV actual tuning, DATA INDEX sub-pages
- Fix: Complete Airbus page implementations

---

## 3. Functional Gaps

### 3.1 Navigation Database (HIGH Priority)

- **Current:** Hardcoded only KJFK/KDCA SIDs/STARs
- **Gap:** No real navigation database
- **Fix:**
  - Integrate with Navigraph or Aerosoft nav data
  - Implement ARINC 424 path/terminator logic
  - Add procedure validity checking
  - Support multiple airports globally

### 3.2 Input Validation (HIGH Priority)

- **Current:** Almost no validation
- **Needed:**
  - ICAO code validation for airports/waypoints
  - Flight number format checking
  - Altitude/speed/temperature range validation
  - Contextual validation (V1 < VR < V2, reasonable fuel values)
  - Proper error messages in scratchpad

### 3.3 LEGS Page (MEDIUM Priority)

- **Current:** Waypoint display only, LSK actions are null
- **Gap:** No waypoint editing, no constraint modification
- **Fix:** Wire LSK actions to waypoint editing logic

### 3.4 HOLD/FIX Pages (MEDIUM Priority)

- **Current:** Pure placeholders
- **Gap:** No actual hold pattern or fix reference functionality
- **Fix:** Implement hold pattern creation and fix reference logic

### 3.5 SimBrief Integration (MEDIUM Priority)

- **Current:** Parser exists but no UI integration visible
- **Gap:** Cannot import real flight plans
- **Fix:** Add SimBrief import button and data mapping

### 3.6 MSFS Integration (HIGH Priority)

- **Current:** PMDG adapter is a stub, no real SimConnect
- **Gap:** Cannot connect to Microsoft Flight Simulator
- **Fix:**
  - Implement real SimConnect integration via node-simconnect
  - Add aircraft-specific mapping profiles (PMDG, FBW, Fenix, Working Title)
  - Implement proper variable scaling and unit conversion
  - Add connection diagnostics and error handling

### 3.7 Failure Modes (LOW Priority)

- **Current:** No failure simulation
- **Gap:** No FAIL/OFF flags, no dual FMC comparison
- **Fix:** Implement basic FMC failure annunciations

---

## 4. Real Hardware Reference Specifications

### Boeing 737 NG CDU

- **Display:** 14 rows × 24 characters
- **Screen Size:** 3.81" W × 3.13" H
- **Resolution:** 648 × 532 color elements
- **Type:** Full-color LCD (NG), legacy CRT on older 737-300/500
- **Colors:** Black background, cyan, green, magenta, white, shaded white
- **Housing:** Solid aluminum, DZUS fasteners, straight-edged display
- **Function Keys:** 14 total (INIT/REF, RTE, CLB, CRZ, DES, DIR INTC, LEGS, DEP/ARR, HOLD, PROG, N1 LIMIT, FIX, PREV PAGE, NEXT PAGE)
- **Image References:**
  - http://www.b737.org.uk/fmc.htm
  - https://flaps2approach.com/journal/2017/3/8/conversion-of-oem-cdu-part-one.html
- **Documentation:**
  - Boeing FCOM: https://aerocadet.com/cbts/pdf/B737NG-Flight_Management_and_Navigation.pdf
  - GE 2584 Datasheet: https://www.geaerospace.com/sites/default/files/Flight-Management-Computer-MCDU-9-inch-Datasheet.pdf

### Airbus A320 MCDU

- **Display:** 14 rows × 24 characters
- **Screen Size:** ~100mm × 95mm
- **Type:** Legacy amber CRT or modern LCD
- **Colors:** White, blue, green, amber, magenta (color-coded semantics)
- **Housing:** Dark gray/black rectangular box, smoked display window
- **Function Keys:** DIR, PROG, PERF, INIT, DATA, F-PLN, RAD NAV
- **Image References:**
  - https://commons.wikimedia.org/wiki/File:CP_MCDU.jpg
  - https://commons.wikimedia.org/wiki/File:Cockpit_of_Airbus_A320-211_Air_France_(F-GFKH).jpg
- **Documentation:**
  - FlyByWire MCDU: https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-briefing/mcdu/interface
  - Airbus FCOM (reference only)

---

## 5. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)

- [ ] Fix Airbus MCDU MENU page crash
- [ ] Fix server TypeScript errors
- [ ] Fix null renderer invocation
- [ ] Run `npm audit fix`
- [ ] Verify full TypeScript compilation passes

### Phase 2: Visual Accuracy - Boeing (Weeks 2-3)

- [ ] Implement multi-color display system
- [ ] Add missing 7 function keys
- [ ] Source FMC-specific font
- [ ] Reorganize keypad layout
- [ ] Update inverse video to match real display

### Phase 3: Visual Accuracy - Airbus (Weeks 3-4)

- [ ] Correct function key labels
- [ ] Implement color-coded semantics
- [ ] Complete missing page implementations
- [ ] Fix MCDU MENU page styling

### Phase 4: Functional Improvements (Weeks 4-6)

- [ ] Add comprehensive input validation
- [ ] Wire up LEGS page waypoint editing
- [ ] Implement HOLD/FIX page functionality
- [ ] Add navigation database integration
- [ ] Integrate SimBrief import

### Phase 5: MSFS Integration (Weeks 6-8)

- [ ] Implement real SimConnect integration
- [ ] Add aircraft-specific adapter profiles
- [ ] Implement proper variable scaling
- [ ] Add connection diagnostics UI
- [ ] Add diagnostic mode for developers

### Phase 6: Polish & Training (Weeks 8-10)

- [ ] Add failure mode annunciations
- [ ] Implement contextual LSK labels
- [ ] Add realistic button press animations
- [ ] Enhance tutorial system with error detection
- [ ] Implement performance metrics and scoring

---

## 6. Success Metrics

### Build Quality

- [ ] `npm run typecheck:all` passes with zero errors
- [ ] `npm run build` produces clean output
- [ ] `npm audit` shows zero vulnerabilities
- [ ] All pages render without console errors

### Visual Accuracy

- [ ] Boeing CDU displays correct multi-color scheme
- [ ] All 14 function keys present and labeled correctly
- [ ] Airbus MCDU shows correct color-coded semantics
- [ ] Font rendering matches real hardware proportions
- [ ] Side-by-side comparison with real CDU photos shows <10% variance

### Functional Accuracy

- [ ] Input validation catches 90%+ of common entry errors
- [ ] All 12 Boeing pages fully functional
- [ ] All 12 Airbus pages fully functional
- [ ] MSFS integration connects and syncs data
- [ ] Tutorial scenarios complete without errors

---

## 7. Files Requiring Changes

### Critical Priority

1. `shared/src/fmc/pages/airbus/index.ts` - Fix MCDU MENU array
2. `server/src/fmc-engine.ts` - Add missing state fields
3. `src/components/CDU/CDU.tsx` - Add missing function keys
4. `src/components/CDU/AirbusCDU.tsx` - Fix function key labels

### High Priority

5. `src/components/CDU/Display.tsx` - Implement multi-color display
6. `shared/src/fmc/pages/setup.ts` - Update color formatting
7. `shared/src/fmc/pages/airbus/index.ts` - Add color semantics
8. `src/store/useFMCStore.ts` - Add input validation
9. `server/src/aircraft-adapters/pmdg-737.ts` - Implement real SimConnect

### Medium Priority

10. `shared/src/fmc/flightPlanParser.ts` - Expand waypoint database
11. `src/components/DemoWelcome.tsx` - Add SimBrief import button
12. `shared/src/fmc/pages/navigation.ts` - Wire up LEGS editing
13. `src/components/CDU/CDUButton.tsx` - Add press animations

---

## 8. Test Plan

### Manual QA Checklist

- [ ] Build passes without errors
- [ ] All Boeing pages navigate correctly
- [ ] All Airbus pages navigate correctly
- [ ] Aircraft switch (Boeing ↔ Airbus) works
- [ ] Tutorial scenarios complete successfully
- [ ] Scratchpad input and cursor blink work
- [ ] EXEC light activates on data entry
- [ ] MSG light works correctly
- [ ] Touch feedback/ripple effects on buttons
- [ ] Kiosk mode detection works
- [ ] WebSocket connection UI functions
- [ ] PWA service worker registers

### Automated Testing Needs

- [ ] Unit tests for page renderers
- [ ] Unit tests for route parser
- [ ] Unit tests for input validation
- [ ] Integration tests for MSFS bridge
- [ ] Visual regression tests (screenshot comparison)

---

## 9. Dependencies to Evaluate

### Font

- Consider: `bdf-fonts`, custom bitmap font, or open-source aviation font
- License: Must be compatible with MIT license

### Navigation Database

- Options: Navigraph AIRAC, Aerosoft nav data, custom database
- Cost: Navigraph requires subscription
- Integration: ARINC 424 format parser needed

### SimConnect

- Library: `node-simconnect` or `msfs-simconnect-api`
- Requirements: Windows + MSFS 2020 installed for testing
- Fallback: Keep mock adapter for development

---

## 10. Notes

### Assumptions

- Real hardware specs based on publicly available sources (Boeing FCOM, GE datasheets, pilot manuals)
- Some variation exists between CDU manufacturers (Honeywell, Collins, Smiths)
- Airbus MCDU specs may vary between A320 generations (classic vs neo)

### Known Limitations

- MSFS integration cannot be fully tested without Windows + MSFS 2020
- Real navigation database requires external data source
- Font licensing may require commercial agreement for exact FMC glyphs

### Risk Assessment

- **Low Risk:** Visual color changes, button additions
- **Medium Risk:** Navigation database integration, SimConnect implementation
- **High Risk:** Font licensing, ARINC 424 parser complexity

---

_This plan is a living document. Update as implementation progresses and new findings emerge._
