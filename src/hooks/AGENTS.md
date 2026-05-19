# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Focus:** src/hooks/

## OVERVIEW

React hooks for state management, websocket, kiosk mode, touch feedback. Bridge Zustand store + React components.

## WHERE TO LOOK

| Hook                  | Purpose                             |
| --------------------- | ----------------------------------- |
| `useWebSocket.ts`     | MSFS integration, SimConnect bridge |
| `useKioskMode.ts`     | Fullscreen, PWA kiosk               |
| `useTouchFeedback.ts` | Ripple effect, iOS safe areas       |
| `useSound.ts`         | CDU audio cues                      |
| `useCDUKeyboard.ts`   | Keyboard-to-CDU input               |
| `useDraggable.ts`     | Drag/resize panels                  |

## CONVENTIONS

- Consistent naming (camelCase hooks)
- Minimal re-renders via `useMemo`/`useCallback`
- Cross-cutting: store ↔ components

## ANTI-PATTERNS

- Hardcoded WebSocket URLs (use env)
- Direct DOM manipulation
- Excessive re-renders in hooks
