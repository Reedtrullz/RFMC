# VirtualCDU Roadmap

## Phase 0: Evidence Baseline And Plan Lock

- Reconcile status documents around one current truth.
- Add measurement docs, test matrix, pilot rubric, known limits, and reference manifest.
- Add repeatable 35-screen baseline screenshot capture.
- Record coverage, visual, performance, and external validation gates.

## Phase 1: Boeing Visual Fidelity

- Semantic display colors.
- Fixed 24x14 character grid and font strategy.
- Refined CDU shell, key layout, backlighting, button states, and brightness behavior.
- Visual regression against baselines.

## Phase 2: Boeing Procedural Fidelity

- Better preflight prompts, scratchpad messages, EXEC staging, and dependent-value invalidation.
- Deeper LEGS, HOLD, FIX, CLB, CRZ, DES, PROG, and approach-reference behavior.

## Phase 2.5: Navigation Display Context Visuals

- Standalone ND training display that explains route, mode, range, fix, hold, discontinuity, procedure, and approach context.
- Boeing-style ND first, with scoped Airbus-style presentation from the same derived model.
- Training visualization only; PFD, flight-director, attitude, weather, terrain, TCAS, and live ND mirroring stay out of this phase.

## Phase 3: Airbus Scoped Polish

- Clear functional/display-only/out-of-scope status per page.
- Airbus color semantics and key layout verification.
- Backend/CONTROL-mode parity for supported pages.

## Phase 4: Navdata, ARINC-Lite, And SimBrief

- Expandable navdata schema.
- ARINC-lite procedure legs.
- 20 versioned SimBrief-style fixtures.
- SID/STAR/procedure matching and mismatch warnings.

## Phase 5: MSFS Connected Mode

- Strong connection state machine, heartbeat, queueing, latency, and diagnostics.
- Mock SimConnect CI adapter.
- Live PMDG round-trip validation.

## Phase 6: Training Curriculum

- Basics-to-full-flight tutorial structure.
- SOP cross-checks, PF/PM roles, adaptive hints, scoring, and confidence measurements.

## Phase 7: Testing, CI, And Quality Gates

- Coverage thresholds.
- Visual regression CI.
- CONTROL-mode mock tests.
- Audit policy.

## Phase 8: PWA, Offline, And iPad Cockpit Mode

- Offline app shell/assets/tutorial/navdata.
- Wake lock, orientation, safe areas, update flow, and iPad performance.

## Phase 9: Documentation, Licensing, And Operations

- User and developer docs.
- Licensing review.
- ADRs, changelog, and operational maintenance docs.
