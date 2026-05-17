# Architecture

RFMC is an npm workspace monorepo:

- `shared/`: FMC state, page renderers, validation, navdata, training selectors, and display models.
- `src/`: React/Vite frontend, Zustand stores, CDU/MCDU, cockpit instruments, PWA shell, and visual routes.
- `server/`: Express/WebSocket bridge, backend FMC engine, and aircraft adapters.
- `e2e/`: Playwright smoke, workflow, layout, visual, and high-resolution baselines.

Standalone/offline mode keeps state in the frontend. CONTROL mode uses the backend FMC engine as the display authority and sends updates through WebSocket.

New CDU/MCDU behavior should preserve frontend standalone and backend CONTROL-mode parity.
