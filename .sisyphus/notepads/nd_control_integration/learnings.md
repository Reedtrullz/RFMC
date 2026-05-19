# Navigation Display Bezel Interactions E2E Testing Learnings

## Interception & Force Clicks

- In complex layouts where instruments stack or scale, Playwright's default hit-testing click might be intercepted by another layout slot (e.g. `pfd-panel` intercepting `nd-panel`'s buttons).
- **Hiding overlays/siblings**: Programmatically hiding overlapping panels (e.g., setting `display: none` on `pfd-panel`) during interaction tests prevents collision.
- **Page Evaluate Clicks**: Utilizing `page.evaluate()` to call `.click()` on the HTML DOM element directly serves as an exceptionally robust bypass for browser scaling and position offset issues in emulation.

## Event Dispatching

- Simulated physical scroll behavior (wheel events) can be perfectly emulated using `page.dispatchEvent('wheel', { deltaY: ... })` to verify state updates without actual mouse hardware simulation.
- Context menu suppression verification can be successfully achieved by dispatching `contextmenu` events in browser context and checking if `event.defaultPrevented` resolves to `true`.

## Performance Auditing & Optimization

- **Narrow Zustand Selectors**: Using individual state-slices or narrow selectors rather than the whole store object prevents massive amounts of unnecessary re-renders. Previously, subscribing to the entire store caused re-renders on every scratchpad keystroke.
- **Ref Event Listener Management**: Creating standard refs for mutable state (like `currentRangeRef`) used in persistent DOM event listeners (such as `{ passive: false }` wheel listeners) allows us to register the event listener exactly once on mount, rather than repeatedly teardown and setup on every value change.
- **Dynamic Prop Isolation**: Separating different instances of identical components (like Left and Right displays) using dynamically evaluated state selectors (e.g., `side === 'L' ? s.efisL : s.efisR`) ensures that interactions on the FO's side will never cause the Captain's side to re-render.
