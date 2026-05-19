# Boeing 737 CDU — Physical Measurements

> **Source of truth:** `src/components/instruments/common/tokens/boeing-cdu.tokens.ts`
> **Last updated:** 2026-05-16

## Overview

All measurements are in millimeters (mm). These values are the token-defined targets for visual fidelity against the real Boeing 737 CDU (Control Display Unit) hardware. Aspect ratios and derived values are computed from the source tokens.

---

## Shell (Unit Enclosure)

| Property         | Value                         |
| ---------------- | ----------------------------- |
| Width            | 146 mm                        |
| Height           | 228 mm                        |
| Corner radius    | 6 mm                          |
| Bezel thickness  | 12 mm                         |
| **Aspect ratio** | **0.640** (146:228 ≈ 1:1.562) |

---

## Screen (Display Area)

| Property          | Value                        |
| ----------------- | ---------------------------- |
| Width             | 102 mm                       |
| Height            | 78 mm                        |
| Rows              | 14                           |
| Columns           | 24                           |
| Row height        | 5.5 mm                       |
| Character width   | 4.25 mm                      |
| Scratchpad height | 8 mm                         |
| Recess depth      | 8 mm                         |
| **Aspect ratio**  | **1.308** (102:78 ≈ 1.308:1) |
| **Active area**   | **7,956 mm²**                |

**Notes:**

- Row height × 14 rows = 77 mm (≈ 78 mm screen height, accounting for slight border)
- Char width derived as 102 mm / 24 cols = 4.25 mm (noted in source token)
- The scratchpad occupies roughly 10% of screen height (8 mm / 78 mm)

---

## Keypad

| Property       | Value  |
| -------------- | ------ |
| Key size       | 12 mm  |
| Key spacing    | 16 mm  |
| Rows           | 5      |
| Columns        | 7      |
| **Total keys** | **35** |

**Notes:**

- Layout: 7 columns across (typically A–F line keys + one function column), 5 rows down
- Spacing includes the key gap (4 mm between adjacent keys)
- Touch target area per key: 144 mm²

---

## LSK (Line Select Keys)

| Property            | Value                    |
| ------------------- | ------------------------ |
| Height              | 10 mm                    |
| Spacing             | 12.5 mm                  |
| Inset               | 8 mm                     |
| **Total LSKs**      | **12** (6L + 6R)         |
| **LSK bank height** | **~75 mm** (6 × 12.5 mm) |

**Notes:**

- LSKs flank the screen in two columns (left and right)
- Spacing of 12.5 mm matches the row height scaling (2 rows per LSK ≈ 11 mm, plus gap)
- Inset of 8 mm from screen edge to LSK centerline

---

## Annunciators

| Property            | Value       |
| ------------------- | ----------- |
| Width               | 18 mm       |
| Height              | 8 mm        |
| Spacing             | 4 mm        |
| **Individual area** | **144 mm²** |

**Notes:**

- Annunciators are positioned above the screen, typically in a single row
- Common labels: OFST, MSG, FAIL, etc.

---

## Derived Values

| Metric                     | Value       |
| -------------------------- | ----------- |
| Screen pixel ratio (px/mm) | ~0.67 px/mm |
| Screen-to-shell area ratio | ~23.9%      |
| Keypad-to-shell area ratio | ~11.3%      |
| Bezel-to-screen ratio      | 12 mm bezel |

---

## Visual Fidelity Targets

1. **Screen proportions:** The 14×24 character grid must fill the full 102 mm × 78 mm screen area exactly, with no unused margins.
2. **Character sizing:** Each monospaced character cell must be exactly 4.25 mm wide × 5.5 mm tall.
3. **Bezel flatness:** The bezel surrounds the screen with exactly 12 mm thickness on all sides.
4. **Key feel:** Keys are 12 mm with 16 mm center-to-center spacing — the 4 mm gap must be even.
5. **Recess depth:** The screen sits 8 mm recessed inside the bezel (creates the characteristic shadow on real hardware).
6. **LSK alignment:** LSK labels should align visually with the corresponding screen row. With 14 rows and 6 LSKs, each LSK spans approximately 2.3 rows of screen content.
