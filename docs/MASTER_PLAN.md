# VirtualCDU Master Plan & Roadmap

This document serves as the consolidated source of truth for the VirtualCDU project goals, technical roadmap, and quality metrics. It synthesizes previous planning documents into a single, metrics-driven execution strategy.

---

## 1. Executive Summary

VirtualCDU aims to be the premier web-based FMC/CDU training platform. We prioritize **visual fidelity**, **procedural accuracy**, and **training effectiveness**.

**Goal by end of 2026:** A simulator that pilots rate ≥4.5/5 for training value and behavioral realism.

## 2. Current Scorecard (Baseline 2026-05-11)

| Category                 | Score  | Target | Status                           |
| ------------------------ | ------ | ------ | -------------------------------- |
| Core FMC Logic           | 87/100 | 95/100 | Solid core logic implemented     |
| Visual Fidelity (Boeing) | 62/100 | 90/100 | **Highest Priority Gap**         |
| Visual Fidelity (Airbus) | 68/100 | 88/100 | Functional but unpolished        |
| Navigation Data Depth    | 48/100 | 80/100 | Needs ARINC-lite expansion       |
| MSFS Integration         | 74/100 | 90/100 | PMDG stable; breadth needed      |
| Training System          | 65/100 | 85/100 | Phase 6 completed; polish needed |

---

## 3. Execution Roadmap

### Phase 0: Evidence Baseline (COMPLETE)

- [x] Captured 35-screen baseline visual regression set.
- [x] Established test matrix and pilot review rubric.
- [x] Documented known limitations and reference manifest.

### Phase 1: Visual Fidelity (IN PROGRESS)

**Goal:** Character positioning variance ≤ 3%, Color accuracy ΔE ≤ 3.

- [x] Integrated **B612 Mono** font for precision.
- [x] Implemented semantic display colors.
- [/] Refine CDU shell, key layout, and backlighting.
- [ ] Implement brightness controls and visual press feedback.
- [ ] **Exit Gate:** Pilot rating ≥ 4.0/5 for visual realism.

### Phase 2: Procedural Fidelity

**Goal:** 95% match with real-world line operations.

- [ ] Implement `DES NOW`, `HOLD` staging, and `DIR INTC` refinements.
- [ ] Add dependent-value invalidation (e.g., runway change clears V-speeds).
- [ ] **Exit Gate:** 100% pass on procedural regression test suite.

### Phase 2.5: Navigation Display (ND) Context

**Goal:** Provide visual spatial context for FMC training.

- [ ] Develop standalone ND training panel.
- [ ] Visualize route, fix, hold, and discontinuity context.
- [ ] No live mirroring (standalone training visualization only).

### Phase 3: Airbus MCDU Polish

**Goal:** Bring Airbus visuals and logic to parity with Boeing.

- [ ] Airbus color semantics and key layout verification.
- [ ] Backend/CONTROL-mode parity for all primary pages.

### Phase 4: Navdata & SimBrief Expansion

**Goal:** Support real-world route loading and ARINC-lite procedures.

- [ ] Implement expandable JSON navdata schema.
- [ ] Add 20+ versioned SimBrief route fixtures for testing.
- [ ] SID/STAR/procedure matching and mismatch warnings.

### Phase 5: MSFS Hardening

**Goal:** 98% connection success rate; < 80ms display update latency.

- [ ] Connection state machine with robust heartbeat.
- [ ] Real-time latency diagnostics in UI.
- [ ] Expand support for FBW A32NX and Fenix.

### Phase 6: Training Curriculum (COMPLETE)

- [x] Basics-to-full-flight tutorial structure.
- [x] Adaptive hinting and proficiency scoring.
- [x] Confidence rating and grade reporting.

---

## 4. Quality Gates & Metrics

### Technical Metrics

- **Performance:** Maintain ≥ 55 fps on target devices (iPad/Desktop).
- **Test Coverage:** Vitest coverage on `shared/src/fmc/` ≥ 85%.
- **Build Quality:** 0 TypeScript errors; zero critical audit vulnerabilities.

### Validation Gates

- **Pilot Review:** Structured 30-min sessions after each major phase.
- **Visual Regression:** Playwright-backed pixel comparison on every PR.
- **E2E Stability:** 100% pass rate on full preflight flow tests.

---

## 5. Maintenance & Operations

- **ADRs:** Stored in `docs/ADRs/` to track architectural decisions.
- **Status:** Weekly updates to `IMPLEMENTATION_STATUS.md`.
- **Audit:** Compliance tracked in `AUDIT_POLICY.md`.
