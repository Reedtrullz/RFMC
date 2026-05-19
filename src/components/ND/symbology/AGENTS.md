# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** src/components/ND/symbology

## OVERVIEW

Navigation Display symbology components for Boeing and Airbus aircraft. Includes waypoints, fixes, headings, ranges, winds, and constraints.

## STRUCTURE

```
symbology/
├── WaypointSymbol.tsx      # Waypoint marker
├── FixRing.tsx             # Fix/waypoint ring
├── HoldingPattern.tsx      # Holding pattern overlay
├── WindVector.tsx          # Wind direction/speed vector
├── RangeRings.tsx          # Distance rings (arcs)
├── BoeingHeadingArc.tsx    # Boeing-style heading arc
├── AirbusHeadingScale.tsx  # Airbus-style heading scale
├── AirportSymbol.tsx       # Airport symbol
├── ConstraintsOverlay.tsx  # Altitude/speed constraints
├── RouteLine.tsx           # Flight plan route line
└── ModeAnnunciations.tsx   # Autopilot mode annunciations
```

## WHERE TO LOOK

| Task                       | Location                                         |
| -------------------------- | ------------------------------------------------ |
| Waypoint/fix symbols       | `WaypointSymbol.tsx`, `FixRing.tsx`              |
| Holding pattern            | `HoldingPattern.tsx`                             |
| Wind visualization         | `WindVector.tsx`                                 |
| Distance arcs              | `RangeRings.tsx`                                 |
| Heading indicators         | `BoeingHeadingArc.tsx`, `AirbusHeadingScale.tsx` |
| Airport symbols            | `AirportSymbol.tsx`                              |
| Speed/altitude constraints | `ConstraintsOverlay.tsx`                         |
| Route line                 | `RouteLine.tsx`                                  |
| Autopilot modes            | `ModeAnnunciations.tsx`                          |

## CONVENTIONS

- **Aviation standards**: All symbols follow ICAO/ARINC specifications
- **Touch-friendly**: Minimum 44px touch targets where interactive
- **Color coding**: Magenta for active waypoints, cyan for inactive
- **Scaling**: Symbols scale with ND range (nm)
- **Visibility**: Symbols use contrasting colors (green-on-black AMOLED)
- **Animation**: No animations unless indicating active state (e.g., sequencing)

## ANTI-PATTERNS

- **Direct canvas manipulation**: Use React render pipeline, not raw canvas
- **Non-aviation symbols**: All symbols must follow aviation standards
- **Hardcoded positions**: Calculate positions based on aircraft location and range
- **Inconsistent styling**: Use Tailwind utilities consistently
- **Missing TypeScript types**: All components must be fully typed
