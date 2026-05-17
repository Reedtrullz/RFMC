# VirtualCDU Roadmap

Status source: `docs/STATUS.md`.

This roadmap starts from the current implementation state: dispatcher cleanup, cockpit task modes, ND/PFD/MCP/FCU visual baselines, 3456x2234/Retina visual protection, state-aware cockpit help, PWA foundations, and shared trainer-grade LNAV/VNAV/performance models already exist. Remaining work is about measurement, workflow completeness, parity, and release quality.

## Phase 1: Documentation And Public Surface Sync

- Keep README, scope, roadmap, testing, release, and wiki source pages aligned with current repo truth.
- Keep live counts and command results only in `docs/STATUS.md`.
- Preserve clear labels for implemented, mock-tested, snapshot-protected, measured, pilot-reviewed, and live-verified work.
- Avoid certification, operational-use, pixel-perfect, or live-MSFS claims unless independently proven.

## Phase 2: Measured Visual Fidelity

- Intake rights-cleared hardware references before using any image for pixel measurement.
- Expand `npm run measure:visual` from manifest/snapshot validation into reference-backed geometry/color/font checks when approved references exist.
- Keep unmeasured instruments labeled as snapshot-protected only.
- Use desktop, tablet, 3456x2234, Retina-equivalent, ND, PFD, and focused-panel baselines as regression protection.

## Phase 3: Boeing Workflow Completion

- Stage LEGS insert/delete/discontinuity edits until EXEC.
- Make CLR/DEL cancellation behavior explicit.
- Align route activation, DEP/ARR, LEGS, PERF INIT, THRUST LIM, TAKEOFF REF, EXEC readiness, ND route context, and training guidance.
- Route trainer-grade performance warnings into PERF/TAKEOFF scratchpad and guidance behavior.
- Add frontend/backend parity tests and Playwright workflow coverage.

## Phase 4: Airbus Parity Within Explicit Scope

- Keep every visible Airbus action either functional or intentionally disabled.
- Promote Airbus PROG, FUEL PRED, RAD NAV, PERF APPR, and SEC F-PLN only where shared models and backend behavior support them.
- Preserve Airbus managed/selected terminology and prevent Boeing label leakage.
- Keep `docs/SCOPE.md` and wiki source pages current with functional/display-only/out-of-scope status.

## Phase 5: Navdata, Discontinuities, LNAV, And VNAV

- Expand deterministic ARINC-lite fixtures for priority routes and airport pairs.
- Use typed discontinuity objects consistently across CDU/MCDU, ND, training, LNAV, backend rendering, and tests.
- Feed shared LNAV active-leg truth into ND active segment highlighting, PROG pages, direct-to, and training progress.
- Feed shared VNAV predictions into ND T/D cues, PERF/VNAV messages, and trainer hints.

## Phase 6: Training Curriculum

- Turn state-aware help into lesson packs for Boeing preflight, route verification, automation, approach setup, and Airbus scoped preflight.
- Add expected page/key/LSK/panel highlighting from `buildTrainingProgress()`.
- Add local-only scoring, hint usage, debrief, and confidence/self-rating where useful.
- Keep debrief language scoped to procedure practice, not real-world competency.

## Phase 7: Backend, CONTROL Mode, And MSFS Reliability

- Add same-sequence parity tests for frontend store and backend `FMCEngine`.
- Expand mock WebSocket tests for reconnect, stale heartbeat, duplicate clients, malformed messages, rate limits, display broadcast, and aircraft state updates.
- Keep PMDG live validation separate in `docs/MSFS_LIVE_VALIDATION.md`.
- Keep FBW/Fenix limitations explicit unless real mappings are implemented and tested.

## Phase 8: PWA, iPad, Accessibility, And Release Hardening

- Add offline startup, service-worker update-flow, iPad landscape, and portrait fallback coverage where Playwright can verify it.
- Verify wake lock, safe areas, touch behavior, zoom prevention, cached assets, update prompt, brightness persistence, and high-contrast persistence.
- Complete keyboard operation for CDU/MCDU input and LSK access, including right-side LSKs.
- Improve ARIA labels, focus states, reduced motion, and high-contrast support.
- Finish rollback, deploy-by-SHA, TLS, resource-limit, and public-demo release checklist evidence.
