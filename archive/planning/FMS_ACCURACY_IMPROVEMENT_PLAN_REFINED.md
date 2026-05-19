# VirtualCDU Accuracy Improvement Plan

> **Planning baseline:** This remains the detailed accuracy baseline. Day-to-day implementation tracking now lives in `ROADMAP.md`, `METRICS.md`, `TEST_MATRIX.md`, `PILOT_REVIEW_RUBRIC.md`, `KNOWN_LIMITATIONS.md`, and `IMPLEMENTATION_STATUS.md`.

**Project:** VirtualCDU – Boeing 737 NG FMC/CDU Web Trainer
**Version:** 4.0 (Refined)
**Date:** 2026-05-11
**Status:** Authoritative living document

---

## How to Use This Plan

1. **Read Section 1** first — it contains the authoritative real hardware reference.
2. Use the **Current State Assessment** to understand where the project stands today.
3. Follow the **phased roadmap**. Each phase has clear tasks and measurable exit gates.
4. Track progress in `IMPLEMENTATION_STATUS.md` using the metrics defined here.
5. Update this plan after completing each phase or after significant pilot feedback.

This document is designed to be **actionable and trackable**.

---

## 1. Real Hardware Reference – Boeing 737 NG CDU

This is the single source of truth for all visual and behavioral accuracy work.

### Display

- **Size**: 14 rows × 24 characters
- **Technology**: Full-color LCD (NG models)
- **Colors**:
  - **Cyan** — Inactive titles and secondary data
  - **Green** — VOR/navaid and some active data
  - **Magenta** — Active LNAV/VNAV guidance
  - **White** — Normal data
  - **Shaded / inverse white** — Modified data (when EXEC is illuminated)
- Character spacing and weighting are specific to real FMC hardware.

### Function Keys (Exactly 14)

| Row            | Keys                                                     |
| -------------- | -------------------------------------------------------- |
| **Top Row**    | INIT REF • RTE • CLB • CRZ • DES                         |
| **Second Row** | DIR INTC • LEGS • DEP ARR • HOLD • PROG • N1 LIMIT • FIX |
| **Navigation** | PREV PAGE • NEXT PAGE                                    |

**Note:** Some aircraft show `MENU` instead of `DIR INTC` in the second row.

### Other Interface Elements

- 12 Line Select Keys (6 left + 6 right)
- Full alphanumeric keypad + `CLR`, `DEL`, `EXEC`, `/`, `+/-`, `SP`
- Brightness knob (right side)
- Physical key depression, individual backlighting, and precise key spacing

**Airbus A320 MCDU** has a different key layout and color philosophy. It is secondary priority.

---

## 2. Current State Assessment

The scores below are **initial planning estimates**, not measured baselines. Phase 0 must either confirm or replace them with evidence from screenshots, coverage reports, performance measurements, live simulator sessions, and pilot review rubrics.

| Category                     | Current         | Target      | Assessment                                                                                                   |
| ---------------------------- | --------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| Core Logic & Procedures      | 87/100 est.     | 95/100      | Strong foundation; 54 unit tests and 9 E2E tests currently pass                                              |
| **Visual Fidelity (Boeing)** | **62/100 est.** | **90/100**  | **Biggest gap; all 14 function/navigation keys are present, but layout/font/color fidelity is not measured** |
| Visual Fidelity (Airbus)     | 68/100 est.     | 88/100      | Functional; secondary pages include display-only/static behavior                                             |
| Navigation Database Depth    | 48/100 est.     | 80/100      | Mock/limited nav dataset and lightweight route parser                                                        |
| MSFS Integration             | 60/100 est.     | 90/100      | PMDG scaffolded; live round-trip unverified. FBW MCDU display/key I/O is mock-only                           |
| Training System Depth        | 65/100 est.     | 85/100      | Basic tutorials exist                                                                                        |
| **Overall**                  | **72/100 est.** | **90+/100** | Estimate pending Phase 0 measurement                                                                         |

### Confirmed Baseline Facts

- TypeScript: 0 errors across all 3 workspaces.
- Unit tests: 54/54 pass.
- E2E tests: 9/9 pass.
- Build: successful.
- `npm audit`: 2 moderate Vite/esbuild dev-dependency vulnerabilities remain deferred because the available fix requires a breaking forced Vite upgrade.
- Boeing CDU has all 14 function/navigation keys present in the UI; future work is exact physical layout, spacing, labeling, and visual behavior.
- PMDG integration code exists for SimConnect connection, key mapping, aircraft state polling, and CDU display polling, but production keypress → CDU update → display readback still requires Windows + MSFS + PMDG validation.
- FBW A320 adapter has scaffolded aircraft-state polling, but MCDU display readback and key I/O are mock-only unless a real FBW/Fenix integration is explicitly scoped later.

---

## 3. Phased Improvement Roadmap

### Phase 0: Baseline & Setup (3–5 days)

**Objective:** Convert planning estimates into measured baselines and lock the current evidence trail.

**Tasks**

- Record current verification state in `IMPLEMENTATION_STATUS.md`: typecheck, unit tests, E2E tests, build output, and the deferred Vite/esbuild audit exception.
- Capture baseline screenshots for at least 25 major screens across Boeing and Airbus, including IDENT, POS INIT, RTE pages, LEGS, DEP/ARR, PERF INIT, THRUST LIM, TAKEOFF REF, HOLD, FIX, DIR INTC, N1 LIMIT, Airbus INIT/F-PLN/DEP-ARR/PERF, and connection diagnostics.
- Define the reference-image set for Boeing and Airbus visual comparisons, including source, aircraft variant, display type, and acceptable cropping/scale rules.
- Establish measurement methods for character-position variance, color ΔE, pixel-diff tolerances, frame rate, and iPad performance.
- Run coverage reports and record current coverage for `shared/src/fmc/`, frontend store logic, backend `FMCEngine`, and E2E flows.
- Finalize Pilot Review Rubric for visual realism, behavioral accuracy, training value, and iPad usability.

**Exit Gates**

- Current 54 unit / 9 E2E / build / audit state documented.
- Visual baseline complete with repeatable screenshot capture commands.
- Measurement method documented for ΔE and character-position variance; unmeasured scores are not presented as facts.
- Pilot rubric approved and ready for first review.

---

### Phase 1: Visual Fidelity – Boeing 737 NG (Highest Priority – 2–3 weeks)

**Goal:** Make the CDU visually close to real 737 NG hardware.

**Key Tasks**

- Complete full multi-color display semantics (cyan, green, magenta, white, shaded/modified) and verify they match real-reference use cases.
- Verify physical layout, spacing, labels, and behavior for all 14 existing function/navigation keys.
- Accurate FMC-style font + precise character spacing
- Context-sensitive placeholders + blinking cursor
- Realistic button press animations and states
- Basic per-key backlighting simulation
- Real-reference screenshot comparison for the key Boeing pages captured in Phase 0.

**Exit Gates (All must be met)**

**Visual Quality**

- Character positioning variance vs real photos: **≤ 4%**
- Color accuracy: **ΔE ≤ 4**
- All **14 function/navigation keys** verified for layout, label, and behavior
- Pilot visual realism rating: **≥ 4.0/5** (n ≥ 4 pilots)

**Technical Quality**

- No regression in tests or functionality
- Maintain **≥ 55 fps** on iPad (with animations)
- Zero new TypeScript or test failures

**Validation Requirement**

- Structured pilot review session required before proceeding to Phase 2.

---

### Phase 2: Airbus Polish + Interface Consistency (1.5–2 weeks)

**Goal:** Bring Airbus MCDU visuals to comparable quality.

**Key Tasks**

- Correct Airbus color semantics and key labels
- Contextual LSK labeling system
- Consistent button feedback and backlighting across both aircraft

**Exit Gates**

- Airbus color accuracy **ΔE ≤ 5**
- Pilot rating for Airbus visuals **≥ 4.0/5**
- Visual regression passes for both Boeing and Airbus modes
- No performance regression

---

### Phase 3: Navigation Database & Procedure Realism (3–4 weeks)

**Goal:** Enable realistic route and procedure handling.

**Key Tasks**

- Expandable navigation database structure
- Core ARINC 424 leg support
- Enhanced LEGS page (editing, constraints, discontinuities)
- Improved SimBrief import with procedures
- Basic failure annunciations

**Exit Gates**

- Can load and display real-world SimBrief routes with SID/STAR correctly
- LEGS page supports full waypoint editing with proper updates
- Pilot rating on procedure realism **≥ 4.2/5**
- Nav database schema documented

---

### Phase 4: MSFS Integration Hardening (2 weeks)

**Goal:** Make connected mode reliable and useful across aircraft.

**Key Tasks**

- Robust connection handling, diagnostics, and recovery
- Live PMDG validation on Windows + MSFS + PMDG: connect, send keypress, observe CDU state change, read display back into VirtualCDU.
- Decide whether FBW/Fenix support is in scope. If yes, replace mock-only MCDU display/key I/O with real aircraft-specific mappings; if no, keep the UI limitation explicit.
- Expanded aircraft mapping profiles only after PMDG round-trip is validated.
- Real-time performance metrics in UI

**Exit Gates**

- PMDG keypress → CDU update → display readback round trip verified in live simulator sessions.
- Connection success rate **≥ 98%** across the defined live test matrix.
- Average display latency **< 80 ms** during connected sessions.
- Pilot rating for sim training value **≥ 4.3/5**

---

### Phase 5: Training System Depth (Parallel after Phase 2)

**Goal:** Evolve tutorials into structured training.

**Key Tasks**

- Scenario-based tutorials with error detection
- Performance scoring and adaptive guidance
- SOP and crew coordination integration

**Exit Gates**

- Users complete full preflight flow with minimal help
- Average confidence increase **≥ +1.5 points**
- Pilot rating for training effectiveness **≥ 4.3/5**

---

## 4. Success Metrics (End-State Targets)

### Visual Accuracy

| Metric                            | Current Baseline | Target                          | Measurement                                         |
| --------------------------------- | ---------------- | ------------------------------- | --------------------------------------------------- |
| Character positioning variance    | Not yet measured | ≤ 3%                            | Automated image comparison vs Phase 0 reference set |
| Color accuracy (ΔE)               | Not yet measured | ≤ 3                             | Color sampling vs real references                   |
| Function/navigation keys (Boeing) | All 14 present   | All 14 layout/behavior verified | UI + automated verification + pilot review          |
| Frame rate (iPad + animations)    | Not yet measured | ≥ 55 fps                        | Performance profiling                               |
| Pilot visual realism rating       | Not yet measured | ≥ 4.3/5                         | Structured rubric (n ≥ 5)                           |

### Functional & Training Value

| Metric                                       | Target     | Method                                                                  |
| -------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| Standard operations match real FMC           | ≥ 95%      | Test matrix + pilot validation                                          |
| Input validation effectiveness               | ≥ 95%      | Fuzz testing + pilot scenarios                                          |
| Real-world route loading success             | ≥ 90%      | Versioned route/navdata fixture set of at least 20 real SimBrief routes |
| Pilot “useful for procedure training” rating | ≥ 4.5/5    | Rubric                                                                  |
| Average user confidence increase             | ≥ +1.5 pts | Pre/post self-assessment                                                |

### Technical Quality

- 100% TypeScript compliance
- 100% test pass rate (currently 54 unit + 9 E2E)
- ≥ 85% coverage on shared FMC logic
- Visual regression tests on significant changes
- Live MSFS validation matrix for PMDG and any additional explicitly scoped aircraft.

---

## 5. Measurement & Review Process

**Objective Metrics**

- Visual regression testing using Playwright against curated real CDU reference photos and Phase 0 screenshot baselines.
- Built-in performance monitoring.
- Automated test coverage reports.
- Versioned route/navdata fixture runs for SimBrief and procedure-loading behavior.
- Live simulator session logs for PMDG round-trip and any future FBW/Fenix mappings.

**Subjective Metrics**

- Use a structured **Pilot Review Rubric** (visual realism, behavioral accuracy, training value, iPad usability).
- Minimum 3–5 pilots/instructors per major review round.

**Review Cadence**

- After every phase completion
- Monthly quick progress review
- After significant pilot feedback

Maintain a simple progress table in `IMPLEMENTATION_STATUS.md`.

---

## 6. Implementation Guidelines

**Performance**

- All visual work must maintain **≥ 55 fps** on target devices.
- Use efficient React patterns and avoid layout thrashing.

**Scope Control**

- Complete Phase 1 visual work before expanding nav database complexity.
- Start nav database with an expandable structure before full ARINC parsing.
- Treat FBW/Fenix MCDU integration as out of scope until a dedicated mapping plan is approved.

**Risk Mitigation**

- Prototype font and color system early and validate quickly with 1–2 pilots.
- Run visual regression tests in both standalone and connected modes.

---

## 7. Conclusion

VirtualCDU already has a solid functional core and a stronger automated baseline: 54 unit tests, 9 E2E tests, clean TypeScript, and a successful build. The highest-leverage remaining work is **measured visual fidelity** to real 737 NG hardware, followed by nav/procedure realism and live simulator validation.

By following this refined, metrics-driven plan — with Phase 0 focused on evidence and Phase 1 focused on Boeing font, color, spacing, key-layout verification, and real-reference screenshots — the project can achieve a significant leap in realism and training value.

This plan provides clear direction, measurable targets, and a structured path forward.

**Next Step:** Complete Phase 0 baseline activities, then begin Phase 1 visual implementation using Section 1 (Real Hardware Reference) as the target.

---

**Document Control**

- Update after each phase or major feedback round.
- Keep `IMPLEMENTATION_STATUS.md` as the live status tracker.
- Reference real hardware photos and Boeing FCOM for validation.

_End of Refined Accuracy Improvement Plan (v4.0)_
