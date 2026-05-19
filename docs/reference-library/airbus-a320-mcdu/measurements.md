# Airbus A320 MCDU — Physical Measurements

> **Source of truth:** `src/components/instruments/common/tokens/airbus-mcdu.tokens.ts`
> **Last updated:** 2026-05-16

## Overview

All measurements are in millimeters (mm). These values are the token-defined targets for visual fidelity against the real Airbus A320 MCDU (Multipurpose Control and Display Unit) hardware. Aspect ratios and derived values are computed from the source tokens.

---

## Shell (Unit Enclosure)

| Property         | Value                         |
| ---------------- | ----------------------------- |
| Width            | 146 mm                        |
| Height           | 228 mm                        |
| Corner radius    | 4 mm                          |
| Bezel thickness  | 10 mm                         |
| **Aspect ratio** | **0.640** (146:228 ≈ 1:1.562) |

---

## Screen (Display Area)

| Property          | Value                        |
| ----------------- | ---------------------------- |
| Width             | 116 mm                       |
| Height            | 86 mm                        |
| Rows              | 14                           |
| Columns           | 24                           |
| Row height        | 6.1 mm                       |
| Character width   | 4.8 mm                       |
| Scratchpad height | 9 mm                         |
| Recess depth      | 4 mm                         |
| **Aspect ratio**  | **1.349** (116:86 ≈ 1.349:1) |
| **Active area**   | **9,976 mm²**                |

**Notes:**

- Row height × 14 rows = 85.4 mm (≈ 86 mm screen height)
- Char width derived as 116 mm / 24 cols ≈ 4.83 mm (token value: 4.8 mm)
- The MCDU screen is 13.7% larger in area than the Boeing CDU screen (9,976 mm² vs 7,956 mm²)
- Recess is shallower than Boeing (4 mm vs 8 mm) — the MCDU screen sits closer to the bezel face

---

## Keypad

| Property       | Value  |
| -------------- | ------ |
| Key size       | 11 mm  |
| Key spacing    | 15 mm  |
| Rows           | 6      |
| Columns        | 6      |
| **Total keys** | **36** |

**Notes:**

- Airbus MCDU uses a 6×6 grid (36 keys) vs Boeing's 5×7 (35 keys)
- Slightly smaller keys (11 mm vs 12 mm) and tighter spacing (15 mm vs 16 mm)
- The extra row accommodates dedicated function keys (DIR, PROG, PERF, etc.)

---

## LSK (Line Select Keys)

| Property            | Value                  |
| ------------------- | ---------------------- |
| Height              | 9 mm                   |
| Spacing             | 14 mm                  |
| Inset               | 6 mm                   |
| **Total LSKs**      | **12** (6L + 6R)       |
| **LSK bank height** | **~84 mm** (6 × 14 mm) |

**Notes:**

- LSKs are slightly shorter than Boeing (9 mm vs 10 mm)
- Spacing aligns with the taller row height (6.1 mm) — each LSK spans roughly 1.5 rows
- Inset is shallower (6 mm vs 8 mm), matching the closer LCD-to-bezel positioning

---

## Annunciators

| Property            | Value      |
| ------------------- | ---------- |
| Width               | 15 mm      |
| Height              | 6 mm       |
| Spacing             | 3 mm       |
| **Individual area** | **90 mm²** |

**Notes:**

- Airbus annunciators are smaller than Boeing's (15×6 mm vs 18×8 mm)
- Tighter spacing as well (3 mm vs 4 mm)
- Positioned above the screen in a single row

---

## Derived Values

| Metric                        | Value       |
| ----------------------------- | ----------- |
| Screen pixel ratio (px/mm)    | ~0.70 px/mm |
| Screen-to-shell area ratio    | ~30.0%      |
| Keypad-to-shell area ratio    | ~10.1%      |
| Bezel-to-screen ratio         | 10 mm bezel |
| **Screen area vs Boeing CDU** | **+25.4%**  |

---

## Visual Fidelity Targets

1. **Screen proportions:** The 14×24 character grid must fill the full 116 mm × 86 mm screen area exactly, with no unused margins.
2. **Character sizing:** Each monospaced character cell must be exactly 4.8 mm wide × 6.1 mm tall.
3. **Bezel flatness:** The bezel surrounds the screen with exactly 10 mm thickness on all sides.
4. **Key feel:** Keys are 11 mm with 15 mm center-to-center spacing — the 4 mm gap must be even.
5. **Recess depth:** The screen sits 4 mm recessed inside the bezel (shallower than Boeing CDU).
6. **LSK alignment:** LSK labels should align visually with the corresponding screen row. With 14 rows and 6 LSKs, each LSK spans approximately 2.3 rows.
7. **Screen dominance:** The MCDU screen occupies ~30% of the unit face area (vs ~24% for Boeing CDU), giving it a more display-heavy appearance.
