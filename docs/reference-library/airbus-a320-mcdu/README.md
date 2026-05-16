# Airbus A320 MCDU — Visual Reference Library

## Purpose

This directory serves as the canonical visual reference library for the Airbus A320 MCDU (Multipurpose Control and Display Unit). It provides:

- **Physical measurements** — Token-defined dimensions for screen, shell, keypad, LSKs, and annunciators
- **Hardware reference images** — Photographs and scans of the physical MCDU unit for visual comparison
- **Page reference images** — Screenshots of real MCDU pages for display rendering validation

The goal is to ensure the VirtualCDU simulator achieves high visual fidelity against the real Airbus A320 MCDU hardware.

## Directory Structure

```
airbus-a320-mcdu/
├── README.md            ← This file
├── measurements.md      ← Token-derived measurements and derived values
├── hardware/            ← Reference images of the physical MCDU unit
│   ├── front.jpg        (planned)
│   ├── angle.jpg        (planned)
│   └── bezel-detail.jpg (planned)
└── pages/               ← Reference images of MCDU page screens
    ├── init-a.jpg       (planned)
    ├── init-b.jpg       (planned)
    ├── f-pln.jpg        (planned)
    └── ...              (other pages as needed)
```

## How to Add Reference Images

1. **Hardware images**: Place photographs or scans of the real MCDU unit in `hardware/`. Use `.jpg` or `.png` format. Name files descriptively (e.g., `front-view.jpg`, `right-angle.jpg`, `bezel-closeup.jpg`).

2. **Page images**: Place screenshots of real MCDU pages in `pages/`. Each image should show the full display area only (no bezel/keys). Name files after the MCDU page (e.g., `init-a.jpg`, `f-pln.jpg`, `perf-to.jpg`).

3. **Do NOT** include copyrighted Airbus manual excerpts or proprietary training materials. Publicly available photographs (e.g., cockpit tours, airshow photos) are acceptable as references.

4. **Update `measurements.md`** if you derive new measurements from reference images that differ from the token values — but **do not modify the token files** directly. File an issue or discuss with the team first.

## How to Update Measurements

The source of truth for measurements is:

```
src/components/instruments/common/tokens/airbus-mcdu.tokens.ts
```

To update measurements:

1. Edit the token file (if you have confirmed the new value against hardware reference)
2. After updating the token file, update `measurements.md` to match
3. All derived values (aspect ratios, areas, etc.) in `measurements.md` will need recomputation

## Visual Fidelity Checklist

- [ ] Screen dimensions match token values (116 mm × 86 mm)
- [ ] Character grid exactly fills screen (24 cols × 14 rows)
- [ ] Bezel thickness uniform (10 mm)
- [ ] Key size and spacing correct (11 mm keys, 15 mm spacing)
- [ ] Annunciator positions and sizes match
- [ ] LSKs align with corresponding screen rows
- [ ] Screen recess depth creates proper shadow effect
- [ ] Screen appears appropriately dominant on the unit face (~30% area ratio)
