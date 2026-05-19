# learnings

## Presets Updated

- Updated `.cockpit-stage--automation`, `.cockpit-stage--approach`, and `.cockpit-stage--full-deck` in `src/styles/cockpit-layout.css`.
- Changed grid-template-rows heights using `clamp` to dynamically adapt the MCP size.
- Modified `max-width` to `100%` allowing the Autopilot Mode Control Panel (MCP) to scale and stretch across the full available screen width.
- Successfully ran the production build `npm run build` to verify there are no compilation or styling bundler issues.

## QA Hands-On Execution Results

- Executed visual and layout tests on `desktop-chromium` to assert the updated layout structures.
- Verified that the MCP spans the full grid width dynamically and aligns flawlessly with the outer edges of the PFD and ND displays below it.
  - In `automation` and `approach` modes (1440x900 resolution), the MCP and display-pair both scale to exactly `1140.8px` width.
  - In `full-deck` mode, the MCP, display-pair, and CDU all scale to exactly `1340.8px` width.
- Confirmed that vertical layouts are cleanly proportioned with positive gaps (e.g. `25.9px`), ensuring zero visual overlap or clipping.
- Fixed the strict mode violation in the autopilot tests (`e2e/cockpit-hardening.spec.ts`) and adjusted the height assertion threshold in the visual layout tests (`e2e/visual-layouts.spec.ts`) to match the dynamic layout clamps.
- All E2E layout and hardening test suites now pass successfully.
