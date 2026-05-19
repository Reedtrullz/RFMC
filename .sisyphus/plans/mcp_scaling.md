# Work Plan: Cockpit MCP Layout and Scale Optimization

## 1. Executive Summary

This plan outlines the sizing adjustments to make the Autopilot Mode Control Panel (MCP) larger and stretch across the entire available screen width of the cockpit, eliminating empty left/right margins and matching high-fidelity desktop presentations.

## 2. Core Decisions & Rationale

- **Responsive Header Headroom**: Update row heights of presets containing the MCP in `src/styles/cockpit-layout.css` to use CSS `clamp()`. This gives the MCP sufficient vertical breathing space to scale up dynamically on wide monitors while protecting compact laptop/tablet views:
  - Automation mode: `grid-template-rows: clamp(140px, 18vh, 240px) 1fr;`
  - Approach mode: `grid-template-rows: clamp(130px, 16vh, 230px) 1fr;`
  - Full deck mode: `grid-template-rows: clamp(130px, 16vh, 220px) 1fr 340px;`
- **Stretch Container boundaries**: Increase or remove `max-width` properties on the primary stage container elements containing the MCP in `cockpit-layout.css` (e.g. from `1600px` to `100%` or `100vw` with appropriate constraints) so that layout expands fully on wide viewports.
- **Preserve Aspect Ratio**: Avoid changing `idealWidth` / `idealHeight` inside `instrumentDimensions.ts`, allowing the dynamic, aspect-ratio-preserving `InstrumentFit` component to handle the scaling cleanly.

## 3. Scope Boundaries

### In Scope

- Adjusting CSS Grid template structures in `src/styles/cockpit-layout.css`.
- Updating visual snapshots for Cockpit views to verify that the larger MCP matches perfectly.

### Out of Scope

- Redesigning internal MCP knob or display positions.

## 4. Implementation Steps

The layout optimization will be carried out across these specific steps:

### [x] Step 1: Update Grid Preset Row Heights and Stage Max-Width

- [x] Edit `src/styles/cockpit-layout.css`.
- [x] Update `.cockpit-stage--automation`:
  - [x] Change `grid-template-rows: 160px 1fr;` to `grid-template-rows: clamp(140px, 18vh, 240px) 1fr;`.
  - [x] Change `max-width: 1600px;` to `max-width: 100%;`.
- [x] Update `.cockpit-stage--approach`:
  - [x] Change `grid-template-rows: 140px 1fr;` to `grid-template-rows: clamp(130px, 16vh, 230px) 1fr;`.
  - [x] Change `max-width: 1600px;` to `max-width: 100%;`.
- [x] Update `.cockpit-stage--full-deck`:
  - [x] Change `grid-template-rows: 140px 1fr 340px;` to `grid-template-rows: clamp(130px, 16vh, 220px) 1fr 340px;`.
  - [x] Change `max-width: 1600px;` to `max-width: 100%;`.

### [x] Step 2: Refine Interactive Fitting behavior (if needed)

- [x] Verify `InstrumentFit.tsx` dynamically monitors the bounds and scales correctly based on the new grid template sizes.

## 5. Final Verification Wave

- [x] **Visual Baseline Checks**: Run `playwright` visual checks and update visual snapshots for `highres-boeing-automation`, `highres-boeing-approach`, and `highres-boeing-full-deck` in the `e2e` workspace.
- [x] **Type Checking**: Verify that `npm run typecheck:all` compiles cleanly.
- [x] **Functional Check**: Ensure dials, displays, and annunciators remain perfectly interactive on the scaled-up MCP.
