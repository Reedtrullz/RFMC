# VirtualCDU FMS Visual Analysis Summary

## Analysis Limitations

**Note**: The attached images could not be analyzed due to vision capability limitations in the current model. All analysis below is based on code inspection and comparison with known FMC/CDU specifications from documentation.

## Code-Based Visual Accuracy Assessment

From examining the source code, here are the specific visual implementation details:

### Display Characteristics (from Tailwind config and Display components):

**Colors Implemented:**

- Screen background: `#0a0a0a` (very dark gray/near black)
- Text color (Boeing): `#39ff14` (bright green)
- Text color (Airbus): `#ffb000` (amber)
- Dim text: `#1a8c0a` (darker green)
- Cyan accent: `#00d0ff`
- Bezel: `#1a1a1a` (dark gray)
- Bezel highlight: `#2a2a2a` (slightly lighter gray)
- EXEC light: `#00ff00` (green)
- Error: `#ff3333` (red)

**Typography:**

- Font family: `["Courier New", "Courier", "monospace"]`
- Text size: `text-[11px]` for display, `text-[9px]` for headers
- Font tracking: `tracking-[0.3em]` for headers
- Font weight: `font-semibold` for function keys, various weights elsewhere

**Effects:**

- Blink animation: `blink 1s step-end infinite`
- Pulse animation for EXEC: `pulse-exec 1.5s ease-in-out infinite`
- Text glow effects via `text-glow` and `text-glow-amber` classes

### Layout Precision:

**Grid Structure (from CDU.tsx and AirbusCDU.tsx):**

- CSS Grid with `gridTemplateColumns: 'auto 1fr auto'` (left LSK, display, right LSK)
- `gridTemplateRows: 'repeat(14, minmax(0, 1fr)) auto'` (14 display lines + 1 scratchpad)
- Exact 14-line display implementation using `PAGE_LINES = 14` constant
- Character width enforcement via `PAGE_WIDTH = 24` constant in formatting functions

### Button Implementation:

**Boeing CDU (CDU.tsx):**

- Function keys: INIT REF, RTE, DEP ARR, LEGS, PERF, PROG, MENU
- Keypad: Standard layout with ., 0, +/-, /, CLR, SP, Z, DEL, EXEC, NEXT, PREV
- LSK positioning: Precise grid placement for 6 LSK per side at specific rows
- Visual feedback: Highlight state for tutorial guidance, EXEC lit state

**Airbus CDU (AirbusCDU.tsx):**

- Function keys: AIR PORT, F-PLN, PERF, PROG, RAD NAV, MCDU MENU
- Airbus-specific keypad layout with alpha/numeric separation
- LSK positioning: Same grid approach as Boeing
- Variant-aware display and scratchpad components

### Data Formatting Accuracy:

From the page rendering functions (shared/src/fmc/pages/):

**Correct Implementations:**

- Inverse video for headers: `inv()` function creates white text on dark background
- Proper left/right labeling with `fmt()` function using `PAGE_WIDTH` padding
- Context-sensitive data presentation:
  - Flight levels: `FL${String(performance.crzAlt).slice(0,3)}`
  - Speeds: `${takeoff.vr} KT` format
  - Weights: `(performance.zfw / 1000).toFixed(2)` for klbs/kg
  - Temperatures: `${takeoff.oat}°C` format
  - Pressure: `${(takeoff.qnh / 100).toFixed(0)} HPA`
- Blank line handling with `blank()` function for padding
- Discontinuity handling: "----- DISCONTINUITY" formatting

### LSK Labeling System:

From CDU.tsx `getLSKLabel()` function:

- Navigation actions mapped to symbols:
  - 'next_page' → '▼'
  - 'prev_page' → '▲'
  - 'dep_page' → 'DEP'
  - 'arr_page' → 'ARR'
  - Left side actions → '◄'
  - Right side actions → '►'

### Potential Visual Improvements Identified:

Based on code analysis alone (without seeing actual rendered output), these enhancements could improve visual fidelity:

1. **Font Metrics**:
   - Current: Generic monospace
   - Improvement: FMC-specific font with exact character cell metrics

2. **Color Accuracy**:
   - Current: Approximate RGB values
   - Improvement: Spectrally accurate colors matching real CDU phosphor/LED output

3. **Placeholder Precision**:
   - Current: Uses "----"/"."/ "--.-" patterns
   - Improvement: Context-sensitive placeholder selection per ARINC specifications

4. **LSK Labels**:
   - Current: Symbolic indicators (◄►▲▼)
   - Improvement: Contextual text labels when space permits (e.g., "SET ORIGIN")

5. **Button Dynamics**:
   - Current: Basic press states
   - Improvement: Realistic depression animation, tactile feedback simulation

6. **Display Characteristics**:
   - Current: Flat color rendering
   - Improvement: Subtle bloom/glow, scanline simulation, persistence effects

7. **Contrast Ratios**:
   - Current: Hardcoded values
   - Improvement: Dynamic brightness adaptation to simulate cockpit lighting conditions

## Conclusion

Without being able to analyze the actual rendered images, the code inspection shows that VirtualCDU implements:

✅ **Exact dimensional accuracy** (14×24 display, 6 LSK/side, 24-char scratchpad)
✅ **Correct functional layout** (all standard FMC keys present)
✅ **Proper formatting algorithms** for FMC data presentation
✅ **Structured approach** to visual effects (blink, pulse, glow)
✅ **Consistent use** of constants for layout parameters

## Real Hardware Comparison (Updated 2026-05-10)

### Boeing 737 NG CDU

After comparing with real hardware specifications and images:

| Feature           | App Implementation             | Real Hardware                                     | Status                   |
| ----------------- | ------------------------------ | ------------------------------------------------- | ------------------------ |
| Display grid      | 14×24 characters               | 14×24 characters                                  | ✅ EXACT MATCH           |
| LSK count         | 6 per side                     | 6 per side                                        | ✅ EXACT MATCH           |
| Screen background | `#0a0a0a`                      | Black                                             | ✅ CLOSE                 |
| **Text color**    | **All bright green `#39ff14`** | **Multi-color LCD** (cyan, green, magenta, white) | ❌ **MAJOR DISCREPANCY** |
| Function keys     | 7 keys                         | 14 keys                                           | ❌ **MISSING 7 KEYS**    |
| Font              | Courier New                    | Custom FMC font                                   | ⚠️ GENERIC               |
| Bezel             | Flat dark gray `#1a1a1a`       | Aluminum, straight-edged                          | ⚠️ DIFFERENT             |
| EXEC light        | Green pulse                    | Green LED                                         | ✅ GOOD                  |

**Critical Finding:** The app uses bright green for ALL Boeing text, but real 737 NG CDUs use **full-color LCD displays**. Legacy 737-300/500 used green CRTs, but NG models (the app's stated target) use multi-color LCD with cyan titles, green data, magenta guidance, and white text.

**Critical Finding:** Only 7 of 14 function keys are present. Missing: CLB, CRZ, DES, DIR INTC, HOLD, N1 LIMIT, FIX.

### Airbus A320 MCDU

| Feature           | App Implementation                                  | Real Hardware                                   | Status              |
| ----------------- | --------------------------------------------------- | ----------------------------------------------- | ------------------- |
| Display grid      | 14×24 characters                                    | 14×24 characters                                | ✅ EXACT MATCH      |
| Text color        | Amber `#ffb000`                                     | Amber/orange                                    | ✅ GOOD             |
| **Function keys** | **AIR PORT, F-PLN, PERF, PROG, RAD NAV, MCDU MENU** | **DIR, PROG, PERF, INIT, DATA, F-PLN, RAD NAV** | ❌ **WRONG LABELS** |
| Color semantics   | All amber                                           | White/blue/green/amber/magenta                  | ❌ **MISSING**      |
| Bezel             | Rounded dark gray                                   | Rectangular dark gray/black                     | ⚠️ DIFFERENT        |

**Critical Finding:** Airbus function key labels don't match real MCDU. "AIR PORT" should be "INIT" or "DIR", "MCDU MENU" is not a direct function key.

**Critical Finding:** Real A320 MCDU uses color-coded semantics (white=advisory, blue=modifiable, green=active, amber=important, magenta=constraints), but app shows only amber.

### Overall Assessment

The application has **exact dimensional accuracy** (14×24, 6 LSK) but **significant visual inaccuracies** in color, key labels, and missing hardware elements. For training purposes it's functional, but for benchmark-level fidelity, major visual corrections are needed.

### Updated Recommendations

**High Priority:**

1. Implement multi-color display for Boeing (cyan, green, magenta, white)
2. Add missing 7 Boeing function keys
3. Correct Airbus function key labels
4. Implement Airbus color-coded semantics

**Medium Priority:** 5. Source FMC-specific font 6. Improve bezel styling for realism 7. Add proper button depression animations

**Low Priority:** 8. Add scanline/persistence effects 9. Implement dynamic brightness

---

_The comprehensive test plan (COMPREHENSIVE_TEST_PLAN.md) contains full details of all findings, bugs, and implementation roadmap._
