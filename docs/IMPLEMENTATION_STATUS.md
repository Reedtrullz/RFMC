# VirtualCDU Implementation Status

## Visual Realism Pass (Completed May 2026)

**Major deliverable:** Hardware Realism Controls + Phase 2 dynamic effects

- Always-visible `HardwareRealismControls` component with CRT / WEAR / BLOOM / SCAN sliders
- Granular renderer support for bloom and independent scanlines
- Dynamic micro-scratches, light reflection, and contrast driven by wear intensity
- Advanced bezel materials (brushed metal, multi-layer lighting)
- Full parity on both Boeing 737 CDU and Airbus A320 MCDU
- Visual regression masking strategy implemented
- Unit tests added for the extended display settings store

This work significantly increases the “used cockpit hardware” feel while keeping everything fully controllable and performant.

---

## Current Verification Source

Current automated baseline, build/audit state, latest reviewed commit, and validation caveats are tracked in `docs/STATUS.md`. This file records implementation history and capability state only.

## Current Continuation Focus

The dispatcher/store cleanup and visible-polish cockpit slice are complete enough for the next milestone. The desktop Chromium broad visual gate has been repaired, 3456x2234 plus Retina-equivalent cockpit baselines now protect the large-desktop target, and a visual-fidelity manifest gate now separates snapshot protection from unproven hardware accuracy. The active public-demo track is now measured visual fidelity, workflow completion, state-aware training, and release hardening:

- Rights-cleared reference intake and measured geometry/color comparisons.
- Expand state-driven cockpit guidance into lesson packs, scoring, debrief, and highlighted expected controls.
- Boeing preflight workflow completion and Airbus workflow parity.
- Richer deterministic navdata, integration of the shared LNAV/VNAV/performance models, CONTROL-mode parity, PWA/iPad hardening, accessibility, and public-demo documentation.

## Public Documentation And Wiki Source Sync

- Refreshed the README around the current product shape: Boeing-first RFMC/VirtualCDU with scoped Airbus support, cockpit instruments, offline PWA use, CONTROL-mode foundations, and explicit non-operational limitations.
- Added repo-local wiki source pages under `docs/wiki/` so GitHub Wiki content can be generated or copied from versioned files.
- Reworked `docs/ROADMAP.md` so completed high-resolution, PFD, MCP/FCU, state-aware guidance, shared LNAV/VNAV/performance, and PWA foundation work is treated as baseline rather than future scope.
- Tightened release and limitation docs around status evidence, approved visual references, PMDG/MSFS live validation, and public-demo readiness.
- Extended the visual measurement gate to classify measurement profiles by reference approval state; derived profiles remain internal consistency checks until their sources are approved for pixel measurement.

## Boeing LEGS Staging And Keyboard Accessibility Hardening

- Confirmed Boeing LEGS insert/delete/discontinuity replacement already stage through `pendingFlightPlan` and commit only on EXEC in both frontend standalone mode and backend CONTROL mode.
- Added explicit regressions proving active route waypoints remain unchanged until EXEC for LEGS insert/delete and discontinuity resolution paths.
- Fixed physical keyboard LSK handling: `F1` through `F6` now target left LSK 1-6 instead of the invalid L0-L5 range, and `F7` through `F12` now target right LSK 1-6.
- Kept `Shift+F1` through `Shift+F6` as an alternate right-LSK mapping and updated the keyboard help overlay.
- Added Playwright coverage proving physical function keys can operate left and right LSK actions.
