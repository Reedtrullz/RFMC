# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Focus:** src/components/instruments/common/

## OVERVIEW

Shared instrument components. 26 files. Basis for Boeing MCP, PFD, and cockpit panels.

## WHERE TO LOOK

| Component              | Purpose                 |
| ---------------------- | ----------------------- |
| `PushPullKnob.tsx`     | MCP-style knobs         |
| `RotaryKnob.tsx`       | Rotary controls         |
| `AnnunciatorLight.tsx` | Warning lights          |
| `FMA.tsx`              | Flight Mode Annunciator |
| `PFD.tsx`              | Primary Flight Display  |
| `ScreenGlass.tsx`      | CRT screen effect       |

## CONVENTIONS

- Shared across Boeing/Airbus
- `@virtual-cdu/shared` imports
- Tailwind styling

## ANTI-PATTERNS

- Duplicated knob logic
- Inconsistent styling
- Missing TypeScript types
