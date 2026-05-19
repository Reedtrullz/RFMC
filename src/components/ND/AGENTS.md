# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Focus:** src/components/ND/

## OVERVIEW

Navigation Display components. Symbology + layers for Boeing 737 ND rendering.

## STRUCTURE

```
ND/
├── NavigationDisplay.tsx  # Main ND
├── NDControls.tsx         # ND mode controls
├── symbology/             # Aircraft, waypoints, routes
├── layers/                # Background, weather layers
├── renderers/             # ND rendering utilities
└── frame/                 # PFD/ND frame
```

## WHERE TO LOOK

| Task        | Location                 |
| ----------- | ------------------------ |
| Symbology   | `symbology/`, `symbols/` |
| Layers      | `layers/`                |
| ND controls | `NDControls.tsx`         |
| Frame       | `frame/`                 |

## CONVENTIONS

- Touch-first: 44px targets
- Aviation symbology standard
- `@virtual-cdu/shared` imports

## ANTI-PATTERNS

- Direct canvas manipulation
- Non-aviation symbols
