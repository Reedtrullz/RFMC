# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Component:** src/components/CDU/

## OVERVIEW

CDU display + input components. Touch-first. AMOLED green/black.

## STRUCTURE

```
CDU/
├── Display.tsx        # Main display
├── display/           # Display sub-components
├── Keypad.tsx         # Numeric keypad
├── LSKButton.tsx      # Line Select Keys
├── Scratchpad.tsx     # Scratchpad input
├── CDUButton.tsx      # Bezel buttons
├── boeing/            # Boeing variant
└── airbus/            # Airbus variant
```

## WHERE TO LOOK

| Task              | Location                      |
| ----------------- | ----------------------------- |
| Display rendering | `Display.tsx`, `display/`     |
| Key input         | `Keypad.tsx`, `LSKButton.tsx` |
| Boeing CDU        | `boeing/`                     |
| Airbus MCDU       | `airbus/`                     |

## CONVENTIONS

- 44px touch targets minimum
- Amber select highlight
- CRT scanline effect
- Green-on-black AMOLED

## ANTI-PATTERNS

- Direct DOM manipulation
- Non-touch inputs
