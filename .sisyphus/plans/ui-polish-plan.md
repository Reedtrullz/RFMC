# Workplan: Premium Responsive UI & Panel Polish

**Plan Status:** Approved  
**Target Workspaces:** `src` (bezel styling, keycaps, layout scaling, CRT rendering)

This document maps out the visual enhancement and responsive aspect-ratio fitting updates to deliver absolute visual realism for the Flight Deck CDU / MCDU panels, fully optimized for high-performance tablet kiosk rendering.

---

## Phase 1: High-Depth Visual Realism (CRT & Bezel Optics)

### 1.1 Optimized CRT Phosphor Flicker & Bezel Edge Highlight

- **Task:** Polish `ScreenGlass.tsx` and `instruments.css` to add high-fidelity CRT graphics.
- **Details:**
  - To avoid expensive frame paint loops (re-blurring a 20px CSS filter at $60\text{Hz}$), pre-bake the CRT bloom using soft color stops directly in a `radial-gradient` background.
  - Modulate the phosphor bloom opacity using a GPU-promoted, lightweight CSS animation:
    ```css
    .screen-glass__glow {
      will-change: opacity;
      transform: translate3d(0, 0, 0);
      animation: crt-flicker 0.15s infinite alternate;
    }
    @keyframes crt-flicker {
      0% {
        opacity: 0.16;
      }
      100% {
        opacity: 0.19;
      }
    }
    ```
  - Add a crisp inner bezel edge light catcher `.instrument-shell__inner-bevel` that draws a $1\text{px}$, high-contrast, linear-gradient border simulating ambient light reflection on the inner plastic casing.

### 1.2 Tactile Keycap Travel & Backlit Glow Bleed

- **Task:** Add physical travel and backlighting effects to CDU buttons.
- **Details:**
  - To prevent heavy `box-shadow` redraw cycles on key inputs, keep button shadows static. Instead, translate _only_ the inner keycap face element `.avionics-key__face` vertically: `transform: translateY(1.5px)` on active click states, relying strictly on GPU compositing layers.
  - Add backlit LED characters that emit a subtle radial glow underneath the lettering when night mode is active.

### 1.3 Pseudo-Randomized Bezel Screws

- **Task:** Refactor screw render loops to introduce realistic, pseudo-randomized installation alignments.
- **Details:**
  - Calculate unique, deterministic rotation angles for each bezel screw based on its position index, applying the transform via inline style variables to avoid dynamic CSS class thrashing:
    ```typescript
    const rotation = (index * 137.5) % 360; // Golden angle pseudo-random rotation
    ```

---

## Phase 2: Aspect-Ratio Scaling & Responsive Padding

### 2.1 Dynamic Aspect-Ratio Thresholds for iPads

- **Task:** Refactor `InstrumentFit.tsx` and `CockpitLayout.tsx` to handle fluid iPad margins.
- **Details:**
  - Replace brittle, exact aspect-ratio checks (`=== 4/3`) with fluid threshold ranges to handle notches, browser safe-area insets, and multitasking Split Views:
    - **Tall Viewports (aspectRatio < 1.35):** Safely matches classic iPads ($4:3 \approx 1.33$), iPad Pro 11" ($11:9 \approx 1.22$), and narrow splits. Minimize side margins and slightly contract bezel padding to protect screen real estate.
    - **Wide Viewports (aspectRatio >= 1.35):** Matches wide screens and $16:10$ tablets. Dynamically expand side margins to absorb horizontal letterboxing.

### 2.2 Constrained Outer Slots to Prevent Resize Loops

- **Task:** Prevent `ResizeObserver` loop crashes.
- **Details:**
  - Ensure that all parent containers inside `CockpitLayout.tsx` have strictly constrained CSS layout limits (independent of child scaling transforms) to completely eliminate dynamic layout feedback loops.
