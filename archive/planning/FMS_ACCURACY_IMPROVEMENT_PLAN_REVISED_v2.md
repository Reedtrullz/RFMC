# VirtualCDU FMS Accuracy Improvement Plan (Revised with Metrics)

> **Superseded:** This metrics revision has been consolidated into `ROADMAP.md`, `METRICS.md`, `TEST_MATRIX.md`, `PILOT_REVIEW_RUBRIC.md`, and `IMPLEMENTATION_STATUS.md`. Keep this file as historical context only.

**Revision Date:** 2026-05-11
**Version:** 2.0 — Metrics-Driven
**Supersedes:** Previous 2026-05-11 revision
**Status:** Living document — update after each phase review

---

## Executive Summary

VirtualCDU now has a solid core (state machine, validation, dual-mode architecture, and test suite). The highest-leverage remaining work is **visual fidelity** and **data/procedure depth**.

This version of the plan is **metrics-driven**:

- Every phase has explicit **exit criteria** tied to measurable targets.
- Success is defined by a combination of objective technical metrics + subjective pilot/instructor validation.
- Progress will be tracked publicly in `IMPLEMENTATION_STATUS.md` and reviewed after each phase.

**Goal by end of 2026:** A web-based FMC/CDU trainer that pilots rate ≥4.5/5 for both **procedural training value** and **visual/behavioral realism** for line operations and standard flows.

---

## 1. Current Baseline Assessment (2026-05-11)

| Category                    | Current Score | Target (End of Plan) | Notes                                      |
| --------------------------- | ------------- | -------------------- | ------------------------------------------ |
| Core FMC Logic & Procedures | 87/100        | 95/100               | Strong after Oracle Round 29               |
| Visual Fidelity (Boeing)    | 62/100        | 90/100               | Biggest gap                                |
| Visual Fidelity (Airbus)    | 68/100        | 88/100               | Functional but less polished               |
| Navigation Database Depth   | 48/100        | 80/100               | Hardcoded; needs expansion                 |
| MSFS Integration Robustness | 74/100        | 90/100               | PMDG good; breadth & error handling needed |
| Training System Depth       | 65/100        | 85/100               | Basic tutorials exist                      |
| **Overall Trainer Quality** | **72/100**    | **90+/100**          | —                                          |

**Measurement method for scores:** Combination of automated checks + structured pilot review rubric (see section 4).

---

## 2. Phase-by-Phase Roadmap with Exit Criteria & Metrics

### Phase 0: Stabilize & Establish Baseline (3–5 days)

**Goal:** Lock in current quality and create measurement baselines.

**Key Tasks**

- Capture visual regression baseline screenshots for all major pages (Boeing + Airbus).
- Run full test suite and record coverage.
- Update `IMPLEMENTATION_STATUS.md` with current state.
- Finalize pilot review rubric.

**Exit Criteria / Metrics**

- [ ] 100% of existing E2E tests passing
- [ ] Vitest coverage on `shared/src/fmc/` ≥ 75%
- [ ] Visual regression baseline captured (≥ 25 key screens)
- [ ] Pilot review rubric v1.0 approved (internal)

**Owner:** You
**Review Date:** Within 5 days of starting

---

### Phase 1: Visual Fidelity — Boeing CDU (2–3 weeks) — **Highest Priority**

**Goal:** Make the display and physical interface look and feel dramatically closer to real 737 NG hardware.

**Key Tasks**

- Multi-color LCD engine (cyan, green, magenta, white, shaded/modified)
- Add missing 7 function keys with correct behavior
- FMC-specific font + precise character spacing/cell rendering
- Context-sensitive placeholders + blinking cursor
- Realistic button press animation + visual states
- Basic backlighting simulation

**Exit Criteria / Success Gates (Must pass all)**

- **Visual Metrics**
  - Side-by-side comparison with real 737 NG CDU reference photos: character positioning variance ≤ 4%
  - Primary colors match within ΔE ≤ 4 (CIELAB) on calibrated display
  - Pilot rating (n=3–5): “Visual realism for procedure training” ≥ 4.0/5
- **Functional Metrics**
  - All 14 function keys present and functional
  - 100% of existing page navigation + data entry tests still pass
- **Technical Metrics**
  - Maintain ≥ 55 fps on iPad (including animations)
  - No new TypeScript errors or test regressions

**Pilot Validation Gate:** Structured 30-min session with 3 pilots → average score ≥ 4.0/5 on visual realism rubric.

**If gate not passed:** Iterate on font/color/animation before moving to Phase 2.

---

### Phase 2: Visual Fidelity — Airbus + Interface Polish (1.5–2 weeks)

**Goal:** Bring Airbus MCDU visuals and interaction quality in line with Boeing improvements.

**Key Tasks**

- Airbus color semantics (white/blue/green/amber/magenta)
- Correct function key labels and layout
- Contextual LSK labeling system
- Per-key backlighting + day/night dimming
- Refined key spacing, shadows, and press feedback

**Exit Criteria / Success Gates**

- **Visual Metrics**
  - Airbus color accuracy ΔE ≤ 5 on reference images
  - Pilot rating (n=3): “Airbus MCDU looks and feels appropriate” ≥ 4.0/5
- **Consistency Metrics**
  - Visual regression tests pass for both Boeing and Airbus modes (≤ 2% pixel difference tolerance on key screens)
- **Technical Metrics**
  - No regression in Boeing pages
  - Animation performance remains ≥ 55 fps

---

### Phase 3: Data Depth & Procedure Realism (3–4 weeks)

**Goal:** Move from hardcoded/limited data to a more realistic and expandable navigation/procedure system.

**Key Tasks**

- Expandable navigation database structure (JSON + import)
- Core ARINC 424 leg/path terminator support
- Enhanced LEGS page (full editing, constraints, discontinuities)
- Improved SimBrief import with procedure loading
- Basic FMC failure annunciations

**Exit Criteria / Success Gates**

- **Functional Metrics**
  - Can load and fly a real-world SimBrief route with at least one SID/STAR/approach correctly (validated against real FMC behavior)
  - LEGS page supports insert/delete/modify waypoint + altitude/speed constraints with correct page updates
  - 95%+ of route-related unit tests pass
- **Pilot Validation**
  - Average pilot rating on “Procedure realism for line training” ≥ 4.2/5
- **Technical Metrics**
  - Nav database schema documented and versioned
  - No breakage in standalone or connected modes

---

### Phase 4: MSFS Integration Hardening (2 weeks)

**Goal:** Make connected mode reliable and useful across popular aircraft.

**Key Tasks**

- Robust connection handling (timeout, retry, heartbeat, queuing)
- Detailed diagnostics + performance metrics in UI
- Expanded aircraft mapping profiles (PMDG, FBW A32NX, Fenix, etc.)
- Improved error reporting and recovery

**Exit Criteria / Success Gates**

- **Robustness Metrics**
  - Connection success rate ≥ 98% in 50 test sessions across aircraft
  - Average latency < 80 ms for CDU display updates
  - Zero desyncs or crashes in 30-minute connected sessions (n=10)
- **Pilot / User Metrics**
  - Instructors rate “usefulness for sim training” ≥ 4.3/5
- **Technical Metrics**
  - Diagnostic panel shows real-time latency, update rate, and error counts

---

### Phase 5: Training System Maturity (Ongoing — start parallel after Phase 2)

**Goal:** Turn good tutorials into a structured training system.

**Key Tasks**

- Scenario-based tutorials with branching and error detection
- Performance scoring + time tracking
- SOP integration and crew coordination notes
- Adaptive hints based on user proficiency

**Exit Criteria / Success Gates**

- **Training Effectiveness Metrics**
  - Users complete full preflight flow tutorial with < 2 external references needed (measured via telemetry or observation)
  - Average post-training self-reported confidence increase ≥ +1.5 points (scale 1–5)
  - Pilot rating: “Effective for building procedural muscle memory” ≥ 4.3/5
- **Technical Metrics**
  - Tutorial system has ≥ 80% unit test coverage on branching logic

---

## 3. Overall Success Metrics (End-of-Plan Targets)

### Visual Accuracy (Objective)

| Metric                               | Baseline (Now) | Target   | Measurement Method                        |
| ------------------------------------ | -------------- | -------- | ----------------------------------------- |
| Character positioning variance       | ~12%           | ≤ 3%     | Automated image comparison vs real photos |
| Color accuracy (ΔE CIELAB)           | ~8–12          | ≤ 3      | Color sampling from reference images      |
| Function key count (Boeing)          | 7              | 14       | Manual + automated UI test                |
| Frame rate on iPad (with animations) | ~45–55 fps     | ≥ 55 fps | Performance profiling                     |

### Functional & Procedural Accuracy

| Metric                                      | Baseline | Target | Method                               |
| ------------------------------------------- | -------- | ------ | ------------------------------------ |
| Standard line operations match real FMC     | ~80%     | ≥ 95%  | Pilot + automated test matrix        |
| Input validation error catch rate           | ~85%     | ≥ 95%  | Fuzz testing + pilot error scenarios |
| Real-world SimBrief route load success      | Limited  | ≥ 90%  | Test set of 20 real routes           |
| Page navigation timing match (within 100ms) | Partial  | Yes    | Timestamped E2E tests                |

### Training Effectiveness (Subjective + Objective)

| Metric                                         | Target         | Method                         |
| ---------------------------------------------- | -------------- | ------------------------------ |
| Pilot rating – “Useful for procedure training” | ≥ 4.5 / 5      | Structured rubric (n≥5 pilots) |
| Pilot rating – “Visual realism sufficient”     | ≥ 4.3 / 5      | Same rubric                    |
| Instructor rating – “Recommend for students”   | ≥ 4.5 / 5      | Survey                         |
| Average confidence increase after tutorial     | ≥ +1.5 points  | Pre/post self-assessment       |
| Tutorial completion without external help      | ≥ 80% of users | Observation or telemetry       |

### Technical Quality

| Metric                            | Current | Target     | Method                  |
| --------------------------------- | ------- | ---------- | ----------------------- |
| TypeScript strict errors          | 0       | 0          | `typecheck:all`         |
| Unit test pass rate               | 100%    | 100%       | Vitest                  |
| E2E test pass rate                | 100%    | 100%       | Playwright              |
| Visual regression failures on PRs | N/A     | 0 critical | Playwright + image diff |
| Test coverage (`shared/src/fmc/`) | ~65%    | ≥ 85%      | Vitest coverage-v8      |

### MSFS Integration

| Metric                         | Target           | Method                      |
| ------------------------------ | ---------------- | --------------------------- |
| Connection success rate        | ≥ 98%            | Automated + manual sessions |
| Average display update latency | < 80 ms          | Built-in diagnostics        |
| Supported aircraft profiles    | ≥ 4 major addons | Test matrix                 |

---

## 4. Measurement & Review Process

**Objective Metrics (Automated where possible)**

- Visual regression: Playwright + pixelmatch / resemble.js on every PR for key pages.
- Performance: Built-in FPS counter + Chrome DevTools / Safari profiling.
- Functional: Expanded Vitest + Playwright test matrix.
- Color accuracy: Scripted sampling against reference images.

**Subjective Metrics (Pilot Validation)**

- Create a simple **Pilot Review Rubric** (Google Form or Markdown) covering:
  - Visual realism
  - Behavioral accuracy
  - Training usefulness
  - Ease of use / iPad experience
- Run structured sessions after Phase 1 and Phase 3 (minimum 3–5 pilots/instructors each time).
- Record anonymized scores + qualitative feedback.

**Review Cadence**

- End of every phase: Full metrics review + update this plan + `IMPLEMENTATION_STATUS.md`.
- Monthly: Quick dashboard update (even if no phase complete).
- After major pilot feedback round: Adjust roadmap if needed.

**Tracking Table (add to `IMPLEMENTATION_STATUS.md` or a new `METRICS.md`)**

Example row:
| Date | Phase | Visual Score (Boeing) | Pilot Rating (n=) | Functional Match % | Test Coverage | Notes |
|------------|-------|-----------------------|-------------------|--------------------|---------------|-------|
| 2026-05-11 | 0 | 62 | — | 87 | 68% | Baseline |
| 2026-06-01 | 1 end | 85 | 4.2 (n=4) | 94 | 79% | Gate passed |

---

## 5. Implementation Notes & Risks (Updated)

**Performance Guardrails**

- All visual work must keep ≥ 55 fps on target devices (desktop + iPad).
- Use React.memo, proper keys, and avoid unnecessary re-renders during display updates.

**Scope Discipline**

- Do **not** start full VNAV prediction or advanced performance calculations until Phase 3 exit criteria are met.
- Nav database work: Start simple (expandable JSON) before building full ARINC parser.

**Risk Mitigation**

- Visual work: Prototype font + color system early and validate with 1–2 pilots before full implementation.
- Nav DB complexity: Limit initial scope to 3–4 real procedures + basic leg types.
- Maintaining dual-mode parity: Add visual regression tests that run in both standalone and connected modes.

---

## 6. Conclusion

This metrics-driven revision turns the improvement plan into a **clear, trackable contract** for quality.

By the end of the plan:

- Visuals will have moved from the weakest area to a genuine strength.
- The app will have measurable, pilot-validated evidence that it is an effective and realistic training tool.
- Progress will be transparent and data-driven.

The foundation is already excellent. With disciplined execution against these metrics, VirtualCDU can become one of the best freely accessible FMC/CDU training platforms available.

**Next immediate action:** Complete Phase 0 baseline capture, then begin Phase 1 visual work with the defined exit gates in mind.

---

**Document Control**

- Update this file after every phase review.
- Keep `IMPLEMENTATION_STATUS.md` as the source of truth for “what is done right now”.
- Link pilot feedback and metric results back into this plan.

_End of Revised Plan v2.0_
