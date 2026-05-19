# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** src/components/CockpitMode

## OVERVIEW

Cockpit mode components for full cockpit view, including layout, panels, toolbar, brightness, EICAS, and helper overlays.

## STRUCTURE

```
CockpitMode/
├── CockpitLayout.tsx         # Main cockpit layout grid
├── CockpitLayoutGrid.tsx     # Responsive grid definition
├── CockpitPanels.tsx         # Left/right panel containers
├── CockpitToolbar.tsx        # Top toolbar with mode selectors
├── BrightnessPanel.tsx       # Brightness adjustment panel
├── EICASPanel.tsx            # Engine Indication and Crew Alerting System
├── DisplaySelector.tsx       # PFD/ND/MAP display selector
├── FirstRunGuidance.tsx      # Initial setup helper overlay
├── KeyboardHelpOverlay.tsx   # Keyboard shortcuts help
├── ModeHelpCard.tsx          # Contextual help cards
├── OrientationPrompt.tsx     # Screen orientation prompt
├── PerformanceOverlay.tsx    # Performance data overlay
└── CockpitEmptyState.tsx     # Empty state when no data
```

## WHERE TO LOOK

| Task                        | Location                                     |
| --------------------------- | -------------------------------------------- |
| Main cockpit layout         | `CockpitLayout.tsx`, `CockpitLayoutGrid.tsx` |
| Left/right panels           | `CockpitPanels.tsx`                          |
| Top toolbar                 | `CockpitToolbar.tsx`                         |
| Brightness control          | `BrightnessPanel.tsx`                        |
| EICAS display               | `EICASPanel.tsx`                             |
| Display selector (PFD/ND)   | `DisplaySelector.tsx`                        |
| First-run guidance          | `FirstRunGuidance.tsx`                       |
| Keyboard help overlay       | `KeyboardHelpOverlay.tsx`                    |
| Mode-specific help cards    | `ModeHelpCard.tsx`                           |
| Orientation prompt (mobile) | `OrientationPrompt.tsx`                      |
| Performance overlay         | `PerformanceOverlay.tsx`                     |
| Empty state                 | `CockpitEmptyState.tsx`                      |

## CONVENTIONS

- **Layout-first**: Uses CSS Grid for responsive cockpit layout
- **Touch targets**: Minimum 44px for interactive elements
- **iOS safe areas**: Respects safe area insets on mobile
- **Consistent styling**: Uses Tailwind utilities from shared design system
- **Modular panels**: Each cockpit section is a separate component
- **Lazy loading**: Heavy panels (like EICAS) load only when visible
- **Accessibility**: ARIA labels where appropriate, keyboard navigable

## ANTI-PATTERNS

- **Absolute positioning**: Avoid fixed positioning; use grid/flex layout
- **Hardcoded dimensions**: Use relative units (rem, %) or Tailwind classes
- **Direct DOM manipulation**: Prefer React state and refs over `document.*`
- **Blocking the UI**: Avoid synchronous layouts or expensive computations during render
- **Missing TypeScript types**: All props and state must be fully typed
- **Duplicate logic**: Shared functionality (e.g., brightness) should be extracted to hooks
