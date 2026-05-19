# Learnings - ND Retina Improvement

## Typography and Contrast on Boeing ND

- Standard fonts for aviation electronics like Boeing 737 FMCs and NDs use monospace values for numerical indicators (ETA, distance/NM) to avoid shifting layouts and optimize readability.
- The default high-density, custom letter-spacing layout for Retina displays works best with strict SVG text attribute styling (`letterSpacing="0.05em"`, `fontFamily="'B612 Mono', monospace"`, `fontWeight="900"`, `fontSize="3.2"`).
- Standard monospace helper classes such as `className="font-mono"` provide immediate compatibility with Tailwind CSS frameworks while keeping pure SVG renderer logic intact.

## High-Contrast Panel Container Borders

- Sharp border transitions (e.g. replacing low-contrast `#2a2d2d` top-border with `#3a3d3d`) greatly optimize usability in realistic simulators operating in darkened rooms.
- Combining explicit dark side/bottom borders (`border-x border-b border-black/50`) with an intense inset shadow (`shadow-[inset_0_1px_6px_rgba(0,0,0,0.9)]`) creates a highly realistic, inset-molded plastic bezel feel.

## Visual Regression Testing & Multi-Viewport Baselines

- Executed visual regression baseline updates across high-resolution projects (`desktop-chromium`, `desktop-3456x2234`, `retina-1728x1117-dsf2`) to establish the refined, overlap-free Boeing ND standard.
- Downloaded and configured the missing WebKit and Firefox browser executables via `npx playwright install` for complete test environment parity.
- Verified that all 216 e2e visual regression test cases pass successfully without layout anomalies, establishing a new gold standard visual baseline for the simulation cockpit.
