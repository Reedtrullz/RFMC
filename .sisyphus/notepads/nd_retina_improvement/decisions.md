# Decisions - ND Retina Improvement

## High-Density Typography on Waypoint Block

- **Decision:** Apply `fontWeight="900"` (black/bold weight) to active waypoint block elements (translate `(96, 6)`) to ensure high contrast, sharp text edges, and separation from the heading scale arc.
- **Decision:** Use exact styling (`fontSize="3.2"`, `letterSpacing="0.15em"` for ident, and `0.05em` on numeric blocks, using monospace font format `'B612 Mono', monospace` on the digits/numbers) to render a pristine high-resolution layout.

## EFIS Control Panel Border and Shadow Refinement

- **Decision:** Modify the top border color of the container element in `NDControls.tsx` from `#2a2d2d` to `#3a3d3d` for improved high-contrast dark-room simulator visibility.
- **Decision:** Add sharp inner shadow effects (`shadow-[inset_0_1px_6px_rgba(0,0,0,0.9)]`) along with explicit, high-contrast borders on all sides (`border-x border-b border-black/50`) to perfectly matches the high-contrast physical CDU-EFIS control panel look on Retina displays.
