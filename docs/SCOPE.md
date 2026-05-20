# VirtualCDU Scope

## Product Identity

VirtualCDU is a high-fidelity, web-based Boeing 737 NG CDU trainer with scoped Airbus A320 MCDU support. It is built for realistic procedure practice, guided learning, SimBrief/navdata workflows, iPad/PWA usage, and MSFS connected-mode training.

## v1 Primary Scope

- Boeing 737 NG first.
- Measured visual fidelity for the Boeing CDU.
- Complete trainer-level Boeing preflight, route, performance, LEGS, HOLD, FIX, CLB/CRZ/DES/PROG, and approach-reference workflows.
- Robust input validation and scratchpad behavior.
- Guided tutorials and scoring for major procedure flows.
- Standalone ND training visuals that make FMC settings and route modifications understandable.
- Repeatable visual, unit, E2E, and integration-test baselines.
- PMDG 737 connected-mode validation.
- Offline/iPad cockpit usability.

## v1 Secondary Scope

- Airbus A320 MCDU support with honest page scoping.
- Airbus visual semantics and functional core pages.
- Airbus-style ND context from the shared trainer visualization model.
- Display-only secondary pages where real behavior is not implemented.

### Airbus MCDU Page Status

| Page       | Status       | Interactive Fields                                                              |
| ---------- | ------------ | ------------------------------------------------------------------------------- |
| INIT A     | Functional   | FROM/TO, COST INDEX, CRZ FL, ALT, FLT NBR, → INIT B                             |
| INIT B     | Functional   | ZFW, BLOCK, CG, → INIT A                                                        |
| F-PLN      | Functional   | Waypoint display, → DEP/ARR                                                     |
| DEP/ARR    | Functional   | SID, RWY, STAR, APPR                                                            |
| PERF TO    | Functional   | V1, VR, V2, FLAPS, FLEX, → PERF APPR                                            |
| PERF APPR  | Partial      | QNH, WIND. TEMP/MDA/DH/LDG CONF display-only.                                   |
| FUEL PRED  | Partial      | Displays route/performance-derived trainer values; no direct data-entry fields. |
| SEC F-PLN  | Functional   | Active copy, stage edits, and activation.                                       |
| RAD NAV    | Functional   | VOR1/FREQ, VOR2/FREQ, ADF1/FREQ radio tuning.                                   |
| PROG       | Partial      | Displays route/performance-derived trainer values; no direct data-entry fields. |
| DATA INDEX | Display-only | No interactive fields.                                                          |
| MCDU MENU  | Functional   | Navigation to all page categories.                                              |

## Out Of Scope For v1

- Certified training-device status.
- Real-world operational use.
- Full ARINC 424 global leg/path support.
- Full FBW/Fenix MCDU integration unless separately scoped.
- Proprietary fonts, reference photos, or navdata without licensing clarity.
- Weather radar, terrain, TCAS, certified performance/navigation behavior, and live ND/PFD mirroring unless separately scoped.
