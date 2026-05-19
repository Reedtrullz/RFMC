# Navigation Display Bezel Interactions E2E Testing Decisions

## 1. Test-ids for Interactive Elements

- **Decision**: Added unique `data-testid` attributes to individual overlay buttons (`nd-overlay-btn-${key}`), the center button (`nd-center-btn`), and the range knob (`nd-range-knob`, `nd-range-knob-pointer`).
- **Rationale**: Elevates test reliability and decouples selection logic from CSS class naming structures or inner HTML text content.

## 2. Browser-evaluated State Verification

- **Decision**: Verified overlay activation, center state, and current range by reading directly from `window.useFMCStore.getState()` inside `page.evaluate()`.
- **Rationale**: Bypasses any visual delay or UI rendering updates to assert the true underlying state engine updates instantaneously and correctly upon physical bezel interaction.

## 3. Zustand Store Subscription Separation

- **Decision**: Replaced full-store hook calls (`const state = useFMCStore()`) in `BoeingNDFrame.tsx` and combined multi-state subscriptions in `NavigationDisplay.tsx` with narrow individual selectors.
- **Rationale**: Mitigates severe render-loops and keeps DOM structures light and fast, resolving critical performance overheads during rapid scratchpad entries.

## 4. Single-Binding Persistent Event Listeners

- **Decision**: Employed React `useRef` to store changing state values bound to non-passive wheel events, enabling single-time event registration on component mount.
- **Rationale**: Solves browser event handler thrashing, eliminates listener-attachment memory leaks, and delivers smoother wheel scroll response in desktop modes.
