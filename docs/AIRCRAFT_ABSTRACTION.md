# Aircraft Abstraction

**Last updated:** 2026-05-16

This document explains the aircraft-family abstraction that separates Boeing 737 and Airbus A320 behavior, visuals, and terminology in VirtualCDU.

## Why Separate?

A generic "FMC" that switches between Boeing and Airbus labels would be educationally misleading and visually unconvincing. Boeing and Airbus avionics differ in:

- **Terminology**: CDU vs MCDU, FMC vs FMGC, EXEC vs INSERT, LNAV/VNAV vs MANAGED
- **Workflows**: Boeing preflight (IDENT → POS INIT → RTE → PERF INIT → N1 LIMIT → TAKEOFF REF) differs from Airbus (INIT A → F-PLN → INIT B → PERF TAKEOFF)
- **Page layouts**: Different row structures, field placements, label conventions
- **Validation rules**: Aircraft-specific weight envelopes, thrust modes, CG ranges
- **Color schemes**: Boeing green-on-black CRT vs Airbus amber LCD
- **Hardware proportions**: Different bezel radii, screen sizes, keypad layouts

## What Is Shared

Only low-level rendering and hardware primitives are shared:

| Primitive          | Purpose                           | Used By                             |
| ------------------ | --------------------------------- | ----------------------------------- |
| `CDUDisplayGrid`   | 24×14 CSS grid renderer           | Both Boeing and Airbus display bays |
| `InstrumentShell`  | Bezel, screws, edge highlighting  | Boeing CDU and Airbus MCDU shells   |
| `ScreenGlass`      | CRT/LCD effects (scanlines, glow) | Both display bays                   |
| `AvionicsKey`      | Raised keycap with bevel/press    | Both keypads                        |
| `AnnunciatorLight` | FAIL/MSG/OFST indicators          | Both annunciator panels             |
| `GeometryProfiles` | Instrument dimension profiles     | All instrument shells               |
| `EffectProfiles`   | Screen effect intensity profiles  | All display glasses                 |

## What Is Separate

### Component Trees

```
Chassis (shell)
├── Boeing 737 CDU                Airbus A320 MCDU
│   ├── BoeingCDUShell             AirbusMCDUShell
│   │   ├── AnnunciatorLight       AnnunciatorLight
│   │   └── BoeingDisplayBay       AirbusDisplayBay
│   │       ├── ScreenGlass        ScreenGlass
│   │       │   └── CDUDisplayGrid CDUDisplayGrid
│   │       ├── BoeingLSKColumn    AirbusLSKColumn
│   │       └── Scratchpad         Scratchpad
│   ├── BoeingFunctionKeyPanel     AirbusFunctionKeyPanel
│   └── BoeingAlphaNumericKeypad   AirbusKeypad
```

### Page Functions

| Boeing Page | File                        | Airbus Page  | File                         |
| ----------- | --------------------------- | ------------ | ---------------------------- |
| IDENT       | `boeing/ident.grid.ts`      | INIT A       | `airbus/initA.grid.ts`       |
| POS INIT    | `boeing/posInit.grid.ts`    | INIT B       | `airbus/initB.grid.ts`       |
| RTE         | `boeing/route.grid.ts`      | F-PLN        | `airbus/fpln.grid.ts`        |
| DEP/ARR     | `route.ts`                  | DEP/ARR A    | `airbus/depArr.grid.ts`      |
| PERF INIT   | `setup.ts`                  | PERF TAKEOFF | `airbus/perfTakeoff.grid.ts` |
| N1 LIMIT    | `n1limit.ts`                | PERF APPR    | `airbus/perfAppr.grid.ts`    |
| TAKEOFF REF | `boeing/takeoffRef.grid.ts` | FUEL PRED    | `airbus/fuelPred.grid.ts`    |
| LEGS        | `boeing/legs.grid.ts`       | PROG         | `airbus/prog.grid.ts`        |
| PROGRESS    | `boeing/progress.grid.ts`   | RAD NAV      | `airbus/radNav.grid.ts`      |
| HOLD        | `navigation.ts`             | SEC F-PLN    | `airbus/secFpln.grid.ts`     |
| FIX         | `navigation.ts`             | DATA INDEX   | `airbus/dataIndex.grid.ts`   |
| MENU        | `setup.ts`                  | MCDU MENU    | `airbus/mcduMenu.grid.ts`    |

### Token System

Each aircraft family has a dedicated token file defining physical measurements:

| Token Category    | Boeing                            | Airbus                                   |
| ----------------- | --------------------------------- | ---------------------------------------- |
| Shell dimensions  | 146×228mm, radius 6mm, bezel 12mm | 146×228mm, radius 4mm, bezel 10mm        |
| Screen dimensions | 102×78mm (14×24 grid)             | 116×86mm (14×24 grid, 25.4% larger area) |
| Screen recess     | 8mm depth                         | 4mm depth                                |
| Keypad            | 5×7 grid, 12mm keys               | 6×6 grid, 11mm keys                      |
| LSK spacing       | 12.5mm                            | Varies per layout                        |
| Annunciators      | 18×8mm                            | 15×6mm                                   |

Token files are at:

- `src/components/instruments/common/tokens/boeing-cdu.tokens.ts`
- `src/components/instruments/common/tokens/airbus-mcdu.tokens.ts`

### Validation Rules

| Rule          | Boeing              | Airbus                 |
| ------------- | ------------------- | ---------------------- |
| V-speeds      | V1 ≤ VR ≤ V2        | Same                   |
| QNH range     | 900-1100 hPa        | 900-1100 hPa           |
| Cost index    | 0-999               | 0-999                  |
| ZFW range     | Boeing envelope     | Airbus envelope        |
| Assumed temp  | Boeing derate range | Airbus flex temp range |
| Flight number | Alphanumeric        | Alphanumeric           |

### Scratchpad Behavior

| Behavior            | Boeing                            | Airbus                                 |
| ------------------- | --------------------------------- | -------------------------------------- |
| Message colors      | Amber error, green info           | Amber everything                       |
| EXEC semantics      | EXEC key confirms pending changes | INSERT key confirms individual changes |
| Message persistence | Safety messages persist on input  | Same priority model                    |

## How to Add a New Aircraft Family

1. Create token file: `src/components/instruments/common/tokens/new-aircraft.tokens.ts`
2. Create shell component: `src/components/CDU/newAircraft/NewAircraftCDU.tsx`
3. Create page functions: `shared/src/fmc/pages/newAircraft/*.grid.ts`
4. Register pages: `shared/src/fmc/pages/newAircraft/index.ts`
5. Add to aircraft selection: `src/store/aircraftStore.ts`
6. Add Playwright visual baselines for all key pages
7. Add training scenarios specific to the new family
