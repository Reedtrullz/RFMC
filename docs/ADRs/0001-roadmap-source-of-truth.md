# ADR 0001: Roadmap Source Of Truth

## Status

Accepted.

## Context

The repo had multiple overlapping planning documents with stale findings mixed with current work. Some older files still listed fixed blockers as open, while newer plans required measured visual baselines and pilot/MSFS validation gates.

## Decision

Use this hierarchy:

1. `STATUS.md` for current automated counts, build/audit state, latest reviewed commit, and validation caveats.
2. `ROADMAP.md` for phase order and implementation direction.
3. `METRICS.md` for measurement methods and phase gates.
4. `TEST_MATRIX.md` for automated/manual/live test coverage.
5. `PILOT_REVIEW_RUBRIC.md` for human validation.
6. `KNOWN_LIMITATIONS.md` for honest product scope.
7. `IMPLEMENTATION_STATUS.md` for implementation history and capability state.

Historical plan files remain in the repo, but they are explicitly marked superseded or planning-baseline-only.

## Consequences

- New work should update the current tracker files, not resurrect stale checklists.
- Estimated visual/procedure scores must not be presented as measured results without evidence in `METRICS.md`.
- Live PMDG and pilot-review gates remain external until validated in the correct environment.
