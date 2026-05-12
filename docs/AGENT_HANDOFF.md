# VirtualCDU Agent Handoff

This handoff is for the next agent continuing implementation work in `/Users/reidar/Projectos/RFMS`.

## Current Repository State

- Active branch: `main`
- Latest pushed commit before this continuation slice: `672415a Add agent handoff instructions`
- This handoff was updated during the next roadmap slice; check `git log -1 --oneline` for the newest commit after that slice is committed.
- Current authoritative status document: `STATUS.md`
- Current roadmap: `ROADMAP.md`
- Current test matrix: `TEST_MATRIX.md`
- Current scope boundaries: `SCOPE.md` and `KNOWN_LIMITATIONS.md`
- Current pilot review criteria: `PILOT_REVIEW_RUBRIC.md`
- Current metrics/measurement plan: `METRICS.md`

Do not treat older roadmap files as current truth unless `STATUS.md`, `IMPLEMENTATION_STATUS.md`, or `ROADMAP.md` explicitly says the work is still active. The older FMS accuracy plans were consolidated into the current roadmap/status documents.

## Uncommitted Local Files To Leave Alone

At this handoff, the working tree may still contain local generated or research artifacts that should not be staged unless the user explicitly asks:

- `playwright-report/index.html`
- `737_and_A320neo_deep_research.md`
- `NAVIGATION_MODULES_USED_BY_737_A320NEO.md`
- `NAV_DISPLAY_MODES_AND_INTEGRATION.md`
- `fmc_to_nd_visualization_notes.md`
- `grok_report_1.pdf`
- `grok_report_2.pdf`
- `masterplan.pdf`

These are useful as local references, but prior commits intentionally excluded them.

## Verified Baseline

Latest verified automated baseline:

- Current automated counts, build size, and audit state live in `docs/STATUS.md`.
- Do not duplicate those live values in handoff notes; run the commands and update `STATUS.md` when the baseline changes.

Do not claim live MSFS/PMDG validation from this macOS workspace. PMDG work is scaffolded and mock-tested, but live round-trip validation belongs in the Windows/MSFS/PMDG matrix documented in `docs/MSFS_LIVE_VALIDATION.md`.

## What Has Been Implemented Recently

Recent commits in order:

- `805a894 Add ND training context display`
- `e47db78 Show route constraints on ND`
- `c2bcd04 Reflect direct-to targets on ND`
- `51ef671 Add Boeing approach reference page`
- `672415a Add agent handoff instructions`
- Current continuation slice after `672415a`: cockpit task-mode workspace, auto-fit instrument stages, focus/zoom/pin controls, aircraft-specific checklist panels, Airbus FCU highlighting, ND clipping hardening, and refreshed visual baselines.

The current implementation includes:

- Phase 0 planning/status artifacts, reference-library metadata, visual measurement plan, and screenshot capture tooling.
- Shared display semantics and `data-semantic` hooks for visual measurement.
- CI-safe mock SimConnect adapter and bridge server mock WebSocket tests.
- Boeing procedural improvements:
  - Route parsing into LEGS.
  - DEP/ARR SID, runway, STAR, and approach entry.
  - V-speed ordering validation.
  - V-speed invalidation when takeoff runway changes.
  - HOLD staging, EXEC commit, and active-route fix validation.
  - LEGS discontinuity replacement by waypoint entry.
  - DIR INTC direct-to state.
  - DES NOW trainer action.
  - TAKEOFF REF page 2 trainer approach reference with landing runway, landing flaps, VREF, ILS frequency, and course.
  - Two-entry FIX page support with entry-specific radial/distance fields.
- Phase 2.5 ND training visuals:
  - Route line and waypoint labels.
  - Active/direct-to segment awareness.
  - Discontinuity marker.
  - Speed/altitude constraints from route parsing.
  - FIX radial/distance overlay.
  - Multiple FIX ring/radial overlays when two FIX entries exist.
  - HOLD racetrack preview.
  - SID/STAR/approach/runway context.
  - MAP/PLAN mode, range, overlay toggles, and iPad layout handling.
- Cockpit workspace improvements:
  - Learner task modes for FMC Focus, Navigation, Automation, Approach, Full Deck, and Free Practice.
  - Mode-specific recommended panels and restore behavior.
  - Focus, hide, pin, zoom, and reset controls for instrument panels.
  - Aircraft-specific checklist sections with related-control highlighting.
  - Full Deck rendering restored and guarded by Playwright layout size assertions.

## Architectural Pointers

Shared state and types:

- `shared/src/types/fmc.ts`
- `FMCState` is shared between frontend standalone mode and backend CONTROL mode.
- Keep frontend and backend behavior in parity when adding any CDU/MCDU action.

Boeing page renderers:

- `shared/src/fmc/pages/setup.ts`
- `shared/src/fmc/pages/route.ts`
- `shared/src/fmc/pages/navigation.ts`
- `shared/src/fmc/pages/climb.ts`
- `shared/src/fmc/pages/cruise.ts`
- `shared/src/fmc/pages/descent.ts`
- `shared/src/fmc/pages/direct.ts`
- `shared/src/fmc/pages/n1limit.ts`

Frontend state/actions:

- `src/store/useFMCStore.ts`

Backend CONTROL-mode engine:

- `server/src/fmc-engine.ts`

ND model and component:

- `shared/src/fmc/navigationDisplay.ts`
- `src/components/ND/NavigationDisplay.tsx`

Tests:

- Shared/page renderer tests: `shared/src/__tests__/`
- Frontend store tests: `src/store/__tests__/useFMCStore.test.ts`
- Backend engine tests: `server/src/__tests__/fmc-engine.test.ts`
- E2E tests: `e2e/`

## Implementation Rules For The Next Agent

1. Read `STATUS.md`, `IMPLEMENTATION_STATUS.md`, `ROADMAP.md`, and `TEST_MATRIX.md` before choosing work.
2. Keep status documents evidence-backed. If a command was not run, do not say it passed.
3. Preserve the distinction between:
   - implemented,
   - mock-tested,
   - display-only,
   - pilot-reviewed,
   - live MSFS-verified.
4. Do not claim measured visual fidelity until Phase 0/Phase 1 measurement methods are actually run against reference captures.
5. Do not turn the ND into a certified/live avionics display. Current ND scope is training context only.
6. For every new LSK action, wire both:
   - frontend standalone store handling in `src/store/useFMCStore.ts`,
   - backend CONTROL-mode handling in `server/src/fmc-engine.ts`.
7. Add tests at the level matching the change:
   - renderer/unit test for display output,
   - store test for standalone data mutation,
   - backend test for CONTROL-mode parity,
   - Playwright test for user-facing workflows or layout behavior.
8. Avoid unrelated refactors. This repo has active roadmap work; keep each commit focused.
9. Leave local generated/research files unstaged unless the user explicitly asks to commit them.
10. If committing/pushing, run the full gate set first unless the user specifically asks for a narrower check.

## Recommended Next Work

The strongest next roadmap-aligned slices are below. Pick one focused slice, implement it end-to-end, update docs, run gates, then commit and push if requested.

### Option A: Deeper LEGS EXEC Staging

Roadmap phase: Phase 2 Boeing Procedural Fidelity.

Goal:

- Make LEGS edits trainer-realistic by staging insert/delete/discontinuity changes until EXEC rather than mutating the active route immediately.

Expected work:

- Add pending route/legs state or a pending edit model to `FMCState`.
- Display modified route rows with semantic `modified` styling.
- Make EXEC commit pending LEGS edits.
- Make CLR/DEL cancellation behavior explicit if implemented.
- Add store/backend parity tests.
- Add E2E for edit -> EXEC behavior.

Watch-outs:

- Existing tests expect immediate mutation for some LEGS edits. Update behavior and tests intentionally.
- Keep discontinuity replacement working.

### Option B: FIX Multi-Entry And ND Ring Preview

Roadmap phases: Phase 2 and Phase 2.5.

Status:

- Completed as a two-slot trainer implementation after this handoff was first created.
- `FMCState.fixEntries` is the new multi-entry model, while legacy `fix` remains for compatibility with the first slot.
- The FIX page exposes L1/L2 for entry 1 and R1/R2 for entry 2.
- The ND model exposes `fixOverlays` and renders multiple ring/radial overlays.
- Unit tests cover renderer, ND model, frontend store, and backend engine behavior.
- Playwright covers entering two FIX entries and seeing two ND overlays.

Possible follow-up:

- Consider pilot feedback before expanding beyond two slots.

### Option C: Airbus Scope Cleanup

Roadmap phase: Phase 3 Airbus Scoped Polish.

Goal:

- Make visible Airbus LSKs either functional or intentionally disabled.

Expected work:

- Audit Airbus page renderers in `shared/src/fmc/pages/airbus/`.
- Create a page-status table in docs or update `SCOPE.md`.
- Remove fake interactivity from display-only pages.
- Add tests that unsupported visible actions produce a clear disabled/no-action state rather than silent fake behavior.

Watch-outs:

- Keep Boeing behavior untouched.
- Airbus remains scoped secondary until Boeing path is stable.

### Option D: PWA/iPad Offline Hardening

Roadmap phase: Phase 8.

Goal:

- Improve cockpit-mode usability on iPad: offline refresh, app shell caching, safe areas, and update flow.

Expected work:

- Audit existing PWA/service worker setup.
- Cache app shell, fonts/assets, tutorial content, and demo navdata.
- Avoid caching live SimConnect data.
- Add iPad viewport checks for layout stability.

Watch-outs:

- Do not add heavy navdata to unversioned caches.

## Validation Commands

Run these before committing a roadmap implementation slice:

```bash
npm run typecheck:all
npm test -- --run
npm run test:e2e
npm run build
npm audit --audit-level=high
```

Expected audit behavior:

- Command exits 0 for the current high/critical policy.
- It still prints 2 moderate Vite/esbuild dev dependency advisories.
- Do not run `npm audit fix --force` casually; current docs explicitly defer that breaking update.

## Commit And Push Expectations

The user has previously asked to continue, commit, and push roadmap work. For future implementation slices:

- Commit focused, validated changes.
- Push to `main` unless the user asks for a branch.
- Do not commit local generated report/research files listed above.
- Use concise commit messages that describe the roadmap slice, for example:
  - `Stage LEGS edits until EXEC`
  - `Support multiple FIX overlays`
  - `Clarify Airbus display-only actions`

## Definition Of Done For A Slice

A roadmap slice is done when:

- The feature behavior is implemented in the correct shared/frontend/backend layer.
- Frontend and backend CONTROL-mode behavior are in parity where applicable.
- Unit/regression tests cover the new behavior.
- Playwright coverage is added if the user-facing workflow changes.
- `STATUS.md` is updated with measured results; implementation/test docs link to it instead of duplicating live counts.
- The full validation command set passes or any skipped/unrun command is clearly documented.
- The commit excludes unrelated local artifacts.
