# Boeing 737 CDU — Visual Reference Library

## Purpose

This directory serves as the canonical visual reference library for the Boeing 737 CDU (Control Display Unit). It provides:

- **Physical measurements** — Token-defined dimensions for screen, shell, keypad, LSKs, and annunciators
- **Hardware reference images** — Photographs and scans of the physical CDU unit for visual comparison
- **Page reference images** — Screenshots of real FMC pages for display rendering validation

The goal is to ensure the VirtualCDU simulator achieves high visual fidelity against the real Boeing 737 CDU hardware.

## Directory Structure

```
boeing-737-cdu/
├── README.md            ← This file
├── measurements.md      ← Token-derived measurements and derived values
├── hardware/            ← Reference images of the physical CDU unit
│   ├── front.jpg        (planned)
│   ├── angle.jpg        (planned)
│   └── bezel-detail.jpg (planned)
└── pages/               ← Reference images of FMC page screens
    ├── ident.jpg        (planned)
    ├── pos-init.jpg     (planned)
    ├── route.jpg        (planned)
    └── ...              (other pages as needed)
```

## How to Add Reference Images

1. **Hardware images**: Place photographs or scans of the real CDU unit in `hardware/`. Use `.jpg` or `.png` format. Name files descriptively (e.g., `front-view.jpg`, `right-angle.jpg`, `bezel-closeup.jpg`).

2. **Page images**: Place screenshots of real FMC pages in `pages/`. Each image should show the full display area only (no bezel/keys). Name files after the FMC page (e.g., `ident.jpg`, `pos-init.jpg`, `route.jpg`).

3. **Do NOT** include copyrighted Boeing/Airbus manual excerpts or proprietary training materials. Publicly available photographs (e.g., cockpit tours, airshow photos) are acceptable as references.

4. **Update `measurements.md`** if you derive new measurements from reference images that differ from the token values — but **do not modify the token files** directly. File an issue or discuss with the team first.

## How to Update Measurements

The source of truth for measurements is:

```
src/components/instruments/common/tokens/boeing-cdu.tokens.ts
```

To update measurements:

1. Edit the token file (if you have confirmed the new value against hardware reference)
2. After updating the token file, update `measurements.md` to match
3. All derived values (aspect ratios, areas, etc.) in `measurements.md` will need recomputation

## Visual Fidelity Checklist

- [ ] Screen dimensions match token values (102 mm × 78 mm)
- [ ] Character grid exactly fills screen (24 cols × 14 rows)
- [ ] Bezel thickness uniform (12 mm)
- [ ] Key size and spacing correct (12 mm keys, 16 mm spacing)
- [ ] Annunciator positions and sizes match
- [ ] LSKs align with corresponding screen rows
- [ ] Screen recess depth creates proper shadow effect
