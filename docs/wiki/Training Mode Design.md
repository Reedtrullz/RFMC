# Training Mode Design

Training should react to real avionics state, not static checklist clicks.

Current foundation:

- `buildTrainingProgress()` derives current step, completed steps, next action, expected page/key/LSK/panel, missing fields, warnings, and hints.

Next curriculum work:

- Boeing preflight lesson pack.
- Route verification lesson pack.
- Automation lesson pack.
- Approach setup lesson pack.
- Airbus scoped preflight lesson pack.
- Debrief and scoring based on actual actions, errors, hints, and completion state.
