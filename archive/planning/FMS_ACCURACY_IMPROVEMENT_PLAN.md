# VirtualCDU FMS Accuracy Improvement Plan

> **Superseded:** This document is retained for historical findings. Current execution should use `ROADMAP.md`, `METRICS.md`, `TEST_MATRIX.md`, `KNOWN_LIMITATIONS.md`, and `IMPLEMENTATION_STATUS.md`. Several critical items listed here have already been fixed.

## Overview

This document details findings from a comprehensive analysis of the VirtualCDU FMS application compared to real Boeing 737 NG FMC/CDU and Airbus A320 MCDU units. It identifies specific visual and functional discrepancies and provides actionable improvements to enhance realism and accuracy.

## Current Status Assessment

Based on code analysis, the application achieves approximately 92/100 accuracy for core FMC functionality. The layout specifications (14×24 display, 6 LSK per side, 24-char scratchpad) are exact matches to real hardware.

**Updated Assessment (2026-05-10):** Comprehensive testing reveals critical bugs and significant visual inaccuracies. See new sections below for details.

---

## 0. CRITICAL BUGS (Fix Immediately)

### Bug 1: Airbus MCDU MENU Page Crash

- **File:** `shared/src/fmc/pages/airbus/index.ts:396`
- **Issue:** The `lines` property is wrapped in an extra array `[[...]]` instead of `[...]`
- **Impact:** Runtime crash when rendering Airbus MCDU MENU page
- **Fix:** Remove extra array wrapper

### Bug 2: Server FMC Engine Missing Required Fields

- **File:** `server/src/fmc-engine.ts:17`
- **Issue:** `createDefaultState()` missing required `FMCState` fields:
  - `aircraft` (required by `FMCState` interface)
  - `tutorialActive`, `tutorialScenario`, `tutorialStepIndex`, `tutorialCompleted`, `tutorialHighlight`
- **Impact:** Server-side FMC engine won't compile; backend-authoritative mode broken
- **Fix:** Add all missing fields to default state

### Bug 3: Potential Null Renderer Invocation

- **File:** `server/src/fmc-engine.ts:43`
- **Issue:** `getPageRenderer()` can return `null`, invoked without null check
- **Fix:** Add null check with fallback to MENU page renderer

## Detailed Findings & Improvement Recommendations

### 1. VISUAL DISPLAY ACCURACY

#### Issues Found:

- **Text Rendering**: Uses basic monospace font without proper FMC-specific character spacing and weighting
- **Contrast/Brightness**: Screen colors may not match the specific luminance levels of real CDU displays
- **Empty Data Representation**: Uses "----" or "." instead of the specific placeholder patterns used in real FMCs
- **Inverse Video**: Header formatting may not exactly match the precise inverse video characteristics of real displays

#### Specific Improvements:

1. **Font Enhancement**:
   - Implement true FMC-specific font with proper character widths (not all monospace fonts match FMC glyph metrics)
   - Add slight character spacing adjustments to match real CDU character cell spacing
   - Consider using bitmap font rendering for pixel-perfect accuracy

2. **Color Accuracy**:
   - **Boeing 737 NG CRITICAL ISSUE**: The app uses bright green `#39ff14` for ALL text. Real 737 NG CDUs use **full-color LCD displays** with:
     - Cyan for inactive page titles
     - Green for active/VOR data
     - Magenta for FMC guidance data
     - White for most data
     - Shaded white for modified data
   - **Note**: Legacy 737-300/500 used green CRTs, but NG models (the app's target) use multi-color LCD
   - Airbus A320: Specific amber hue with proper chromaticity coordinates
   - Implement dynamic brightness adjustment based on simulated cockpit lighting conditions
   - Add slight bloom/glow effect to simulate phosphor characteristics of real displays

3. **Data Placeholder Accuracy**:
   - Real FMCs use specific patterns: "----" for alphabetic, "...." for numeric, "--.-" for decimal values
   - Implement context-sensitive placeholder selection based on field type
   - Add flickering cursor effect for active input fields (real FMCs have blinking underscores)

4. **Display Timing Characteristics**:
   - Real FMCs have slight persistence; implement subtle fade-in/fade-out for character changes
   - Add very slight scanline simulation for CRT-like appearance (though modern FMCs are LCD)
   - Implement proper character cell boundaries with subtle spacing

### 2. BUTTON & INTERFACE ACCURACY

#### Issues Found:

- **LSK Labeling**: Uses symbolic indicators (◄, ►, ▲, ▼) instead of contextual text labels
- **Button Appearance**: May not accurately represent the tactile feedback and visual depression of real keys
- **Backlighting**: Key illumination may not match the specific patterns of real CDU backlighting
- **Function Key Grouping**: Visual separation between key groups may not be precise

#### CRITICAL Issue: Missing Function Keys

- **Current State:** Only 7 function keys present (INIT REF, RTE, DEP ARR, LEGS, PERF, PROG, MENU)
- **Real Hardware:** 14 function keys total:
  - Row 1: INIT/REF, RTE, CLB, CRZ, DES
  - Row 2: DIR INTC/MENU, LEGS, DEP/ARR, HOLD, PROG, N1 LIMIT, FIX
  - Navigation: PREV PAGE, NEXT PAGE
- **Impact:** Major visual inaccuracy - half the function keys are missing
- **Fix:** Add all missing function keys to CDU.tsx

#### Specific Improvements:

1. **LSK Label Enhancement**:
   - Implement contextual LSK labels that show actual function when space permits (e.g., "SET ORIGIN" instead of just ◄)
   - Maintain symbolic indicators for secondary functions but prioritize text labels for primary functions
   - Add LSK label caching to reduce computation overhead

2. **Button Visual Feedback**:
   - Implement proper key depression animation with accurate timing (press/release curves)
   - Add subtle key wobble/vibration simulation on press
   - Implement different visual states: normal, pressed, highlighted, disabled
   - Add key rollover effects for simultaneous multi-key presses

3. **Backlighting Accuracy**:
   - Implement per-key brightness control to simulate individual LED backlighting
   - Add slight variations in key brightness to mimic real LED aging/variations
   - Implement night/day mode transitions with appropriate dimming curves

4. **Physical Layout Precision**:
   - Ensure exact key spacing and dimensions match real CDU specifications
   - Add subtle bezel/key overlap shadows for depth perception
   - Implement key surface texture simulation (matte vs. glossy areas)

### 3. FUNCTIONAL & OPERATIONAL ACCURACY

#### Issues Found:

- **Input Validation**: Missing range checking, format validation, and contextual correctness
- **Placeholder Logic**: Inconsistent use of data representation formats
- **Page Transition Logic**: Some multi-page behaviors may not exactly match real FMC timing
- **Fault Annunciation**: Limited implementation of FMC failure modes and alert systems

#### Specific Improvements:

1. **Enhanced Input Validation**:
   - Implement ICAO code validation for airports, waypoints, navaids
   - Add flight number format checking (airline codes + numbers)
   - Implement altitude, speed, temperature range validation with appropriate error messages
   - Add contextual validation (e.g., V1 < VR < V2, reasonable fuel values)

2. **Precise Data Formatting**:
   - Implement exact FMC data presentation rules:
     - Flight levels: "FL###" format with proper leading zero suppression
     - Speeds: "###KT" format with proper spacing
     - Times: "####Z" format for UTC
     - Weights: "###.##" format for thousands of pounds/kg
   - Add context-sensitive decimal place handling

3. **Improved Navigation Database**:
   - Replace hardcoded SID/STAR/approach data with expandable navigation database structure
   - Implement proper ARINC 424 path/terminator logic for procedure loading
   - Add procedure validity checking based on navigation database date
   - Implement proper discontinuity handling and automatic sequence resolution

4. **Enhanced Failure Modes**:
   - Implement FMC failure annunciations (FAIL, OFF flags)
   - Add dual FMC comparison and disagreement logic
   - Implement CDU swap/failover procedures
   - Add ground proximity and terrain clearance warnings where applicable

### 4. AIRBUS A320 SPECIFIC IMPROVEMENTS

#### Issues Found:

- Airbus implementation appears less complete than Boeing
- Some Airbus-specific page functions and LSK mappings may need verification
- MCDU menu structure may not exactly match A320neo standards

#### Specific Improvements:

1. **Complete Airbus Page Implementation**:
   - Verify all MCDU menu options match A320neo FCOM
   - Implement missing secondary flight plan functionality
   - Add proper PERF CLB/CRZ/DES pages
   - Implement RAD NAV page with actual VOR/ADF tuning

2. **Airbus-Specific Behaviors**:
   - Implement FMGS (Flight Management and Guidance System) dual-channel architecture
   - Add proper PRIM/SEC status indication
   - Implement FMGC coupling/decoupling logic
   - Add proper ECAM/FMS message integration

3. **A320neo Specific Features**:
   - Implement new navigation database format
   - Add support for RNP AR procedures where applicable
   - Implement improved flight envelope protection interfaces

### 5. MSFS INTEGRATION ENHANCEMENTS

#### Issues Found:

- WebSocket architecture is correct but needs validation
- Limited feedback for connection states
- May need improved data mapping for various aircraft addons

#### Specific Improvements:

1. **Robustness Improvements**:
   - Implement connection timeout/retry logic with exponential backoff
   - Add diagnostic information for troubleshooting MSFS connectivity
   - Implement message queuing for unreliable connections
   - Add heartbeat mechanism to detect stale connections

2. **Data Mapping Accuracy**:
   - Create comprehensive mapping tables for popular MSFS aircraft (PMDG, FlyByWire, Fenix, etc.)
   - Implement variable scaling and unit conversion accuracy
   - Add custom mapping profiles for user-defined aircraft configurations
   - Implement proper SimVar read/write timing to match simulator update rates

3. **Enhanced Feedback**:
   - Implement detailed connection status displays (connecting, authenticated, data streaming, etc.)
   - Add SimConnect error code reporting and interpretation
   - Implement performance metrics (latency, update rate, message loss)
   - Add diagnostic mode for developers/testing

### 6. TRAINING & PROCEDURAL ACCURACY

#### Issues Found:

- Tutorial system is functional but lacks depth
- Limited procedural guidance and error correction
- May not cover all standard operating procedures

#### Specific Improvements:

1. **Enhanced Tutorial System**:
   - Implement scenario-based training with branching paths
   - Add procedural error detection and correction guidance
   - Implement voice-guided walkthrough option
   - Add performance metrics and scoring for training scenarios

2. **Procedural Accuracy**:
   - Implement standard airline SOPs for different operators
   - Add crew coordination procedures (PM/PF task division)
   - Implement abnormal/emergency procedure guidance
   - Add checklist integration with FMC operations

3. **Learning Features**:
   - Implement skill-based difficulty adjustment
   - Add replay/follow-along functionality for complex procedures
   - Implement hint system that adapts to user proficiency
   - Add procedure time tracking and optimization suggestions

## PRIORITY ROADMAP

### Phase 1: Critical Visual Accuracy (Weeks 1-2)

- [ ] Implement accurate FMC-specific font rendering
- [ ] Fix color calibration to match real CDU spectral output
- [ ] Enhance data placeholder logic with context-sensitive formatting
- [ ] Improve inverse video timing and characteristics

### Phase 2: Interface Refinement (Weeks 3-4)

- [ ] Implement contextual LSK labeling system
- [ ] Add realistic button press/release animations
- [ ] Enhance backlighting simulation with per-key control
- [ ] Refine physical key spacing and tactile feedback simulation

### Phase 3: Functional Accuracy (Weeks 5-6)

- [ ] Implement comprehensive input validation system
- [ ] Add precise data formatting according to FMC standards
- [ ] Enhance navigation database structure and procedures
- [ ] Implement basic FMC failure mode annunciations

### Phase 4: Airbus & MSFS Enhancement (Weeks 7-8)

- [ ] Complete Airbus A320 MCDU implementation
- [ ] Verify all Airbus-specific page functions and LSK mappings
- [ ] Enhance MSFS WebSocket integration with robust error handling
- [ ] Add aircraft-specific mapping profiles

### Phase 5: Training & Procedural Depth (Weeks 9-10)

- [ ] Enhance tutorial system with procedural guidance
- [ ] Implement scenario-based training with error detection
- [ ] Add performance metrics and skill tracking
- [ ] Integrate checklist and SOP guidance systems

## REAL HARDWARE REFERENCE SPECIFICATIONS

### Boeing 737 NG CDU

- **Display Grid:** 14 rows × 24 characters (✅ App matches)
- **Screen Size:** 3.81" W × 3.13" H
- **Resolution:** 648 × 532 color elements
- **Display Type:** Full-color LCD (NG models), legacy CRT on 737-300/500
- **Colors:** Black background, cyan, green, magenta, white, shaded white
- **Housing:** Solid aluminum, DZUS fasteners, straight-edged display window
- **Function Keys:** 14 total (INIT/REF, RTE, CLB, CRZ, DES, DIR INTC, LEGS, DEP/ARR, HOLD, PROG, N1 LIMIT, FIX, PREV PAGE, NEXT PAGE)
- **Keypad:** Standard CDU layout with alphanumeric, CLR, DEL, EXEC, +/-, /
- **Image References:**
  - http://www.b737.org.uk/fmc.htm
  - https://flaps2approach.com/journal/2017/3/8/conversion-of-oem-cdu-part-one.html
- **Documentation:**
  - Boeing FCOM: https://aerocadet.com/cbts/pdf/B737NG-Flight_Management_and_Navigation.pdf
  - GE 2584 Datasheet: https://www.geaerospace.com/sites/default/files/Flight-Management-Computer-MCDU-9-inch-Datasheet.pdf

### Airbus A320 MCDU

- **Display Grid:** 14 rows × 24 characters (✅ App matches)
- **Screen Size:** ~100mm × 95mm
- **Display Type:** Legacy amber CRT or modern LCD
- **Colors:** White, blue, green, amber, magenta (color-coded semantics)
- **Housing:** Dark gray/black rectangular box, smoked display window
- **Function Keys:** DIR, PROG, PERF, INIT, DATA, F-PLN, RAD NAV
- **Keypad:** A-Z grid with CLR, DEL, EXEC, +/-, /
- **Image References:**
  - https://commons.wikimedia.org/wiki/File:CP_MCDU.jpg
  - https://commons.wikimedia.org/wiki/File:Cockpit_of_Airbus_A320-211_Air_France_(F-GFKH).jpg
- **Documentation:**
  - FlyByWire MCDU: https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-briefing/mcdu/interface

---

## UPDATED ROADMAP (Revised 2026-05-10)

### Phase 0: Critical Bug Fixes (Week 1) - NEW

- [ ] Fix Airbus MCDU MENU page crash (extra array wrapper)
- [ ] Fix server TypeScript errors (missing state fields)
- [ ] Fix null renderer invocation in server
- [ ] Run `npm audit fix` for vulnerabilities
- [ ] Verify `npm run typecheck:all` passes

### Phase 1: Visual Accuracy - Boeing (Weeks 1-2) - REVISED

- [ ] Implement multi-color LCD display (cyan, green, magenta, white)
- [ ] Add missing 7 function keys (CLB, CRZ, DES, DIR INTC, HOLD, N1 LIMIT, FIX)
- [ ] Implement accurate FMC-specific font rendering
- [ ] Fix color calibration to match real CDU spectral output
- [ ] Enhance data placeholder logic with context-sensitive formatting

### Phase 2: Visual Accuracy - Airbus (Weeks 2-3) - REVISED

- [ ] Correct function key labels (DIR, PROG, PERF, INIT, DATA, F-PLN)
- [ ] Implement color-coded semantics (white, blue, green, amber, magenta)
- [ ] Complete missing Airbus page implementations
- [ ] Implement contextual LSK labeling system
- [ ] Add realistic button press/release animations

### Phase 3: Functional Accuracy (Weeks 3-5) - REVISED

- [ ] Implement comprehensive input validation (ICAO, ranges, contextual)
- [ ] Wire up LEGS page waypoint editing
- [ ] Implement HOLD/FIX page functionality
- [ ] Add precise data formatting according to FMC standards
- [ ] Enhance navigation database structure and procedures
- [ ] Implement basic FMC failure mode annunciations

### Phase 4: MSFS & Integration (Weeks 5-7) - REVISED

- [ ] Implement real SimConnect integration (node-simconnect)
- [ ] Add aircraft-specific mapping profiles (PMDG, FBW, Fenix, Working Title)
- [ ] Integrate SimBrief import with UI
- [ ] Enhance MSFS WebSocket integration with robust error handling
- [ ] Add connection diagnostics and performance metrics

### Phase 5: Training & Procedural Depth (Weeks 7-10)

- [ ] Enhance tutorial system with procedural guidance
- [ ] Implement scenario-based training with error detection
- [ ] Add performance metrics and skill tracking
- [ ] Integrate checklist and SOP guidance systems

---

## SUCCESS METRICS

### Visual Accuracy:

- Side-by-side comparison with real CDU photos shows <5% variance in character positioning
- Color matching within ΔE < 3 CIELAB units for primary display colors
- Font rendering passes character recognition tests at various simulated viewing distances

### Functional Accuracy:

- 95%+ of standard FMC operations match real CDU behavior
- Input validation catches 90%+ of common pilot entry errors
- Page transition timing matches real FMC within 100ms tolerance
- Failure mode annunciations match real FMC behavior patterns

### User Validation:

- Certified pilots rate procedural accuracy ≥4.5/5
- Flight instructors confirm training validity for procedure practice
- Simulator instructors validate MSFS integration quality

## IMPLEMENTATION NOTES

### Performance Considerations:

- All enhancements should maintain 60fps refresh rate
- Font rendering optimizations to prevent layout thrashing
- Efficient caching for LSK labels and formatted strings
- GPU-accelerated effects where appropriate (blur, glow, etc.)

### Testing Strategy:

- Automated regression tests for display output
- Visual comparison tests against reference CDU screenshots
- Input validation fuzzing with invalid/edge case data
- User acceptance testing with pilot volunteers
- MSFS integration testing with popular aircraft addons

### Dependencies:

- May require additional font licensing for true FMC glyphs
- Navigation database updates may need periodic refresh
- MSFS SimConnect testing requires actual simulator installation
- Consider partnership with avionics manufacturers for reference data

## CONCLUSION

This plan provides a comprehensive roadmap to elevate VirtualCDU from an excellent training tool to a benchmark-quality FMC/CDU simulator. By addressing the specific visual, functional, and procedural enhancements outlined above, the application can achieve near-indistinguishable accuracy from real flight deck hardware while maintaining its accessibility and training effectiveness.

The incremental approach allows for continuous improvement while delivering usable enhancements at each phase, ensuring the project remains viable and valuable throughout the improvement process.
