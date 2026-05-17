# Contributor Guide

Contribution rules:

- Keep changes focused.
- Prefer existing project patterns.
- Preserve Boeing/Airbus terminology separation.
- Preserve frontend standalone and backend CONTROL-mode parity for supported actions.
- Add tests at the level matching the change.
- Update visual baselines for visual/layout changes.
- Update docs when behavior, scope, validation, or release claims change.
- Keep live command results in `docs/STATUS.md`.
- Physical keyboard access should keep `F1-F6` mapped to left LSKs and `F7-F12` mapped to right LSKs.
- Do not reserve normal CDU letters for app shortcuts; use non-character shortcuts such as `?` for overlays.

Avoid unrelated refactors during roadmap slices.
