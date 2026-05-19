# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** src/components/instruments/boeing/BoeingMCP/

## OVERVIEW

Boeing 737 Mode Control Panel (MCP) components. 6 files implementing the autopilot/flight director control interface — knobs, switches, display windows, annunciators, and frame assembly.

## STRUCTURE

```
BoeingMCP/
├── BoeingMCP.tsx         # Main MCP assembly / layout
├── BoeingMCPFrame.tsx    # Outer frame / structural container
├── MCPKnob.tsx           # Rotary knob controls (HDG, ALT, SPD, etc.)
├── MCPSwitch.tsx         # Toggle/switch controls (FD, A/T, etc.)
├── MCPDisplayWindow.tsx  # Glass display windows for active values
└── MCPAnnunciator.tsx    # Annunciator light indicators
```

## WHERE TO LOOK

| Task               | Location                              |
| ------------------ | ------------------------------------- |
| Main MCP layout    | `BoeingMCP.tsx`, `BoeingMCPFrame.tsx` |
| Knob controls      | `MCPKnob.tsx`                         |
| Toggle switches    | `MCPSwitch.tsx`                       |
| Display windows    | `MCPDisplayWindow.tsx`                |
| Annunciator lights | `MCPAnnunciator.tsx`                  |

## CONVENTIONS

- **Touch-first**: 44px minimum touch targets for knobs/switches
- **Visual realism**: Green-on-black AMOLED, amber select highlights
- **InstrumentFit wrapper**: All MCP components wrapped in `InstrumentFit` for dynamic scaling
- **State-driven**: Connects to Zustand autopilot store for knob values and mode annunciations
- **IEC 60417/AS25050**: Follows aviation standard color/label semantics

## ANTI-PATTERNS

- Direct DOM manipulation (prefer React refs + state)
- Hardcoded dimensions (use relative units via InstrumentFit wrapper)
- Touch event handler duplication (use shared useTouchFeedback hook)
