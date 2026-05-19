# Performance Targets & Instrumentation

To ensure the "flight deck feel," the application must maintain strict performance targets, especially on mobile/tablet hardware.

## Target Metrics

| Metric              | Target   | Hardware            |
| ------------------- | -------- | ------------------- |
| Frame Rate (FPS)    | 55 - 60  | iPad (A12+ Chip)    |
| Interaction Latency | < 50ms   | Standalone Mode     |
| Interaction Latency | < 120ms  | Sync Mode (Network) |
| Layout Stability    | 0 shifts | All Pages           |
| Launch Time         | < 2s     | PWA (Cold Start)    |

## Instrumentation

### FPS Monitor

Enabled via `PerformanceOverlay` in DEV mode or when Cockpit Mode is active. Uses `requestAnimationFrame` to track frame timing accurately.

### Interaction Latency

Tracks time from `pointerdown` on a CDU key to the completion of the `useFMCStore` state update and re-render.

## Optimization Strategies

### 1. Layers & Compositing

Instruments (ND, PFD) use CSS `will-change: transform` to ensure they are handled by the GPU.

### 2. Memoization

Large components (like the ND SVG) are memoized to prevent expensive re-renders when the scratchpad changes.

### 3. State Batching

FMC state updates are batched to ensure only one render cycle occurs per interaction.

### 4. Asset Preloading

Fonts (`B612 Mono`) and common SVG assets are preloaded via the PWA service worker to ensure zero-latency retrieval.
