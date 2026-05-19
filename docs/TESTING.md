# Testing Strategy

**Last updated:** 2026-05-17

This document describes the testing strategy for VirtualCDU across all four test categories: unit, component, end-to-end, and visual regression. For live test counts and current CI gate status, see [`docs/STATUS.md`](STATUS.md).

---

## 1. Unit Tests (Vitest)

### Scope

Unit tests cover isolated logic in the `shared` and `src` workspaces. These tests have no DOM dependency unless explicitly using `jsdom`.

**What we unit test:**

- Field parsers and formatters
- Validation rules (V-speed relationships, ICAO airport format, QNH range, etc.)
- Scratchpad engine (priority queue, message lifecycle, buffer operations)
- Route modification state machine (NONE → MODIFIED → EXECUTED lifecycle)
- Route discontinuity insertion and resolution
- Performance calculation helpers
- Display grammar layout validation (segment overflow, overlap)
- Grid helper functions (Boeing and Airbus)
- Navdata repository lookup behavior

### Configuration

Unit tests use the project-level `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### File conventions

- Tests live next to their source files in `__tests__` directories:
  - `shared/src/__tests__/*.test.ts` — shared logic (scratchpad engine, route modification, grid helpers, page rendering)
  - `src/**/__tests__/*.test.tsx` — frontend logic
- Jest/Vitest globals (`describe`, `it`, `expect`) are available without imports (`globals: true`)
- Testing Library's `cleanup` runs automatically after each test via `src/test/setup.ts`

### Running unit tests

```bash
# Run all unit tests (watch mode)
npm test

# Run once (CI mode)
npm test -- --run

# Run with coverage
npm run test:coverage

# Run with UI dashboard
npm run test:ui

# Run a specific test file
npx vitest shared/src/__tests__/scratchpadEngine.test.ts

# Run tests matching a pattern
npx vitest --run -t "route discontinuity"
```

### Coverage targets

| Metric     | Minimum threshold |
| ---------- | ----------------- |
| Lines      | 50%               |
| Functions  | 50%               |
| Branches   | 50%               |
| Statements | 50%               |

Coverage is informational — the 50% floor prevents regressions but is not the primary quality metric. The goal is meaningful coverage of business logic (scratchpad engine, state machines, validation rules), not blanket coverage.

---

## 2. Component Tests (Vitest + Testing Library)

### Scope

Component tests verify that UI components render correctly and respond to user interactions. They use `jsdom` for a simulated browser environment.

**What we component-test:**

- `CharacterGrid` — exact 24×14 cell count, cell positioning
- `BoeingCDUPageRenderer` / `AirbusMCDUPageRenderer` — page definition → visual output
- `AvionicsKey` — press state, aria labels, disabled state
- `LineSelectKey` — row alignment, active/hover states
- `ScreenGlass` — recessed display, reflection layer
- Page components — data flow from store to display
- Checklist components — aircraft-specific content

### Testing Library usage

Tests use `@testing-library/react` for rendering and `@testing-library/jest-dom/vitest` for DOM assertions:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
```

### Snapshot tests

React Testing Library snapshot tests (`toMatchSnapshot`) are used for display grammar verification. These catch unintended layout changes before visual regression tests run.

### Running component tests

Component tests are co-located with unit tests and use the same Vitest runner:

```bash
# All frontend tests (includes component tests)
npm test

# Filter to component tests
npx vitest --run --reporter=verbose src/components
```

---

## 3. End-to-End Tests (Playwright)

### Scope

E2E tests verify complete user workflows in a real browser. They start the Vite dev server automatically via Playwright's `webServer` configuration.

**What we test end-to-end:**

- Boeing preflight: IDENT → POS INIT → RTE → DEP/ARR → PERF INIT → THRUST LIM → TAKEOFF REF → LEGS
- Airbus workflow: INIT A → F-PLN → PERF TAKEOFF → PROG
- Invalid airport entry (expect `NOT IN DATABASE`)
- Invalid V-speeds (expect `INVALID ENTRY` or `V1/VR/V2` validation)
- Route discontinuity scenario (insertion, display, resolution)
- EXEC pending/clear lifecycle
- Keyboard-only interaction (function keys, LSKs, scratchpad)
- Aircraft mode switching (Boeing ↔ Airbus)
- Responsive layout on tablet viewports

### Configuration

`playwright.config.ts` defines four projects:

| Project          | Device                | Purpose                    |
| ---------------- | --------------------- | -------------------------- |
| desktop-chromium | Desktop Chrome        | Primary test target        |
| ipad-landscape   | iPad Pro 11 landscape | Tablet layout verification |
| ipad-portrait    | iPad Pro 11 portrait  | Cockpit mount layout       |
| mobile-safari    | iPhone 14             | Mobile PWA layout          |

### Test organization

```
e2e/
├── smoke/                  # Fast @smoke-tagged tests (CI PR gate)
│   └── critical-path.spec.ts
├── visual/                 # @Visual Regression screenshot tests
│   └── critical-screenshots.spec.ts
├── visual-boeing-cdu.spec.ts
├── visual-airbus-mcdu.spec.ts
├── visual-navigation-display.spec.ts
├── visual-layouts.spec.ts
├── visual-regression.spec.ts
├── visual-nd-realism.spec.ts
├── fidelity-audit.spec.ts
├── cockpit-hardening.spec.ts
├── autopilot_guards.spec.ts
├── baseline-screenshots.spec.ts
├── basic.spec.ts
└── helpers.ts
```

### Running E2E tests

```bash
# Full E2E suite (all projects, all tests)
npm run test:e2e

# Smoke tests only (fast CI gate, desktop Chromium)
npm run test:e2e:smoke

# CI smoke gate (desktop Chromium)
npm run test:e2e:ci

# Full test matrix (all projects, all tests — alias)
npm run test:e2e:full

# Specific test file
npx playwright test e2e/basic.spec.ts

# Single project (e.g., iPad)
npx playwright test --project=ipad-landscape

# With UI mode
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

### CI split strategy

| Gate        | Command          | Scope                                 | Expected time |
| ----------- | ---------------- | ------------------------------------- | ------------- |
| PR smoke    | `test:e2e:smoke` | `@smoke` tests, desktop Chromium only | Fast (<2 min) |
| Full matrix | `test:e2e`       | All tests, all 4 projects             | Slower        |
| Visual only | `test:visual`    | Tests tagged `Visual Regression`      | Medium        |

---

## 4. Visual Regression Tests (Playwright Snapshots)

### Scope

Visual regression tests capture screenshots of key pages and states, then compare them against committed baselines in CI. This catches unintended visual changes to the CDU/MCDU shell, display rendering, and layout.

**What we snapshot:**

- Boeing CDU default cockpit mode
- Boeing IDENT, POS INIT, RTE, LEGS with discontinuity
- Boeing PERF INIT with missing fields, TAKEOFF REF complete
- Boeing EXEC pending state
- Airbus MCDU default cockpit mode
- Airbus INIT A, F-PLN with discontinuity
- Airbus PERF TAKEOFF, PROG
- Mobile/tablet Boeing and Airbus layouts
- Night mode
- Invalid scratchpad message state
- Boeing/Airbus cockpit task-mode layouts from PR #23
- Boeing/Airbus ND MAP/ARC/failure/aligning states from PR #24
- Boeing/Airbus automation, focused, approach, and failure PFDs
- Focused Boeing/Airbus CDU/MCDU, ND, PFD, and MCP/FCU panels
- Tablet-landscape Boeing/Airbus full-deck and automation layouts
- High-resolution Boeing/Airbus cockpit layouts at 3456x2234 and Retina-equivalent 1728x1117 @2x

### Snapshot storage

Playwright snapshots are stored alongside test files in `*-snapshots/` directories:

```
e2e/visual-pfd.spec.ts-snapshots/
e2e/visual-boeing-cdu.spec.ts-snapshots/
e2e/visual-airbus-mcdu.spec.ts-snapshots/
e2e/visual-regression.spec.ts-snapshots/
e2e/visual-navigation-display.spec.ts-snapshots/
e2e/visual/cockpit-layouts.spec.ts-snapshots/
e2e/visual/cockpit-highres.spec.ts-snapshots/
```

### Baseline update workflow

When visual changes are intentional (e.g., a UI improvement or new feature), update the baselines:

```bash
# Update ALL visual baselines
npm run test:visual:update

# Update baselines for a specific file
npx playwright test e2e/visual-boeing-cdu.spec.ts --update-snapshots --project=desktop-chromium

# Update PFD follow-up baselines
npx playwright test e2e/visual-pfd.spec.ts --update-snapshots --project=desktop-chromium

# Update cockpit layout/focused-panel/tablet-landscape baselines
npx playwright test e2e/visual/cockpit-layouts.spec.ts --update-snapshots --project=desktop-chromium

# Update high-resolution cockpit baselines
npx playwright test e2e/visual/cockpit-highres.spec.ts --update-snapshots --project=desktop-3456x2234
npx playwright test e2e/visual/cockpit-highres.spec.ts --update-snapshots --project=retina-1728x1117-dsf2

# Rebuild the visual-fidelity manifest/report after visual baseline changes
npm run measure:visual

# Capture fresh baselines for the baseline-screenshots spec
npm run capture:baseline
```

**Baseline update process:**

1. Make your UI changes
2. Run `npm run test:visual` to see which snapshots fail
3. Review the diff artifacts in the Playwright HTML report (`playwright-report/`)
4. If the changes are correct, run `npm run test:visual:update` to update baselines
5. Run `npm run measure:visual` so `docs/VISUAL_FIDELITY_REPORT.md` reflects the protected surfaces
6. Commit the updated snapshot files alongside your code changes
7. In CI, visual tests use the committed baselines for comparison

High-resolution cockpit screenshots are intentionally run as serial tests because 3456x2234 PNG capture is expensive. Run those projects explicitly instead of mixing them with mobile/WebKit projects.

**Important rules:**

- Never commit baselines that were generated from a broken or WIP state
- Visual baseline snapshots are stored in Git and reviewed in PRs
- If CI visual tests fail, check the uploaded diff artifacts before deciding to update baselines
- Snapshot path template: `{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}` (configured in `playwright.config.ts`)

### Creating new visual tests

```ts
import { test, expect } from '@playwright/test';

test('Boeing IDENT page @Visual Regression', async ({ page }) => {
  await page.goto('/');
  // Navigate to IDENT page
  await page.click('[data-testid="lsk-L1"]');
  await expect(page).toHaveScreenshot('boeing-ident.png');
});
```

---

## 5. Test Commands Reference

| Command                      | Category | Description                                    |
| ---------------------------- | -------- | ---------------------------------------------- |
| `npm test`                   | Unit     | Watch mode — all Vitest tests                  |
| `npm test -- --run`          | Unit     | Single run — all Vitest tests                  |
| `npm run test:coverage`      | Unit     | Single run with coverage report                |
| `npm run test:ui`            | Unit     | Vitest UI dashboard (interactive)              |
| `npm run test:e2e`           | E2E      | Full Playwright suite, all projects            |
| `npm run test:e2e:ci`        | E2E      | Smoke-only for CI (desktop Chromium, `@smoke`) |
| `npm run test:e2e:smoke`     | E2E      | Same as CI — smoke tests only                  |
| `npm run test:e2e:full`      | E2E      | Full Playwright suite (alias)                  |
| `npm run test:visual`        | Visual   | Tests tagged `Visual Regression`               |
| `npm run test:visual:update` | Visual   | Update all visual baselines                    |
| `npm run capture:baseline`   | Visual   | Capture fresh baseline screenshots             |
| `npm run test:e2e:visual`    | Visual   | Legacy — ND visual tests only                  |
| `npm run typecheck:all`      | Type     | TypeScript check all 3 workspaces              |
| `npm run build`              | Build    | Production bundle                              |

---

## 6. CI Test Pipeline

The CI pipeline (GitHub Actions) runs a staged test strategy:

```
Push/PR
  └─ typecheck:all (fail fast)
  └─ test --run (unit + component)
  └─ build (production bundle)
  └─ test:e2e:ci (smoke — desktop Chromium)
  └─ test:visual (visual regression — desktop Chromium)
  └─ [nightly] test:e2e (full matrix — all 4 projects)
```

- **Fail-fast**: TypeScript type-checking runs first. If it fails, no further tests run.
- **PR gate**: Unit tests + smoke E2E + build must pass. Visual tests run but baseline mismatches are warnings (diff artifacts are uploaded for manual review).
- **Nightly**: Full browser matrix runs nightly on the main branch.

Current verified command results and any local suite caveats live in [`docs/STATUS.md`](STATUS.md). Do not copy live counts into this file.

---

## 7. Coverage Expectations

| Area                                               | Target            | Current         | Notes                               |
| -------------------------------------------------- | ----------------- | --------------- | ----------------------------------- |
| Shared logic (scratchpad, route model, validation) | 90%+              | ~85%\*          | Primary focus for new tests         |
| Page grid functions (Boeing + Airbus)              | 85%+              | ~80%\*          | Per-page segment + LSK action tests |
| Component rendering                                | 70%+              | ~60%\*          | CharacterGrid, renderers, keycaps   |
| E2E critical paths                                 | 100% of workflows | See STATUS.md   | Boeing + Airbus preflight flows     |
| Visual regressions                                 | Key pages covered | ~15 snapshots\* | Expanding with each milestone       |

_\* Approximate — see [`docs/STATUS.md`](STATUS.md) for precise live counts._

### Where to focus new tests

1. **Validation rules** — each field's parser + validator pair should have unit tests for valid, invalid, and boundary values
2. **Scratchpad messages** — every message trigger (`INVALID ENTRY`, `NOT IN DATABASE`, etc.) should have a test
3. **State machine transitions** — every valid and invalid transition should be tested
4. **Route model operations** — insert, clear, resolve discontinuity; MOD/EXEC lifecycle
5. **Visual baselines** — each new or modified page should have a corresponding snapshot

---

## 8. Testing Anti-Patterns

- **Don't snapshot the entire store** — test derived state and selectors, not raw store objects
- **Don't test implementation details** — prefer behavior-based assertions (what renders, what happens on click)
- **Don't share mutable test fixtures** — use factory functions that return fresh state per test
- **Don't depend on external services** — all tests must run offline with deterministic data
- **Don't duplicate STATUS.md** — live test counts live in `docs/STATUS.md`, not here
- **Don't write E2E tests for pure logic** — put validation/business logic tests in Vitest, not Playwright

---

## 9. Related Documentation

- [`docs/STATUS.md`](STATUS.md) — live test counts and CI gate status
- [`docs/ROADMAP.md`](ROADMAP.md) — milestone tracking for test coverage expansion
- [`vitest.config.ts`](../vitest.config.ts) — Vitest configuration
- [`playwright.config.ts`](../playwright.config.ts) — Playwright configuration
- [`package.json`](../package.json) — all test script definitions
