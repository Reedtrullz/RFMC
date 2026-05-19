# VirtualCDU Developer Documentation

## Architecture

VirtualCDU uses a hybrid authoritative state model to support both standalone training and live simulator integration.

### Authoritative States

1.  **Standalone Mode (Frontend-Authoritative)**:
    - The FMC state lives in a **Zustand** store (`src/store/useFMCStore.ts`).
    - Page rendering logic (`shared/src/fmc/pages/`) is executed in the browser.
    - User input is processed locally.
    - Used for offline practice, iPad usage, and web-based tutorials.

2.  **Connected Mode (Backend-Authoritative)**:
    - The FMC state lives in the **Node.js Bridge Server** (`server/src/fmc-engine.ts`).
    - The server computes the `DisplayData` (14x24 grid + colors + flags) and broadcasts it via WebSocket.
    - The frontend acts as a "thin client", relaying keypresses to the server and rendering the received `DisplayData`.
    - Used for MSFS 2020 integration (PMDG 737, etc.).

## Page Rendering System

All CDU pages are defined in `shared/src/fmc/pages/`. A page renderer is a function that takes the current `FMCState` and returns a `DisplayData` object.

### Adding a New Page

1.  **Define the renderer**: Create a new file in `shared/src/fmc/pages/` (e.g., `my-page.ts`).
    ```typescript
    export const getMyPageRenderer = (state: FMCState): DisplayData => {
      return {
        title: { text: 'MY PAGE', color: 'cyan' },
        lines: [
          { left: { text: 'DATA', color: 'white' }, right: { text: 'VALUE', color: 'green' } },
          // ...
        ],
        lskActions: {
          L1: 'my_action',
        },
      };
    };
    ```
2.  **Register the renderer**: Add it to `shared/src/fmc/pages/index.ts`.
3.  **Handle actions**: Add the corresponding action handler in `src/store/useFMCStore.ts` (for standalone) and `server/src/fmc-engine.ts` (for CONTROL mode).

## MSFS Integration (Adapters)

Adapters implement the `IAircraftAdapter` interface.

- **PMDG737Adapter**: Uses `node-simconnect` to communicate with MSFS via named pipes. It maps specific PMDG CDU variables to the VirtualCDU display.
- **MockAdapter**: Used for CI and development. It simulates aircraft data (altitude, speed) without requiring a running simulator.

To add a new aircraft:

1.  Create a new adapter in `server/src/aircraft-adapters/`.
2.  Register it in the `AircraftAdapterFactory`.

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm run test
```

Tests are located alongside the source files (e.g., `useFMCStore.test.ts`).

### E2E and Visual Regression

Run Playwright tests:

```bash
npx playwright test
```

To update visual baselines:

```bash
npm run capture:baseline
```

## UI Semantic Hooks

Rows in the CDU display use `data-semantic` attributes (e.g., `data-semantic="header"`, `data-semantic="lsk-label"`). This allows automated tools to verify the "measured fidelity" of the display without relying on fragile CSS selectors.
