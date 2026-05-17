# Visual Realism Guide

Visual realism has two separate levels:

- Snapshot-protected: Playwright screenshots prove stable rendering.
- Measured: approved reference captures and measurement results prove a specific geometry/color/font comparison.

Most surfaces are currently snapshot-protected. Hardware pixel accuracy is not claimed until `docs/VISUAL_FIDELITY_REPORT.md` explicitly marks the surface measured against approved references.

Use:

```bash
npm run measure:visual
```

See `docs/VISUAL_REALISM.md`, `docs/VISUAL_MEASUREMENT.md`, and `docs/VISUAL_FIDELITY_REPORT.md`.
