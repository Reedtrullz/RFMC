# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** src/

## OVERVIEW

React frontend workspace (@virtual-cdu/frontend). Contains CDU, ND, instruments, cockpit mode, hooks, store, and utils.

## STRUCTURE

```
src/
├── components/          # UI components (CDU, ND, instruments, cockpit)
│   ├── CDU/            # Boeing/Airbus CDU display and input
│   ├── ND/             # Navigation Display symbology and layers
│   ├── instruments/    # MCP, PFD, annunciators
│   ├── CockpitMode/    # Full cockpit layout and panels
│   └── Training/       # Tutorial overlay
├── hooks/              # Custom React hooks (WebSocket, touch, audio, kiosk)
├── store/              # Zustand FMC state machine (modules: fmc, alert, autopilot, etc.)
├── test/               # Vitest setup and mocks
└── utils/              # Utility functions (formatters, validators, helpers)
```

## WHERE TO LOOK

| Task                  | Location                      |
| --------------------- | ----------------------------- |
| CDU display/input     | `src/components/CDU/`         |
| Navigation Display    | `src/components/ND/`          |
| Instrument panels     | `src/components/instruments/` |
| Full cockpit view     | `src/components/CockpitMode/` |
| Tutorial overlay      | `src/components/Training/`    |
| WebSocket/audio/hooks | `src/hooks/`                  |
| FMC state management  | `src/store/`                  |
| Test setup/mocks      | `src/test/`                   |
| Shared utilities      | `src/utils/`                  |

## CONVENTIONS

- **React 18**: Function components with hooks
- **TypeScript strict**: All workspaces use `strict: true`
- **Zustand**: State management only — no Redux
- **Tailwind CSS**: Styling via utility classes
- **Touch-first**: 44px minimum touch targets, iOS safe areas
- **Workspace imports**: Use `@virtual-cdu/shared` for shared package
- **No barrel exports**: Import from specific files, not `index.ts`
- **File organization**: Group by feature (CDU, ND, instruments, etc.)

## ANTI-PATTERNS

- **No router**: Single-page app — no React Router
- **No authentication**: Standalone/offline mode only
- **No direct DOM manipulation**: Prefer React refs and state
- **No hardcoded WebSocket URLs**: Use environment variables via hooks
- **No excessive re-renders**: Use `useMemo`/`useCallback` in hooks
- **Missing TypeScript types**: All components and hooks must be fully typed
