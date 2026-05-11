# VirtualCDU Complete Implementation Plan

## TL;DR

> Fix 3 critical bugs, rebuild the display engine with proper aviation colors, add missing function keys, correct Airbus labels, implement input validation, wire up placeholder pages, add basic MSFS integration, and enhance tutorials. **7 waves, 35 tasks, parallel execution prioritized.**
>
> **Deliverables:** Bug-free codebase, visually accurate Boeing/Airbus CDUs, functional nav pages, validated MSFS bridge, enhanced tutorials
>
> **Estimated Effort:** Large (7 waves, ~6-8 weeks)
> **Parallel Execution:** YES - 5-8 tasks per wave
> **Critical Path:** Phase 0 bugs → Display engine → Boeing visual → Airbus visual → Functional → MSFS → Polish → Final QA

---

## Context

### Original Request
Implement all findings from comprehensive test across 3 analysis files:
- `COMPREHENSIVE_TEST_PLAN.md` (critical bugs, visual issues, functional gaps)
- `FMS_ACCURACY_IMPROVEMENT_PLAN.md` (10-week improvement roadmap)
- `VISUAL_ANALYSIS_SUMMARY.md` (real hardware comparison)

### Interview Summary
**Key Decisions:**
- Must fix critical bugs before any visual changes
- Display engine must be unified (shared color/font system)
- MSFS integration scoped to basic connection + 2 aircraft profiles
- Nav database scoped to top 100 airports + all US states
- Must NOT use proprietary fonts (open-source only)
- Must NOT break WebSocket protocol
- Must work offline (nav data is static)
- Must include comprehensive testing

### Metis Review Findings
**Identified Gaps (addressed in this plan):**
- No testing infrastructure mentioned → Added Phase 7 testing setup
- No acceptance criteria for visual tasks → Added per-task criteria
- MSFS scope creep risk → Locked to basic connection + 2 profiles
- Nav database scope creep → Locked to top 100 + US airports
- No rollback plan for npm audit → Added verification step
- Missing edge case handling → Added edge case notes per task

---

## Work Objectives

### Core Objective
Transform VirtualCDU from a "visually competent training tool" to a "benchmark-quality FMC/CDU simulator" by fixing critical bugs, matching real hardware visuals, and completing placeholder functionality.

### Concrete Deliverables
- Bug-free TypeScript compilation (`npm run typecheck:all` passes)
- Multi-color Boeing CDU display (cyan/green/magenta/white)
- All 14 Boeing function keys present
- Correct Airbus function key labels + color semantics
- Functional LEGS/HOLD/FIX pages
- Input validation for all data entry fields
- Basic MSFS SimConnect integration
- Enhanced tutorials with error detection
- Comprehensive test suite (unit + integration + E2E)

### Definition of Done
- [ ] `npm run typecheck:all` → PASS (0 errors)
- [ ] `npm run build` → PASS (0 warnings)
- [ ] `npm audit` → 0 vulnerabilities
- [ ] All QA scenarios pass (see per-task criteria)
- [ ] Real hardware comparison shows <10% visual variance

### Must Have (Non-Negotiable)
- Phase 0 critical bugs fixed
- TypeScript compilation clean
- Boeing multi-color display
- All missing function keys added
- Input validation for ICAO codes and ranges
- MSFS basic connection working

### Must NOT Have (Guardrails)
- Proprietary font files (Boeing/Airbus IP)
- Breaking WebSocket protocol changes
- Online-only nav database (must work offline)
- Full flight dynamics simulation (out of scope)
- Complete Airbus MCDU (only core pages)
- Production MSFS integration (dev/test only)
- AI-generated placeholder pages that look finished

---

## Verification Strategy

### Test Decision
- **Infrastructure exists:** YES (Vite build, can add Vitest)
- **Automated tests:** Tests-after (add after implementation)
- **Framework:** Vitest (unit), Playwright (E2E)
- **Agent-Executed QA:** Every task includes Playwright or curl-based verification

### QA Policy
Every task MUST include agent-executed QA scenarios:
- **Frontend/UI:** Playwright - Navigate, interact, assert DOM, screenshot
- **API/Backend:** Bash (curl) - Send requests, assert status + response
- **Build:** Bash - Run typecheck, build, verify exit code 0
- Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

```
Phase 0 (Start Immediately - Critical Bugs):
├── T0.1: Fix Airbus MCDU MENU crash
├── T0.2: Fix server missing state fields
├── T0.3: Fix null renderer invocation
├── T0.4: Fix npm audit vulnerabilities
└── T0.5: Verify full TypeScript compilation

Phase 1 (After Phase 0 - Display Engine Foundation):
├── T1.1: Implement unified color token system
├── T1.2: Source open-source aviation font
├── T1.3: Refactor Display/DisplayLine for color support
├── T1.4: Add text styling utilities (bold, inverse, small)
└── T1.5: Update Tailwind config with new tokens

Phase 2 (After Phase 1 - Boeing Visual):
├── T2.1: Apply multi-color display to Boeing pages
├── T2.2: Add missing 7 function keys to CDU.tsx
├── T2.3: Reorganize Boeing keypad layout
├── T2.4: Improve bezel styling
└── T2.5: Update Boeing page renderers with color

Phase 3 (After Phase 1 - Airbus Visual):
├── T3.1: Correct Airbus function key labels
├── T3.2: Implement Airbus color-coded semantics
├── T3.3: Complete missing Airbus pages (INIT B, PERF, RAD NAV)
├── T3.4: Fix Airbus MCDU MENU styling
└── T3.5: Update Airbus page renderers with color

Phase 4 (After Phases 2-3 - Functional):
├── T4.1: Implement input validation framework
├── T4.2: Add ICAO/range/cross-field validators
├── T4.3: Wire up LEGS page waypoint editing
├── T4.4: Implement HOLD page functionality
├── T4.5: Implement FIX page functionality
├── T4.6: Expand nav database (top 100 + US)
└── T4.7: Integrate SimBrief import UI

Phase 5 (After Phase 4 - MSFS Integration):
├── T5.1: Install node-simconnect
├── T5.2: Implement basic SimConnect connection
├── T5.3: Create aircraft adapter interface
├── T5.4: Implement PMDG 737 adapter
├── T5.5: Implement FBW A320 adapter
├── T5.6: Add connection diagnostics UI
└── T5.7: Add MSFS data sync (position, altitude)

Phase 6 (After Phase 5 - Polish):
├── T6.1: Add failure mode annunciations
├── T6.2: Implement contextual LSK labels
├── T6.3: Add button press animations
├── T6.4: Enhance tutorials with error detection
└── T6.5: Add performance metrics

Phase 7 (After Phase 6 - Testing):
├── T7.1: Set up Vitest test framework
├── T7.2: Write unit tests for state/store
├── T7.3: Write unit tests for page renderers
├── T7.4: Write unit tests for input validation
├── T7.5: Write Playwright E2E tests
└── T7.6: Write MSFS integration tests

Wave FINAL (After ALL - 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + playwright)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T0.1-T0.5 → T1.1-T1.5 → T2.1-T3.5 (parallel) → T4.1-T4.7 → T5.1-T5.7 → T6.1-T6.5 → T7.1-T7.6 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Phase 4)
```

### Dependency Matrix

- **T0.1-0.5**: None (can start immediately)
- **T1.1-1.5**: Depends on T0.1-0.5
- **T2.1-2.5**: Depends on T1.1-1.5
- **T3.1-3.5**: Depends on T1.1-1.5 (parallel with T2.x)
- **T4.1-4.7**: Depends on T2.1-2.5, T3.1-3.5
- **T5.1-5.7**: Depends on T4.1-4.7
- **T6.1-6.5**: Depends on T5.1-5.7
- **T7.1-7.6**: Depends on T6.1-6.5
- **F1-F4**: Depends on ALL tasks

### Agent Dispatch Summary

- **Phase 0**: T0.1-T0.5 → `quick` (5 tasks, quick fixes)
- **Phase 1**: T1.1-T1.5 → `visual-engineering` (5 tasks, design system)
- **Phase 2**: T2.1-T2.5 → `visual-engineering` + `frontend-ui-ux` (5 tasks)
- **Phase 3**: T3.1-T3.5 → `visual-engineering` + `frontend-ui-ux` (5 tasks, parallel with Phase 2)
- **Phase 4**: T4.1-T4.7 → `unspecified-high` + `ultrabrain` (7 tasks, complex logic)
- **Phase 5**: T5.1-T5.7 → `unspecified-high` (7 tasks, integration)
- **Phase 6**: T6.1-T6.5 → `visual-engineering` (5 tasks, polish)
- **Phase 7**: T7.1-T7.6 → `unspecified-high` (6 tasks, testing)
- **FINAL**: F1-F4 → `oracle`, `unspecified-high`, `unspecified-high`, `deep` (4 tasks)

---

## TODOs

- [ ] T0.1. **Fix Airbus MCDU MENU Page Crash**

  **What to do:**
  - Open `shared/src/fmc/pages/airbus/index.ts`
  - Navigate to line 396 (renderMcduMenu function)
  - Remove the extra array wrapper: change `lines: [[...]]` to `lines: [...]`
  - Verify the fix compiles

  **Must NOT do:**
  - Do not change any other page renderers
  - Do not modify the DisplayLine component

  **Recommended Agent Profile:**
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Single-line fix, no domain expertise needed

  **Parallelization:**
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Phase 0 (with T0.2, T0.3, T0.4)
  - **Blocks**: T3.4 (Airbus MENU styling)
  - **Blocked By**: None

  **References:**
  - Current buggy code: `shared/src/fmc/pages/airbus/index.ts:396`
  - DisplayLine interface: `shared/src/types/fmc.ts:43-56`

  **Acceptance Criteria:**
  - [ ] `npm run typecheck:all` shows 0 errors in airbus/index.ts
  - [ ] `npm run build` completes successfully
  - [ ] Manual QA: Navigate to Airbus MCDU MENU page (click MCDU MENU button), page renders without crash

  **QA Scenarios:**
  ```
  Scenario: Airbus MENU page renders without crash
    Tool: Playwright
    Preconditions: App running on localhost:5173, Airbus aircraft selected
    Steps:
      1. Click "MCDU MENU" function key
      2. Wait for page to render (timeout: 5s)
      3. Assert no console errors
    Expected Result: MENU page displays with "INIT", "F-PLN", "PERF" options
    Failure Indicators: Console shows "Cannot read properties of undefined" or blank screen
    Evidence: .sisyphus/evidence/task-t01-menu-render.png
  ```

  **Commit**: YES
  - Message: `fix(airbus): remove extra array wrapper in MCDU MENU page`
  - Files: `shared/src/fmc/pages/airbus/index.ts`

---

- [ ] T0.2. **Fix Server FMC Engine Missing `aircraft` Field**

  **What to do:**
  - Open `server/src/fmc-engine.ts`
  - Navigate to `createDefaultState()` method (line ~17)
  - Add missing `aircraft` field to match `FMCState` interface:
    - `aircraft: 'BOEING_737'`
  - Verify against `shared/src/types/fmc.ts` lines 203-230
  - **Note:** Tutorial fields (`tutorialActive`, `tutorialScenario`, etc.) are frontend-only and NOT part of the shared `FMCState` interface. Do NOT add them to server state.

  **Must NOT do:**
  - Do NOT change the `FMCState` interface
  - Do NOT add tutorial fields to server state (not in interface)

  **Recommended Agent Profile:**
  - **Category**: `quick`
  - **Skills**: []
  - Reason: Simple field addition, matching existing interface

  **Parallelization:**
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Phase 0 (with T0.1, T0.3, T0.4)
  - **Blocks**: T5.x (MSFS backend)
  - **Blocked By**: None

  **References:**
  - Server file: `server/src/fmc-engine.ts:17`
  - FMCState interface: `shared/src/types/fmc.ts:203-230`

  **Acceptance Criteria:**
  - [ ] `npm run typecheck -w server` shows 0 errors
  - [ ] `aircraft` field present in server default state

  **QA Scenarios:**
  ```
  Scenario: Server TypeScript compiles cleanly
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run `npm run typecheck -w server`
      2. Assert exit code is 0
      3. Assert no errors in output
    Expected Result: TypeScript compilation succeeds with 0 errors
    Failure Indicators: Error: "Property 'aircraft' is missing in type..."
    Evidence: .sisyphus/evidence/task-t02-server-typecheck.txt
  ```

  **Commit**: YES
  - Message: `fix(server): add missing aircraft field to default state`
  - Files: `server/src/fmc-engine.ts`

---

- [ ] T0.3. **Fix Null Renderer Invocation**

  **What to do:**
  - Open `server/src/fmc-engine.ts`
  - Navigate to `getDisplayData()` method (line ~41)
  - Add null check before invoking renderer:
    ```typescript
    const renderer = getPageRenderer(this.state.currentPage);
    if (!renderer) {
      const fallback = getPageRenderer('MENU');
      return fallback ? fallback(this.state) : { lines: [], title: 'ERROR', lskActions: {} };
    }
    return renderer(this.state);
    ```

  **Must NOT do:**
  - Do not change `getPageRenderer` signature in shared code
  - Do not add new page types

  **Recommended Agent Profile:**
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization:**
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Phase 0 (with T0.1, T0.2, T0.4)
  - **Blocks**: None
  - **Blocked By**: None

  **References:**
  - Server file: `server/src/fmc-engine.ts:41-44`
  - Page registry: `shared/src/fmc/pages/index.ts:13-30`

  **Acceptance Criteria:**
  - [ ] `npm run typecheck -w server` shows 0 errors
  - [ ] `getDisplayData()` handles null renderer gracefully

  **QA Scenarios:**
  ```
  Scenario: Invalid page type handled gracefully
    Tool: Bash (curl)
    Preconditions: Server running on localhost:8080
    Steps:
      1. Send invalid page request to server
      2. Assert response contains MENU page data or error page
      3. Assert no server crash
    Expected Result: Server returns fallback page, no crash
    Failure Indicators: Server crashes with "TypeError: renderer is not a function"
    Evidence: .sisyphus/evidence/task-t03-null-renderer.txt
  ```

  **Commit**: YES
  - Message: `fix(server): add null check for page renderer`
  - Files: `server/src/fmc-engine.ts`

---

- [ ] T0.4. **Fix npm Audit Vulnerabilities**

  **What to do:**
  - Run `npm audit` to see vulnerability details
  - Run `npm audit fix` to auto-fix moderate issues
  - If any high/critical remain, evaluate manually:
    - Check if vulnerability affects production code
    - Update specific package if safe
    - Document any that cannot be fixed
  - Verify build still works after updates

  **Must NOT do:**
  - Do not use `npm audit fix --force` (may break dependencies)
  - Do not ignore high/critical vulnerabilities without documentation

  **Recommended Agent Profile:**
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization:**
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Phase 0 (with T0.1, T0.2, T0.3)
  - **Blocks**: None
  - **Blocked By**: None

  **References:**
  - Package file: `package.json`

  **Acceptance Criteria:**
  - [ ] `npm audit` shows 0 moderate+ vulnerabilities OR documented exceptions
  - [ ] `npm run build` still succeeds after updates
  - [ ] `npm run typecheck:all` still passes

  **QA Scenarios:**
  ```
  Scenario: npm audit is clean
    Tool: Bash
    Steps:
      1. Run `npm audit --json`
      2. Parse JSON for vulnerabilities.severity >= moderate
      3. Assert count is 0 or all have "reason_to_ignore" field
    Expected Result: Clean audit or documented exceptions
    Evidence: .sisyphus/evidence/task-t04-npm-audit.json
  ```

  **Commit**: YES
  - Message: `chore(deps): fix npm audit vulnerabilities`
  - Files: `package.json`, `package-lock.json`

---

- [ ] T0.5. **Verify Full TypeScript Compilation**

  **What to do:**
  - Run `npm run typecheck:all` across all workspaces
  - Fix any remaining TypeScript errors (not already addressed in T0.1-0.4)
  - Document any errors that require complex fixes (defer to later phases)
  - Ensure `npm run build` produces clean output

  **Must NOT do:**
  - Do not ignore errors by using `@ts-ignore`
  - Do not defer simple fixes (if fix is <5 lines, do it now)

  **Recommended Agent Profile:**
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization:**
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential after T0.1-0.4
  - **Blocks**: ALL Phase 1+ tasks
  - **Blocked By**: T0.1, T0.2, T0.3, T0.4

  **Acceptance Criteria:**
  - [ ] `npm run typecheck:all` exits with code 0
  - [ ] `npm run build` completes with 0 errors
  - [ ] Documented list of any deferred errors with ticket numbers

  **QA Scenarios:**
  ```
  Scenario: Full compilation passes
    Tool: Bash
    Steps:
      1. Run `npm run typecheck:all`
      2. Assert exit code 0
      3. Run `npm run build`
      4. Assert dist/ directory created with expected files
    Expected Result: Both commands succeed
    Evidence: .sisyphus/evidence/task-t05-full-build.txt
  ```

  **Commit**: YES
  - Message: `chore(build): verify clean TypeScript compilation`
  - Files: Any files fixed during verification

---

## PHASE 1: Display Engine Foundation

- [ ] T1.1. **Implement Unified Color Token System**

  **What to do:**
  - Create `shared/src/fmc/displayColors.ts` defining color tokens for BOTH Boeing and Airbus
  - Define TypeScript union type: `DisplayColor = 'cyan' | 'green' | 'magenta' | 'white' | ...`
  - Map colors to Tailwind classes AND hex values
  - Update `DisplayLine` interface to include `color?: DisplayColor`
  - Update `DisplayLine` component to apply color classes

  **Must NOT do:**
  - Do NOT hardcode hex values in page renderers
  - Do NOT change existing `text-cdu-text` usage yet (Phase 2 will migrate)

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 1 (with T1.2-T1.5)
  **Blocks**: T2.1, T2.5, T3.1-T3.5
  **Blocked By**: T0.5

  **Acceptance Criteria:**
  - [ ] New file created with all color tokens
  - [ ] `DisplayLine` interface updated with `color` field
  - [ ] All colors visible in test page

  **QA Scenarios:**
  ```
  Scenario: All color tokens render distinctly
    Tool: Playwright
    Preconditions: App running, dev test page showing all colors
    Steps:
      1. Navigate to test page at /test/colors
      2. Wait for all color swatches to render (timeout: 5s)
      3. Screenshot the page
      4. Assert each color label visible and distinct from others
    Expected Result: All 10 colors visible with no rendering errors, text color differs per swatch
    Failure Indicators: All swatches same color, missing colors, or CSS errors
    Evidence: .sisyphus/evidence/task-t11-color-tokens.png
  ```

  **Commit**: `feat(display): add unified color token system`

---

- [ ] T1.2. **Source Open-Source Aviation Font**

  **What to do:**
  - Research open-source monospace fonts suitable for aviation displays
  - Select font with: fixed-width, clear 0/O distinction, good at small sizes
  - Add to `public/fonts/` or use Google Fonts CDN
  - Update Tailwind config `fontFamily.cdu`

  **Must NOT do:**
  - Do NOT use proprietary Boeing/Airbus font files

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 1 (with T1.1, T1.3-T1.5)
  **Blocks**: T2.1-T2.5, T3.1-T3.5
  **Blocked By**: T0.5

  **References:**
  - Tailwind config: `tailwind.config.ts:20-22`
    - Display component: `src/components/CDU/Display.tsx:18`

  **Acceptance Criteria:**
  - [ ] Font chosen with documented license (MIT/OFL)
  - [ ] Font renders at 11px and 9px without blur/artifacts
  - [ ] Character width is consistent (all chars same width)
  - [ ] 0/O and 1/l/I are visually distinct

  **QA Scenarios:**
  ```
  Scenario: Font renders at small sizes with character distinction
    Tool: Playwright
    Preconditions: App running on localhost:5173, IDENT page visible
    Steps:
      1. Navigate to IDENT page
      2. Wait for page to render (timeout: 3s)
      3. Screenshot display area
      4. OCR or assert text "737-800" visible with zero slashed and O distinct
      5. Assert text "26K" has 2 and 6 distinguishable
    Expected Result: All text crisp at 11px, 0 vs O clearly different glyphs
    Failure Indicators: Blurry text, 0 and O look identical, inconsistent widths
    Evidence: .sisyphus/evidence/task-t12-font-render.png
  ```

  **Commit**: `feat(display): add aviation-appropriate monospace font`

---

- [ ] T1.3. **Refactor Display/DisplayLine for Color Support**

  **What to do:**
  - Update `DisplayLine.tsx` to accept and apply `color` prop
  - Support all colors from T1.1 token system
  - Maintain backward compatibility (default green for Boeing)
  - Add `colorClass` helper mapping color name to Tailwind class
  - Update `Display.tsx` to pass color from displayData

  **Must NOT do:**
  - Do NOT remove existing `inverse` prop support
  - Do NOT change default behavior (Boeing stays green by default)

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 1 (with T1.1-T1.2, T1.4-T1.5)
  **Blocks**: T2.1-T2.5, T3.1-T3.5
  **Blocked By**: T0.5

  **References:**
  - DisplayLine: `src/components/CDU/DisplayLine.tsx`
    - Display: `src/components/CDU/Display.tsx`
    - Color tokens: `shared/src/fmc/displayColors.ts` (from T1.1)

  **Acceptance Criteria:**
  - [ ] `DisplayLine` accepts `color` prop
  - [ ] All colors from token system render correctly
  - [ ] Inverse video works with colored text
  - [ ] Default behavior unchanged (existing pages still green)

  **QA Scenarios:**
  ```
  Scenario: DisplayLine shows colors correctly and inverse video works
    Tool: Playwright
    Preconditions: App running, test page with colored + inverse lines
    Steps:
      1. Navigate to test page at /test/display
      2. Wait for render (timeout: 3s)
      3. Assert line 1 has color class text-cdu-cyan
      4. Assert line 2 has color class text-cdu-magenta AND bg class for inverse
      5. Assert line 3 uses default green (backward compat)
      6. Screenshot for visual verification
    Expected Result: Cyan text visible, inverse magenta line visible, default green unchanged
    Failure Indicators: All lines same color, inverse broken, console errors
    Evidence: .sisyphus/evidence/task-t13-display-color.png
  ```

  **Commit**: `feat(display): add color support to DisplayLine`

---

- [ ] T1.4. **Add Text Styling Utilities**

  **What to do:**
  - Create `shared/src/fmc/textFormat.ts` with utility functions:
    - `colored(text, color)`, `coloredInverse(text, color)`
    - `header(text)`, `label(text)`, `data(text, color?)`
  - Update existing `fmt()`, `inverse()`, `blank()` to optionally use new utilities

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 1 (with T1.1-T1.3, T1.5)
  **Blocks**: T2.5, T3.5
  **Blocked By**: T0.5

  **Acceptance Criteria:**
  - [ ] New file `shared/src/fmc/textFormat.ts` created
  - [ ] All utility functions have unit tests
  - [ ] Functions return correct DisplayLine structure
  - [ ] Backward compatibility maintained

  **QA Scenarios:**
  ```
  Scenario: Text utilities produce correct DisplayLine objects
    Tool: Bash (node REPL)
    Preconditions: Build succeeds
    Steps:
      1. Run `node -e "const { colored, coloredInverse, header } = require('./shared/dist/fmc/textFormat.js')"`
      2. Test colored("TEST", "cyan") returns { text: "TEST              ", color: "cyan", inverse: false }
      3. Test coloredInverse("HDR", "white") returns { text: "HDR               ", color: "white", inverse: true }
      4. Test header("TITLE") returns text padded to 24 chars, color: "cyan", inverse: true
    Expected Result: All utilities return correct structure with 24-char padding
    Failure Indicators: Wrong properties, missing padding, incorrect color mapping
    Evidence: .sisyphus/evidence/task-t14-text-utils.txt
  ```

  **Commit**: `feat(display): add text formatting utilities`

---

- [ ] T1.5. **Update Tailwind Config with New Tokens**

  **What to do:**
  - Add Boeing colors: `cdu-cyan`, `cdu-magenta`, `cdu-white`, `cdu-shaded`
  - Add Airbus colors: `cdu-blue`, `cdu-airbus-amber`
  - Add font token for aviation font (from T1.2)
  - Ensure all tokens are in `theme.extend`

  **Category**: `quick`
  **Parallel Group**: Phase 1 (with T1.1-T1.4)
  **Blocks**: T2.1-T2.5, T3.1-T3.5
  **Blocked By**: T0.5

  **Acceptance Criteria:**
  - [ ] All new color tokens in Tailwind config
  - [ ] Build succeeds with new tokens
  - [ ] No CSS class collisions

  **QA Scenarios:**
  ```
  Scenario: Tailwind builds with new tokens and CSS contains them
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run `npm run build`
      2. Assert exit code 0
      3. Search `dist/assets/*.css` for "cdu-cyan"
      4. Search `dist/assets/*.css` for "cdu-magenta"
      5. Search `dist/assets/*.css` for "cdu-blue"
    Expected Result: Build succeeds, CSS contains all new color class definitions
    Failure Indicators: Build fails, CSS missing new tokens, class name collisions
    Evidence: .sisyphus/evidence/task-t15-tailwind-build.txt
  ```

  **Commit**: `feat(config): add aviation color tokens to Tailwind`

---

## PHASE 2: Boeing Visual Accuracy

- [ ] T2.1. **Apply Multi-Color Display to Boeing Pages**

  **What to do:**
  - Update all Boeing page renderers in `shared/src/fmc/pages/`:
    - IDENT: cyan header, white labels, green data
    - POS INIT: cyan header, white labels, green data
    - RTE: cyan header, white labels, green data, magenta modifications
    - DEP/ARR: cyan header, white labels, green selections
    - PERF INIT: cyan header, white labels, green data
    - THRUST LIM: cyan header, white labels, green selections
    - TAKEOFF REF: cyan header, white labels, green data, magenta modifications
    - LEGS: cyan header, white labels, green waypoints, magenta constraints
    - PROGRESS: cyan header, white labels, green data
    - HOLD/FIX/MENU: cyan header, white labels
  - Use text utilities from T1.4
  - Update `renderIdentPage()`, `renderPosInitPage()`, etc.

  **Must NOT do:**
  - Do NOT change page logic or data handling (only visual)
  - Do NOT remove existing inverse video

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 2 (with T2.2-T2.5)
  **Blocks**: T4.1
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] All 12 Boeing pages show correct colors
  - [ ] Headers are cyan + inverse
  - [ ] Labels are white
  - [ ] Data values are green
  - [ ] Modified values are magenta

  **QA Scenarios:**
  ```
  Scenario: All Boeing pages show correct multi-color display
    Tool: Playwright
    Preconditions: App running on localhost:5173, Boeing mode active
    Steps:
      1. Navigate to IDENT page, screenshot display area
      2. Assert header line has cyan color and inverse styling
      3. Assert label "MODEL" has white color
      4. Assert data "737-800" has green color
      5. Navigate to RTE page
      6. Enter "KJFK" in origin field, press LSK L1
      7. Assert "KJFK" displays in magenta (modified)
      8. Navigate to LEGS page
      9. Assert waypoint constraints show magenta color
    Expected Result: All pages show correct color scheme per Boeing FCOM
    Failure Indicators: All text green, missing cyan headers, no magenta for modifications
    Evidence: .sisyphus/evidence/task-t21-boeing-colors.png
  ```

  **Commit**: `feat(boeing): apply multi-color display to all pages`

---

- [ ] T2.2. **Add Missing 7 Function Keys**

  **What to do:**
  - Update `CDU.tsx` to add missing function keys:
    - Row 1: INIT REF, RTE, **CLB**, **CRZ**, **DES**, LEGS
    - Row 2: **DIR INTC/MENU**, DEP ARR, **HOLD**, PERF, PROG, **N1 LIMIT**, **FIX**
    - Row 3: (existing) PREV, NEXT, EXEC, etc.
  - Add corresponding `CDUKey` types in `shared/src/types/fmc.ts`
  - Add page navigation logic in `useFMCStore.ts`
  - Add page renderers for new pages (CLB, CRZ, DES, N1 LIMIT, FIX) - can be basic stubs
  - Ensure responsive layout works with more keys

  **Must NOT do:**
  - Do NOT remove existing keys
  - Do NOT change key positions of existing keys

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 2 (with T2.1, T2.3-T2.5)
  **Blocks**: None
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] All 14 function keys visible in Boeing CDU
  - [ ] Each key navigates to correct page (or shows placeholder)
  - [ ] Layout is responsive (works on mobile/tablet)
  - [ ] Touch targets >= 44px

  **QA Scenarios:**
  ```
  Scenario: All 14 function keys navigate to correct pages
    Tool: Playwright
    Preconditions: App running, Boeing mode, on IDENT page
    Steps:
      1. Click "INIT REF" → assert page shows "POS INIT"
      2. Click "RTE" → assert page shows "RTE"
      3. Click "CLB" → assert page shows "CLB" (or placeholder)
      4. Click "CRZ" → assert page shows "CRZ" (or placeholder)
      5. Click "DES" → assert page shows "DES" (or placeholder)
      6. Click "DIR INTC" → assert page shows "DIR INTC" (or placeholder)
      7. Click "LEGS" → assert page shows "LEGS"
      8. Click "DEP ARR" → assert page shows "DEP/ARR"
      9. Click "HOLD" → assert page shows "HOLD"
      10. Click "PERF" → assert page shows "PERF INIT"
      11. Click "PROG" → assert page shows "PROGRESS"
      12. Click "N1 LIMIT" → assert page shows "N1 LIMIT" (or placeholder)
      13. Click "FIX" → assert page shows "FIX"
      14. Click "MENU" → assert page shows "MENU"
    Expected Result: All 14 keys navigate, no page crash, all pages render
    Failure Indicators: Missing keys, keys not clickable, page crash, wrong page loaded
    Evidence: .sisyphus/evidence/task-t22-function-keys.png
  ```

  **Commit**: `feat(boeing): add missing function keys (CLB, CRZ, DES, etc.)`

---

- [ ] T2.3. **Reorganize Boeing Keypad Layout**

  **What to do:**
  - Update `KeypadGrid` in `CDU.tsx` to match real CDU layout:
    - Numeric keys (1-9, ., 0, +/-) in standard telephone layout
    - Alphabetic keys (A-Z) in standard CDU layout
    - Action keys (/, CLR, SP, DEL, EXEC) in correct positions
    - NEXT/PREV page keys in correct positions
  - Ensure touch targets remain >= 44px
  - Maintain responsive design

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 2 (with T2.1-T2.2, T2.4-T2.5)
  **Blocks**: None
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] Keypad layout matches real CDU arrangement
  - [ ] All keys functional
  - [ ] Touch targets >= 44px
  - [ ] Responsive on all screen sizes

  **QA Scenarios:**
  ```
  Scenario: Keypad layout matches real Boeing CDU arrangement
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Screenshot full CDU including keypad
      2. Assert numeric keys 1-9 in standard telephone layout
      3. Assert alpha keys A-Z in correct CDU layout
      4. Assert action keys (/, CLR, SP, DEL, EXEC) in correct positions
      5. Assert NEXT/PREV page keys present
      6. Measure touch targets: assert all >= 44px width and height
      7. Test responsive: resize to 420px width, assert keypad still usable
    Expected Result: Keypad layout matches real CDU photo from b737.org.uk
    Failure Indicators: Wrong key positions, keys too small, layout breaks on mobile
    Evidence: .sisyphus/evidence/task-t23-keypad-layout.png
  ```

  **Commit**: `feat(boeing): reorganize keypad to match real CDU layout`

---

- [ ] T2.4. **Improve Bezel Styling**

  **What to do:**
  - Update bezel styling in `CDU.tsx`:
    - Add subtle 3D depth effect (box-shadow, gradient)
    - Make corners less rounded (real CDU has straight edges)
    - Add subtle metallic sheen effect
    - Improve screen bezel (inner shadow for depth)
  - Update `AirbusCDU.tsx` similarly with Airbus-specific styling
  - Use CSS-only (no images needed)

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 2 (with T2.1-T2.3, T2.5)
  **Blocks**: T3.4
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] Bezel has realistic depth/shadow
  - [ ] Corners match real hardware (straight for Boeing)
  - [ ] Metallic appearance visible
  - [ ] No performance impact (no layout thrashing)

  **QA Scenarios:**
  ```
  Scenario: Bezel has realistic depth and matches real hardware
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Screenshot full CDU unit
      2. Assert bezel has box-shadow or gradient (not flat)
      3. Assert corners are straight (not rounded like current)
      4. Assert screen area has inner shadow for depth
      5. Compare screenshot to real CDU photo from b737.org.uk
      6. Assert no layout thrashing (check Performance tab for paint events)
    Expected Result: Bezel shows 3D depth, straight edges, realistic appearance
    Failure Indicators: Flat appearance, rounded corners, performance issues
    Evidence: .sisyphus/evidence/task-t24-bezel-style.png
  ```

  **Commit**: `feat(ui): improve CDU bezel styling with depth effects`

---

- [ ] T2.5. **Update Boeing Page Renderers with New Utilities**

  **What to do:**
  - Migrate all Boeing page renderers to use `textFormat.ts` utilities from T1.4
  - Replace raw `fmt()`, `inverse()`, `blank()` calls with new utilities
  - Ensure all pages use correct colors from token system
  - Verify no visual regressions

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 2 (with T2.1-T2.4)
  **Blocks**: T4.1
  **Blocked By**: T1.4

  **Acceptance Criteria:**
  - [ ] All Boeing renderers use text utilities
  - [ ] No visual regressions
  - [ ] TypeScript compiles cleanly

  **QA Scenarios:**
  ```
  Scenario: Boeing page renderers migrated without visual regressions
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Navigate to IDENT page, screenshot
      2. Navigate to POS INIT page, screenshot
      3. Navigate to RTE page, screenshot
      4. Navigate to PERF INIT page, screenshot
      5. Navigate to TAKEOFF REF page, screenshot
      6. Compare each screenshot to reference images
      7. Assert text content identical
      8. Assert colors identical
      9. Assert line count = 14 on each page
      10. Assert line width = 24 chars on each page
    Expected Result: All pages identical to pre-migration, no visual differences
    Failure Indicators: Text changed, colors wrong, missing lines, line overflow
    Evidence: .sisyphus/evidence/task-t25-boeing-migration.png
  ```

  **Commit**: `refactor(boeing): migrate page renderers to text utilities`

---

## PHASE 3: Airbus Visual Accuracy

- [ ] T3.1. **Correct Airbus Function Key Labels**

  **What to do:**
  - Update `AirbusCDU.tsx` to change function key labels:
    - "AIR PORT" → "INIT" (or "DIR")
    - "F-PLN" → keep (correct)
    - "PERF" → keep (correct)
    - "PROG" → keep (correct)
    - "RAD NAV" → keep (correct)
    - "MCDU MENU" → "DATA" (or add proper MCDU MENU access)
  - Verify all labels match real A320 MCDU
  - Add missing keys if needed (e.g., DIR, SEC F-PLN access)

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 3 (with T3.2-T3.5)
  **Blocks**: None
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] All labels match real A320 MCDU
  - [ ] Navigation works correctly
  - [ ] No visual regressions

  **QA Scenarios:**
  ```
  Scenario: Airbus function key labels match real A320 MCDU
    Tool: Playwright
    Preconditions: App running, Airbus mode selected
    Steps:
      1. Screenshot Airbus CDU function key area
      2. Assert button labels visible: "INIT", "F-PLN", "PERF", "PROG", "RAD NAV", "DATA"
      3. Assert "AIR PORT" label NOT present
      4. Assert "MCDU MENU" label NOT present as direct key
      5. Click each function key, assert navigation works
      6. Compare screenshot to real MCDU photo from commons.wikimedia.org
    Expected Result: Labels match real A320 MCDU, old incorrect labels removed
    Failure Indicators: Old labels still present, wrong labels visible, navigation broken
    Evidence: .sisyphus/evidence/task-t31-airbus-labels.png
  ```

  **Commit**: `feat(airbus): correct function key labels to match real MCDU`

---

- [ ] T3.2. **Implement Airbus Color-Coded Semantics**

  **What to do:**
  - Update all Airbus page renderers with color semantics:
    - White = titles/advisories
    - Blue = modifiable/selectable data
    - Green = active/non-modifiable data
    - Amber = mandatory/important messages
    - Magenta = constraints
  - Update `Display.tsx` to support Airbus color mode
  - Update `Scratchpad` for Airbus amber error messages
  - Update page renderers: INIT A, INIT B, F-PLN, PERF, PROG, RAD NAV

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 3 (with T3.1, T3.3-T3.5)
  **Blocks**: T4.1
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] All Airbus pages use correct color semantics
  - [ ] White titles, blue modifiable, green active, amber important, magenta constraints
  - [ ] Scratchpad shows amber for errors

  **QA Scenarios:**
  ```
  Scenario: Airbus pages show correct color-coded semantics
    Tool: Playwright
    Preconditions: App running, Airbus mode
    Steps:
      1. Navigate to INIT A page
      2. Assert title "INIT" in white
      3. Assert "FROM/TO" label in white
      4. Assert editable fields show blue color
      5. Assert non-editable data shows green
      6. Enter invalid data, assert scratchpad shows amber error
      7. Navigate to F-PLN page
      8. Assert constraint fields show magenta
      9. Screenshot each page for verification
    Expected Result: White titles, blue editable, green active, amber errors, magenta constraints
    Failure Indicators: All text amber, no color differentiation, wrong color assignments
    Evidence: .sisyphus/evidence/task-t32-airbus-colors.png
  ```

  **Commit**: `feat(airbus): implement color-coded semantics`

---

- [ ] T3.3. **Complete Missing Airbus Pages**

  **What to do:**
  - Implement missing Airbus pages (currently stubs):
    - INIT B: Complete with all fields (ZFW, BLOCK, CG, etc.)
    - PERF TAKEOFF: Add all fields (V1, VR, V2, FLAPS, FLEX, etc.)
    - PERF APPR: Add all fields (QNH, TEMP, WIND, MDA, DH, etc.)
    - RAD NAV: Add actual VOR/ADF tuning functionality
    - FUEL PRED: Add fuel prediction calculations
  - Update `getAirbusPageRenderer()` registry
  - Add LSK actions for new fields

  **Must NOT do:**
  - Do NOT implement complex calculations (use simple math or placeholders)
  - Do NOT add new page types beyond existing registry

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 3 (with T3.1-T3.2, T3.4-T3.5)
  **Blocks**: T4.1
  **Blocked By**: T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] INIT B shows all fields and accepts input
  - [ ] PERF pages show all fields
  - [ ] RAD NAV allows VOR/ADF entry
  - [ ] All pages render without errors

  **QA Scenarios:**
  ```
  Scenario: Missing Airbus pages render with all fields
    Tool: Playwright
    Preconditions: App running, Airbus mode
    Steps:
      1. Navigate to INIT B page
      2. Assert fields visible: ZFW, BLOCK, CG
      3. Enter test data in each field, assert state updates
      4. Navigate to PERF TAKEOFF page
      5. Assert fields visible: V1, VR, V2, FLAPS, FLEX TO TEMP
      6. Navigate to PERF APPR page
      7. Assert fields visible: QNH, TEMP, WIND, MDA, DH
      8. Navigate to RAD NAV page
      9. Assert VOR 1/2 and ADF 1/2 fields visible
      10. Navigate to FUEL PRED page
      11. Assert FOB, EXTRA, MIN DEST FOB visible
    Expected Result: All pages render, fields visible, data entry works
    Failure Indicators: Blank pages, missing fields, crashes, data not saved
    Evidence: .sisyphus/evidence/task-t33-airbus-pages.png
  ```

  **Commit**: `feat(airbus): complete missing page implementations`

---

- [ ] T3.4. **Fix Airbus MCDU MENU Styling**

  **What to do:**
  - Fix the MENU page crash (from T0.1)
  - Apply proper styling to MENU page:
    - Correct header formatting
    - Proper LSK labels
    - Correct color (amber for Airbus)
    - Menu items clearly listed
  - Ensure menu navigation works correctly

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 3 (with T3.1-T3.3, T3.5)
  **Blocks**: None
  **Blocked By**: T0.1, T1.1-T1.5

  **Acceptance Criteria:**
  - [ ] MENU page renders without crash
  - [ ] All menu items visible
  - [ ] LSK navigation works
  - [ ] Correct amber color

  **QA Scenarios:**
  ```
  Scenario: Airbus MCDU MENU page renders and navigates correctly
    Tool: Playwright
    Preconditions: App running, Airbus mode
    Steps:
      1. Click "MCDU MENU" function key (or navigate to MENU page)
      2. Wait for page render (timeout: 3s)
      3. Assert page title "MCDU MENU" visible in header
      4. Assert menu items visible: INIT, F-PLN, PERF, FUEL PRED, SEC F-PLN, RAD NAV
      5. Assert no console errors
      6. Click LSK next to "INIT", assert navigates to INIT A page
      7. Return to MENU, click LSK next to "F-PLN", assert navigates to F-PLN page
    Expected Result: MENU page renders without crash, navigation works, amber color
    Failure Indicators: Blank screen, console errors, crash, wrong navigation
    Evidence: .sisyphus/evidence/task-t34-airbus-menu.png
  ```

  **Commit**: `fix(airbus): fix and style MCDU MENU page`

---

- [ ] T3.5. **Update Airbus Page Renderers with New Utilities**

  **What to do:**
  - Migrate all Airbus page renderers to use `textFormat.ts` utilities from T1.4
  - Replace raw `fmt()`, `inv()`, `blank()` calls with new utilities
  - Ensure all pages use correct colors from token system
  - Verify no visual regressions

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 3 (with T3.1-T3.4)
  **Blocks**: T4.1
  **Blocked By**: T1.4

  **Acceptance Criteria:**
  - [ ] All Airbus renderers use text utilities
  - [ ] No visual regressions
  - [ ] TypeScript compiles cleanly

  **QA Scenarios:**
  ```
  Scenario: Airbus page renderers migrated without visual regressions
    Tool: Playwright
    Preconditions: App running, Airbus mode
    Steps:
      1. Navigate to INIT A page, screenshot
      2. Navigate to INIT B page, screenshot
      3. Navigate to F-PLN page, screenshot
      4. Navigate to PERF TAKEOFF page, screenshot
      5. Navigate to PROG page, screenshot
      6. Compare each to reference screenshots
      7. Assert text content identical
      8. Assert colors identical
      9. Assert line count = 14
      10. Assert line width = 24 chars
    Expected Result: All pages identical to pre-migration
    Failure Indicators: Text changed, colors wrong, missing content
    Evidence: .sisyphus/evidence/task-t35-airbus-migration.png
  ```

  **Commit**: `refactor(airbus): migrate page renderers to text utilities`

---

## PHASE 4: Functional Improvements

- [ ] T4.1. **Implement Input Validation Framework**

  **What to do:**
  - Create `shared/src/fmc/validation.ts` with validation functions:
    - `isValidICAO(code)` - 4-letter airport code
    - `isValidWaypoint(ident)` - 2-5 character waypoint
    - `isValidFlightNumber(flt)` - airline code + numbers
    - `isValidAltitude(alt)` - reasonable range (0-50000)
    - `isValidSpeed(spd)` - reasonable range (50-500)
    - `isValidTemperature(temp)` - reasonable range (-60 to +60)
    - `isValidVSpeeds(v1, vr, v2)` - validates V1 < VR < V2
  - Return error messages suitable for scratchpad display
  - Export validators for use in store actions

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.2-T4.7)
  **Blocks**: T4.2-T4.7
  **Blocked By**: T2.1-T2.5, T3.1-T3.5

  **Acceptance Criteria:**
  - [ ] All validators have unit tests
  - [ ] Validators return clear error messages
  - [ ] Edge cases handled (empty, too long, invalid chars)

  **QA Scenarios:**
  ```
  Scenario: All validators return correct results for valid and invalid inputs
    Tool: Bash (node REPL)
    Preconditions: Build succeeds
    Steps:
      1. Import validators: isValidICAO, isValidAltitude, isValidSpeed, isValidVSpeeds
      2. Test isValidICAO("KJFK") → assert returns true
      3. Test isValidICAO("INVALID") → assert returns false with error message
      4. Test isValidAltitude("350") → assert returns true
      5. Test isValidAltitude("999") → assert returns false (out of range)
      6. Test isValidSpeed("250") → assert returns true
      7. Test isValidSpeed("10") → assert returns false (too low)
      8. Test isValidVSpeeds(135, 140, 145) → assert returns true
      9. Test isValidVSpeeds(150, 140, 145) → assert returns false (V1 > VR)
    Expected Result: All validators correctly identify valid/invalid inputs
    Failure Indicators: Valid input rejected, invalid input accepted, wrong error message
    Evidence: .sisyphus/evidence/task-t41-validation-framework.txt
  ```

  **Commit**: `feat(validation): add input validation framework`

---

- [ ] T4.2. **Apply Input Validation to Data Entry**

  **What to do:**
  - Update `useFMCStore.ts` `pressLSK()` to validate inputs before setting state
  - For each LSK action:
    - `set_origin`: validate ICAO
    - `set_dest`: validate ICAO
    - `set_flt_no`: validate flight number
    - `set_crz_alt`: validate altitude
    - `set_v1`/`set_vr`/`set_v2`: validate speeds + cross-field check
    - `set_oat`: validate temperature
    - etc.
  - On validation failure: show error in scratchpad, do not update state
  - On success: clear scratchpad, update state, light EXEC

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.1, T4.3-T4.7)
  **Blocks**: None
  **Blocked By**: T4.1

  **Acceptance Criteria:**
  - [ ] Invalid ICAO shows "INVALID ENTRY" in scratchpad
  - [ ] Invalid altitude shows "OUT OF RANGE"
  - [ ] V1 > VR shows "INVALID V-SPEEDS"
  - [ ] Valid inputs update state correctly

  **QA Scenarios:**
  ```
  Scenario: Input validation shows errors in scratchpad for invalid entries
    Tool: Playwright
    Preconditions: App running, Boeing mode, on POS INIT page
    Steps:
      1. Type "INVALID" in scratchpad
      2. Press LSK L1 (set ref airport)
      3. Assert scratchpad shows "INVALID ENTRY"
      4. Type "350" in scratchpad
      5. Press LSK L1 on PERF INIT page (set crz alt)
      6. Assert state updates to crzAlt = 35000
      7. Type "999" in scratchpad
      8. Press LSK L1 on PERF INIT page
      9. Assert scratchpad shows "OUT OF RANGE"
      10. Navigate to TAKEOFF REF
      11. Type "150" for V1, press R1
      12. Type "140" for VR, press R2
      13. Assert scratchpad shows "INVALID V-SPEEDS" (V1 > VR)
    Expected Result: Invalid inputs rejected with clear error messages, valid inputs accepted
    Failure Indicators: No error shown, state updated with invalid data, wrong error message
    Evidence: .sisyphus/evidence/task-t42-store-validation.png
  ```

  **Commit**: `feat(store): apply input validation to all data entry`

---

- [ ] T4.3. **Wire Up LEGS Page Waypoint Editing**

  **What to do:**
  - Implement `editWaypoint()` action in `useFMCStore.ts`
  - Allow: insert waypoint, delete waypoint, modify constraints
  - Update `renderLegsPage()` to show editable fields
  - Add LSK actions for waypoint editing
  - Handle discontinuities (add/remove)
  - Add page for waypoint details (altitude, speed constraints)

  **Must NOT do:**
  - Do NOT implement complex route optimization
  - Do NOT add map visualization

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.1-T4.2, T4.4-T4.7)
  **Blocks**: None
  **Blocked By**: T4.1

  **Acceptance Criteria:**
  - [ ] Can delete waypoint from LEGS page
  - [ ] Can insert new waypoint
  - [ ] Can modify altitude/speed constraints
  - [ ] Discontinuities handled correctly

  **QA Scenarios:**
  ```
  Scenario: LEGS page allows waypoint CRUD operations
    Tool: Playwright
    Preconditions: App running, Boeing mode, flight plan with waypoints loaded
    Steps:
      1. Navigate to LEGS page
      2. Assert waypoints visible (RBV, DIXIE, AML, etc.)
      3. Press LSK next to first waypoint
      4. Assert waypoint detail/edit mode activated
      5. Type "FL250" for altitude constraint, press EXEC
      6. Assert constraint updated on LEGS page
      7. Press DELETE key + LSK next to waypoint
      8. Assert waypoint removed from list
      9. Type "NEWPT" in scratchpad, press INSERT key + LSK
      10. Assert new waypoint inserted
    Expected Result: Waypoints editable, deletable, insertable with constraints
    Failure Indicators: LSK actions null, no editing mode, state not updated
    Evidence: .sisyphus/evidence/task-t43-legs-editing.png
  ```

  **Commit**: `feat(legs): implement waypoint editing`

---

- [ ] T4.4. **Implement HOLD Page Functionality**

  **What to do:**
  - Update `renderHoldPage()` with editable fields:
    - FIX: waypoint identifier
    - INBOUND CRS: course (000-360)
    - LEG TIME: 1.0 min default
    - LEG DIST: optional distance
    - DIRECTION: L/R turn
  - Add input validation for fields
  - Store hold data in FMC state
  - Display hold in LEGS page

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.1-T4.3, T4.5-T4.7)
  **Blocks**: None
  **Blocked By**: T4.1

  **Acceptance Criteria:**
  - [ ] Can enter hold fix
  - [ ] Can set inbound course
  - [ ] Can set leg time
  - [ ] Hold appears in LEGS page

  **QA Scenarios:**
  ```
  Scenario: HOLD page allows creating and displaying hold patterns
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Navigate to HOLD page
      2. Assert fields visible: FIX, INBOUND CRS, LEG TIME, LEG DIST
      3. Type "RBV" in scratchpad, press L1 (set fix)
      4. Assert "RBV" displayed in FIX field
      5. Type "270" in scratchpad, press R1 (set inbound course)
      6. Assert "270" displayed in INBOUND CRS
      7. Assert default LEG TIME = "1.0 MIN"
      8. Navigate to LEGS page
      9. Assert hold pattern displayed with "HOLD AT RBV"
    Expected Result: Hold created, parameters saved, displayed in LEGS
    Failure Indicators: Fields not editable, data not saved, not shown in LEGS
    Evidence: .sisyphus/evidence/task-t44-hold-pattern.png
  ```

  **Commit**: `feat(hold): implement hold pattern creation`

---

- [ ] T4.5. **Implement FIX Page Functionality**

  **What to do:**
  - Update `renderFixPage()` with editable fields:
    - REF FIX: waypoint identifier
    - RAD/DIS: radial and distance
    - ABEAM PTS: show abeam waypoints
  - Add input validation
  - Calculate and display radial/distance information
  - Show nearby waypoints if applicable

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.1-T4.4, T4.6-T4.7)
  **Blocks**: None
  **Blocked By**: T4.1

  **Acceptance Criteria:**
  - [ ] Can enter reference fix
  - [ ] Can enter radial/distance
  - [ ] Calculations displayed correctly

  **QA Scenarios:**
  ```
  Scenario: FIX page calculates radial/distance from reference fix
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Navigate to FIX page
      2. Assert fields visible: REF FIX, RAD/DIS, ABEAM PTS
      3. Type "KJFK" in scratchpad, press L1 (set ref fix)
      4. Assert "KJFK" displayed
      5. Type "270/50" in scratchpad, press R1 (set radial/distance)
      6. Assert "270/50" displayed
      7. Assert ABEAM PTS calculated and displayed
      8. Verify calculation: point 50NM from KJFK on 270° radial
    Expected Result: Fix reference set, radial/distance calculated, abeam points shown
    Failure Indicators: No calculation, wrong values, fields not editable
    Evidence: .sisyphus/evidence/task-t45-fix-reference.png
  ```

  **Commit**: `feat(fix): implement fix reference functionality`

---

- [ ] T4.6. **Expand Navigation Database**

  **What to do:**
  - Expand `shared/src/fmc/airFMCData.ts`:
    - Add top 100 world airports (major hubs)
    - Add all US state airports (major airports per state)
    - Add common waypoints for major routes
    - Add common airways
    - Add major SIDs/STARs for top 20 airports
  - Keep data static (no external API required)
  - Ensure file size remains reasonable (< 500KB)
  - Add helper function: `getAirport(icao)`, `getWaypointsForRoute()`

  **Scope Lock:** Top 100 airports + US states only. No full worldwide database.

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.1-T4.5, T4.7)
  **Blocks**: T4.7
  **Blocked By**: None

  **Acceptance Criteria:**
  - [ ] Top 100 airports in database
  - [ ] All US states have major airports
    - [ ] Common waypoints for US routes
    - [ ] Major SIDs/STARs for top 20 airports
    - [ ] Helper functions work

  **QA Scenarios:**
  ```
  Scenario: Navigation database has airports and supports lookups
    Tool: Bash (node REPL)
    Preconditions: Build succeeds
    Steps:
      1. Import { AIRPORTS, WAYPOINTS, AIRWAYS } from database
      2. Assert Object.keys(AIRPORTS).length >= 100
      3. Assert AIRPORTS["KJFK"] exists with name, lat, lon, runways
      4. Assert AIRPORTS["KLAX"] exists
      5. Assert AIRPORTS["EGLL"] exists (international)
      6. Assert US state airports present: KSEA, KMIA, KORD, KATL, KSFO
      7. Assert WAYPOINTS["RBV"] exists with lat/lon
      8. Assert AIRWAYS["J42"] exists with waypoints array
      9. Test helper getAirport("KJFK") returns correct data
      10. Assert file size of airFMCData.ts < 500KB
    Expected Result: Top 100+ airports, US coverage, waypoints, airways, helpers work
    Failure Indicators: Missing airports, no US coverage, no helpers, file too large
    Evidence: .sisyphus/evidence/task-t46-nav-database.txt
  ```

  **Commit**: `feat(nav): expand navigation database`

---

- [ ] T4.7. **Integrate SimBrief Import UI**

  **What to do:**
  - Add "Import SimBrief" button to DemoWelcome or ConnectionStatus
  - Add input field for SimBrief pilot ID
  - Call SimBrief API: `https://www.simbrief.com/api/xml.fetcher.php?userid={id}&json=1`
  - Parse response using existing `simbriefParser.ts`
  - Load flight plan into FMC state
  - Show success/error message
  - Handle API errors gracefully

  **Scope Lock:** Basic import only (pilot ID → route). No weather, no OFP display.

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 4 (with T4.1-T4.6)
  **Blocks**: None
  **Blocked By**: T4.1

  **Acceptance Criteria:**
  - [ ] SimBrief button visible in UI
    - [ ] Can enter pilot ID
    - [ ] Flight plan loads from SimBrief
    - [ ] Route displayed in RTE page
    - [ ] Error handling for invalid ID/network error

  **QA Scenarios:**
  ```
  Scenario: SimBrief import loads flight plan into FMC
    Tool: Playwright + mock server
    Preconditions: App running, mock SimBrief API available
    Steps:
      1. Click "Import SimBrief" button in welcome modal
      2. Type pilot ID "12345" in input field
      3. Click "Import" button
      4. Mock API returns flight plan: KJFK→KDCA, route "RBV3 DCT DIXIE"
      5. Assert success message visible
      6. Navigate to RTE page
      7. Assert origin = "KJFK", destination = "KDCA"
      8. Assert route string = "RBV3 DCT DIXIE"
      9. Navigate to LEGS page
      10. Assert waypoints loaded from route
      11. Test error: enter invalid ID "99999"
      12. Assert error message in scratchpad
    Expected Result: Flight plan imports, route populated, errors handled
    Failure Indicators: No import button, API error not handled, data not loaded
    Evidence: .sisyphus/evidence/task-t47-simbrief-import.png
  ```

  **Commit**: `feat(integration): add SimBrief flight plan import`

---

## PHASE 5: MSFS Integration

- [ ] T5.1. **Install node-simconnect**

  **What to do:**
  - Install `node-simconnect` in server workspace
  - Verify compatibility with Node.js version
  - Add TypeScript types if needed
  - Test basic connection to MSFS (requires Windows + MSFS)

  **Must NOT do:**
  - Do NOT install if incompatible (document alternative)

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 5 (with T5.2-T5.7)
  **Blocks**: T5.2-T5.7
  **Blocked By**: T4.1-T4.7

  **Acceptance Criteria:**
  - [ ] `node-simconnect` installed
  - [ ] TypeScript types available
  - [ ] Can import in server code

  **QA Scenarios:**
  ```
  Scenario: node-simconnect installed and importable
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run `npm ls node-simconnect`
      2. Assert package listed in dependencies
      3. Run `node -e "const sc = require('node-simconnect'); console.log(typeof sc)"`
      4. Assert output shows module loaded
      5. Check TypeScript types file exists
      6. Run `npm run typecheck -w server`
      7. Assert compilation succeeds
    Expected Result: Package installed, importable, TypeScript types available
    Failure Indicators: Package not found, import fails, no types, build errors
    Evidence: .sisyphus/evidence/task-t51-simconnect-install.txt
  ```

  **Commit**: `chore(deps): add node-simconnect for MSFS integration`

---

- [ ] T5.2. **Implement Basic SimConnect Connection**

  **What to do:**
  - Update `server/src/aircraft-adapters/pmdg-737.ts` to use real SimConnect
  - Implement `connect()`: open SimConnect connection to MSFS
  - Implement `disconnect()`: close connection gracefully
  - Implement `readDisplay()`: read basic aircraft state:
    - Position (lat, lon, altitude)
    - Heading
    - Speed (IAS, TAS, GS)
    - Vertical speed
  - Handle connection errors gracefully
  - Add connection status to health endpoint

  **Scope Lock:** Read-only basic data. No write operations yet.

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 5 (with T5.1, T5.3-T5.7)
  **Blocks**: T5.3-T5.7
  **Blocked By**: T5.1

  **Acceptance Criteria:**
  - [ ] Can connect to MSFS
  - [ ] Can read aircraft position
  - [ ] Can read heading/speed
  - [ ] Graceful handling of MSFS not running

  **QA Scenarios:**
  ```
  Scenario: SimConnect connects and reads basic aircraft data
    Tool: Bash (mock server) or Manual (with MSFS)
    Preconditions: Server running, mock SimConnect server available
    Steps:
      1. Start mock SimConnect server (simulates MSFS)
      2. Server emits aircraft data: lat=40.64, lon=-73.78, alt=5000, hdg=270
      3. Connect to MSFS via adapter
      4. Assert connection status = "CONNECTED"
      5. Read aircraft position
      6. Assert lat ≈ 40.64, lon ≈ -73.78
      7. Read altitude
      8. Assert alt ≈ 5000
      9. Read heading
      10. Assert hdg ≈ 270
      11. Disconnect
      12. Assert status = "DISCONNECTED"
    Expected Result: Connection established, data read correctly, graceful disconnect
    Failure Indicators: Connection fails, no data, wrong values, crash on disconnect
    Evidence: .sisyphus/evidence/task-t52-simconnect-connection.txt
  ```

  **Commit**: `feat(msfs): implement basic SimConnect connection`

---

- [ ] T5.3. **Create Aircraft Adapter Interface**

  **What to do:**
  - Update `server/src/aircraft-adapters/IAircraftAdapter.ts`:
    - Add `connect()`, `disconnect()`, `readDisplay()`, `sendKeypress()`
    - Add `aircraftType` field
    - Add `capabilities` array (what data is available)
  - Ensure interface supports multiple aircraft types
  - Document adapter requirements

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 5 (with T5.1-T5.2, T5.4-T5.7)
  **Blocks**: T5.4-T5.5
  **Blocked By**: T5.1

  **Acceptance Criteria:**
  - [ ] Interface supports Boeing and Airbus
  - [ ] All methods documented
  - [ ] TypeScript compiles

  **QA Scenarios:**
  ```
  Scenario: Aircraft adapter interface compiles and is implementable
    Tool: Bash
    Preconditions: TypeScript compilation works
    Steps:
      1. Run `npm run typecheck -w server`
      2. Assert exit code 0
      3. Create test adapter implementing IAircraftAdapter
      4. Assert TypeScript compiles with test adapter
      5. Verify interface has: connect, disconnect, readDisplay, sendKeypress
      6. Verify interface has: aircraftType, capabilities fields
    Expected Result: Interface compiles, all methods documented, implementable
    Failure Indicators: TypeScript errors, missing methods, interface not exported
    Evidence: .sisyphus/evidence/task-t53-adapter-interface.txt
  ```

  **Commit**: `feat(msfs): define aircraft adapter interface`

---

- [ ] T5.4. **Implement PMDG 737 Adapter**

  **What to do:**
  - Create `server/src/aircraft-adapters/pmdg-737.ts`:
    - Read PMDG CDU display via L: variables
    - Map PMDG CDU keys to app keys
    - Send keypresses to PMDG via SimConnect
  - Handle PMDG-specific quirks
  - Add configuration for PMDG variant (737-600/700/800/900)

  **Scope Lock:** 737-800 only. Other variants future work.

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 5 (with T5.1-T5.3, T5.5-T5.7)
  **Blocks**: None
  **Blocked By**: T5.3

  **Acceptance Criteria:**
  - [ ] Can read PMDG CDU display
  - [ ] Can send keypresses to PMDG
  - [ ] Display syncs with app

  **QA Scenarios:**
  ```
  Scenario: PMDG 737 adapter reads CDU display and sends keypresses
    Tool: Bash (mock) or Manual (with MSFS + PMDG)
    Preconditions: Adapter implemented, mock PMDG data available
    Steps:
      1. Create PMDG737Adapter instance
      2. Mock SimConnect returns CDU display lines
      3. Call readDisplay()
      4. Assert lines array has 14 elements
      5. Assert title = "IDENT"
      6. Call sendKeypress("1")
      7. Assert keypress logged/sent
      8. Call sendLSK("L", 1)
      9. Assert LSK "L1" sent
      10. Test disconnect
      11. Assert isConnected = false
    Expected Result: Display readable, keypresses sent, disconnect works
    Failure Indicators: No display data, keys not sent, crash, wrong data format
    Evidence: .sisyphus/evidence/task-t54-pmdg-adapter.txt
  ```

  **Commit**: `feat(msfs): implement PMDG 737 adapter`

---

- [ ] T5.5. **Implement FBW A320 Adapter**

  **What to do:**
  - Create `server/src/aircraft-adapters/fbw-a320.ts`:
    - Read FBW MCDU display via SimConnect variables
    - Map FBW MCDU keys to app keys
    - Send keypresses to FBW
  - Handle FBW-specific quirks

  **Scope Lock:** A320-200 only.

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 5 (with T5.1-T5.4, T5.6-T5.7)
  **Blocks**: None
  **Blocked By**: T5.3

  **Acceptance Criteria:**
  - [ ] Can read FBW MCDU display
  - [ ] Can send keypresses to FBW
  - [ ] Display syncs with app

  **QA Scenarios:**
  ```
  Scenario: FBW A320 adapter reads MCDU display and sends keypresses
    Tool: Bash (mock) or Manual (with MSFS + FBW)
    Preconditions: Adapter implemented, mock FBW data available
    Steps:
      1. Create FBWA320Adapter instance
      2. Mock SimConnect returns MCDU display lines
      3. Call readDisplay()
      4. Assert lines array has 14 elements
      5. Assert title = "INIT"
      6. Call sendKeypress("A")
      7. Assert keypress logged/sent
      8. Call sendLSK("R", 6)
      9. Assert LSK "R6" sent
      10. Test disconnect
      11. Assert isConnected = false
    Expected Result: Display readable, keypresses sent, disconnect works
    Failure Indicators: No display data, keys not sent, crash, wrong data format
    Evidence: .sisyphus/evidence/task-t55-fbw-adapter.txt
  ```

  **Commit**: `feat(msfs): implement FBW A320 adapter`

---

- [ ] T5.6. **Add Connection Diagnostics UI**

  **What to do:**
  - Update `ConnectionStatus.tsx`:
    - Show aircraft type when connected
    - Show data update rate (Hz)
    - Show latency (ms)
    - Show connection quality (good/fair/poor)
    - Add aircraft selector (PMDG 737 / FBW A320)
  - Add diagnostic log view (last 10 messages)

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 5 (with T5.1-T5.5, T5.7)
  **Blocks**: None
  **Blocked By**: T5.2

  **Acceptance Criteria:**
  - [ ] Aircraft type shown when connected
  - [ ] Update rate visible
  - [ ] Latency visible
  - [ ] Connection quality indicator

  **QA Scenarios:**
  ```
  Scenario: Connection diagnostics UI shows aircraft data and quality
    Tool: Playwright
    Preconditions: App running, mock MSFS connection active
    Steps:
      1. Click connection status indicator
      2. Assert panel shows "PMDG 737-800"
      3. Assert update rate visible (e.g., "10 Hz")
      4. Assert latency visible (e.g., "15 ms")
      5. Assert connection quality = "GOOD"
      6. Trigger mock lag (latency > 200ms)
      7. Assert quality changes to "POOR"
      8. Assert diagnostic log shows last 10 messages
      9. Click aircraft selector
      10. Assert "PMDG 737" and "FBW A320" options visible
    Expected Result: All diagnostics visible, quality responsive, selector works
    Failure Indicators: No data shown, quality static, missing selector, layout broken
    Evidence: .sisyphus/evidence/task-t56-diagnostics-ui.png
  ```

  **Commit**: `feat(ui): add MSFS connection diagnostics`

---

- [ ] T5.7. **Add MSFS Data Sync**

  **What to do:**
  - Sync basic aircraft data to FMC state:
    - Position → update flight plan current position
    - Altitude → update performance data
    - Heading → update nav data
    - Speed → update progress page
  - Update PROGRESS page with real data when connected
  - Update LEGS page with current waypoint
  - Add "LIVE" indicator when receiving real data

  **Scope Lock:** Basic data sync only. No complex flight dynamics.

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 5 (with T5.1-T5.6)
  **Blocks**: None
  **Blocked By**: T5.2

  **Acceptance Criteria:**
  - [ ] Position syncs to flight plan
  - [ ] PROGRESS shows real data
  - [ ] LEGS shows current waypoint
  - [ ] "LIVE" indicator visible

  **QA Scenarios:**
  ```
  Scenario: MSFS aircraft data syncs to FMC PROGRESS page
    Tool: Playwright + mock server
    Preconditions: App running, mock MSFS connected
    Steps:
      1. Connect to mock MSFS
      2. Mock sends position: lat=40.64, lon=-73.78, alt=35000
      3. Mock sends speed: TAS=450, GS=480
      4. Mock sends heading: 270
      5. Navigate to PROGRESS page
      6. Assert altitude shows ~35000
      7. Assert TAS shows ~450 KT
      8. Assert GS shows ~480 KT
      9. Assert "LIVE" indicator visible
      10. Disconnect MSFS
      11. Assert "LIVE" indicator disappears
      12. Assert data reverts to placeholders
    Expected Result: Real data displayed, LIVE indicator works, graceful disconnect
    Failure Indicators: No data sync, wrong values, LIVE indicator missing, crash
    Evidence: .sisyphus/evidence/task-t57-data-sync.png
  ```

  **Commit**: `feat(msfs): sync aircraft data to FMC display`

---

## PHASE 6: Polish & Enhancement

- [ ] T6.1. **Add Failure Mode Annunciations**

  **What to do:**
  - Add `FAIL` and `OFF` flags to display:
    - Show "FAIL" in inverse video when FMC fails
    - Show "OFF" when CDU is off
    - Add test mode to simulate failures
  - Add failure state to FMC state machine
  - Add button/key combination to reset failures
  - Display failure message in scratchpad

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 6 (with T6.2-T6.5)
  **Blocks**: None
  **Blocked By**: T5.1-T5.7

  **Acceptance Criteria:**
  - [ ] FAIL flag displays correctly
  - [ ] OFF flag displays correctly
  - [ ] Failure state can be triggered/cleared
  - [ ] Scratchpad shows failure message

  **QA Scenarios:**
  ```
  Scenario: FMC failure modes display FAIL/OFF flags correctly
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Navigate to any page
      2. Trigger test failure mode (via hidden dev key or store action)
      3. Assert display shows "FAIL" in large inverse red text
      4. Assert all page content hidden
      5. Assert scratchpad shows failure message
      6. Trigger OFF mode
      7. Assert display shows "OFF"
      8. Assert screen blank except OFF flag
      9. Reset failure mode
      10. Assert normal display restored
    Expected Result: FAIL/OFF flags display correctly, reset works
    Failure Indicators: No flag shown, flag wrong style, can't reset, crash
    Evidence: .sisyphus/evidence/task-t61-failure-modes.png
  ```

  **Commit**: `feat(failure): add FMC failure annunciations`

---

- [ ] T6.2. **Implement Contextual LSK Labels**

  **What to do:**
  - Update `getLSKLabel()` in `CDU.tsx` and `AirbusCDU.tsx`:
    - Show contextual text labels instead of just arrows
    - Examples: "SET ORIGIN" instead of "◄", "NEXT" instead of "▼"
    - Show actual action name when space permits
    - Maintain arrow symbols for secondary actions
  - Add `lskLabels` to `DisplayData` interface
  - Update all page renderers to provide contextual labels

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 6 (with T6.1, T6.3-T6.5)
  **Blocks**: None
  **Blocked By**: T5.1-T5.7

  **Acceptance Criteria:**
  - [ ] LSK buttons show contextual labels
  - [ ] Labels match page context
  - [ ] Arrows shown for navigation only
  - [ ] Labels fit within button width

  **QA Scenarios:**
  ```
  Scenario: LSK buttons show contextual labels instead of arrows
    Tool: Playwright
    Preconditions: App running, Boeing mode
    Steps:
      1. Navigate to POS INIT page
      2. Assert L1 shows "SET ORIGIN" (not just "◄")
      3. Assert L3 shows "SET GATE" (not just "◄")
      4. Navigate to RTE page
      5. Assert L1 shows "SET ORIGIN"
      6. Assert R1 shows "SET FLT NO"
      7. Assert L6 shows "NEXT" (navigation)
      8. Navigate to DEP/ARR page
      9. Assert L3 shows "SELECT SID"
      10. Assert L6 shows "ARR" (subpage)
    Expected Result: Contextual labels on primary actions, arrows on navigation
    Failure Indicators: All arrows, wrong labels, labels too long, layout broken
    Evidence: .sisyphus/evidence/task-t62-lsk-labels.png
  ```

  **Commit**: `feat(ui): implement contextual LSK labels`

---

- [ ] T6.3. **Add Realistic Button Animations**

  **What to do:**
  - Update `CDUButton.tsx`:
    - Add key depression animation (translateY, scale)
    - Add release animation (spring back)
    - Add subtle key wobble on press
    - Add pressed state styling (darker background)
    - Add tactile feedback simulation (visual only)
  - Update `LSKButton.tsx` similarly
  - Ensure animations are performant (use CSS transforms)
  - Add button sound effect (optional, controlled by settings)

  **Category**: `visual-engineering`
  **Parallel Group**: Phase 6 (with T6.1-T6.2, T6.4-T6.5)
  **Blocks**: None
  **Blocked By**: T5.1-T5.7

  **Acceptance Criteria:**
  - [ ] Buttons have press animation
  - [ ] Buttons have release animation
  - [ ] Animations are smooth (60fps)
  - [ ] No layout thrashing

  **QA Scenarios:**
  ```
  Scenario: Buttons show press/release animations at 60fps
    Tool: Playwright
    Preconditions: App running, any mode
    Steps:
      1. Navigate to IDENT page
      2. Click a CDU button (e.g., "1")
      3. Record slow-motion video (120fps)
      4. Assert button depresses (translateY + scale) within 80ms
      5. Assert button releases with spring animation within 150ms
      6. Assert no layout thrashing (no reflow/paint events)
      7. Rapidly click 10 buttons
      8. Assert all animations smooth, no dropped frames
      9. Test on mobile viewport (375px width)
      10. Assert touch feedback works
    Expected Result: Smooth press/release, 60fps, no jank, works on mobile
    Failure Indicators: No animation, janky, layout thrashing, broken on mobile
    Evidence: .sisyphus/evidence/task-t63-button-animations.mp4
  ```

  **Commit**: `feat(ui): add realistic button press animations`

---

- [ ] T6.4. **Enhance Tutorials with Error Detection**

  **What to do:**
  - Update tutorial engine to detect incorrect entries:
    - If user enters wrong value, show hint
    - If user presses wrong key, show guidance
    - Track error count per tutorial
    - Offer to skip step after 3 failed attempts
  - Add error messages to tutorial overlay
  - Add progress tracking (time per step, error rate)
  - Add tutorial scoring (stars based on accuracy)

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 6 (with T6.1-T6.3, T6.5)
  **Blocks**: None
  **Blocked By**: T5.1-T5.7

  **Acceptance Criteria:**
  - [ ] Wrong entries show hints
  - [ ] Error count tracked
  - [ ] Skip option after 3 failures
  - [ ] Tutorial score displayed

  **QA Scenarios:**
  ```
  Scenario: Tutorial detects errors and provides hints
    Tool: Playwright
    Preconditions: App running, tutorial "Full Preflight" started
    Steps:
      1. Start "Full Preflight" tutorial
      2. At step requiring "KJFK", type "WRONG"
      3. Press LSK
      4. Assert hint visible: "Enter a valid 4-letter ICAO code like KJFK"
      5. Assert error count = 1
      6. Type "KJFK" (correct)
      7. Assert tutorial advances
      8. At step requiring "350", type "999"
      9. Assert hint: "Cruise altitude should be 200-450 (in hundreds of feet)"
      10. Type "350" (correct)
      11. Complete tutorial
      12. Assert score visible (e.g., "8/10 - 2 errors")
      13. Assert "Practice Again" button for low scores
    Expected Result: Hints on errors, error count tracked, score displayed
    Failure Indicators: No hints, tutorial crashes, score wrong, no practice button
    Evidence: .sisyphus/evidence/task-t64-tutorial-errors.png
  ```

  **Commit**: `feat(tutorial): add error detection and scoring`

---

- [ ] T6.5. **Add Performance Metrics**

  **What to do:**
  - Track tutorial performance:
    - Time per step
    - Error count
    - Completion rate
    - Average score
  - Store metrics in localStorage
  - Display metrics in tutorial completion screen
  - Add "Practice Again" option for low scores
  - Export metrics (optional)

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 6 (with T6.1-T6.4)
  **Blocks**: None
  **Blocked By**: T5.1-T5.7

  **Acceptance Criteria:**
  - [ ] Metrics stored in localStorage
  - [ ] Metrics displayed on completion
  - [ ] "Practice Again" button visible for low scores
  - [ ] Metrics persist across sessions

  **QA Scenarios:**
  ```
  Scenario: Tutorial metrics tracked and displayed on completion
    Tool: Playwright
    Preconditions: App running, tutorial completed
    Steps:
      1. Complete "Full Preflight" tutorial
      2. Assert completion screen shows:
         - Time: "5:23"
         - Errors: 2
         - Accuracy: 92%
         - Score: 4/5 stars
      3. Assert "Practice Again" button visible
      4. Click "Practice Again"
      5. Assert tutorial restarts
      6. Complete tutorial faster with 0 errors
      7. Assert improved metrics
      8. Check localStorage for saved metrics
      9. Assert metrics persist after page refresh
    Expected Result: Metrics tracked, displayed, persisted, practice button works
    Failure Indicators: No metrics, wrong values, not persisted, no practice button
    Evidence: .sisyphus/evidence/task-t65-tutorial-metrics.png
  ```

  **Commit**: `feat(tutorial): add performance metrics tracking`

---

## PHASE 7: Testing Infrastructure

- [ ] T7.1. **Set Up Vitest Test Framework**

  **What to do:**
  - Install Vitest: `npm install -D vitest @vitest/ui`
  - Add test script to `package.json`: `"test": "vitest"`
  - Create `vitest.config.ts` with:
    - Test environment: `jsdom`
    - Setup file for React Testing Library
    - Coverage config (v8)
  - Create `src/test/setup.ts` with cleanup logic
  - Write example test to verify setup works
  - Add `__tests__` directories in `src/` and `shared/`

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 7 (with T7.2-T7.6)
  **Blocks**: T7.2-T7.6
  **Blocked By**: T6.1-T6.5

  **Acceptance Criteria:**
  - [ ] `npm test` runs successfully
  - [ ] Example test passes
  - [ ] Coverage config works
  - [ ] Tests run in CI

  **QA Scenarios:**
  ```
  Scenario: Vitest runs and example test passes
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run `npm test`
      2. Assert exit code 0
      3. Assert output shows "Test Files  1 passed"
      4. Run `npm test -- --coverage`
      5. Assert coverage report generated
      6. Assert coverage >= 80% threshold
      7. Run `npm test -- --ui`
      8. Assert Vitest UI accessible on port 51204
      9. Verify `vitest.config.ts` exists
      10. Verify `src/test/setup.ts` exists
    Expected Result: Tests run, coverage works, UI available, config files present
    Failure Indicators: Tests fail, coverage missing, UI broken, config missing
    Evidence: .sisyphus/evidence/task-t71-vitest-setup.txt
  ```

  **Commit**: `chore(test): set up Vitest test framework`

---

- [ ] T7.2. **Write Unit Tests for State/Store**

  **What to do:**
  - Test `useFMCStore` actions:
    - `setPage()` - verify page change
    - `pressKey()` - verify scratchpad input
    - `pressLSK()` - verify data entry
    - `pressEXEC()` - verify commit
    - `goBack()` - verify history
  - Test state transitions:
    - Standby → Active
    - Tutorial mode
    - Modified → Committed
  - Test aircraft switching
  - Mock Zustand store for testing

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 7 (with T7.1, T7.3-T7.6)
  **Blocks**: None
  **Blocked By**: T7.1

  **Acceptance Criteria:**
  - [ ] All store actions have tests
  - [ ] All state transitions tested
  - [ ] Aircraft switching tested
  - [ ] 100% store coverage

  **QA Scenarios:**
  ```
  Scenario: All store actions tested with 100% coverage
    Tool: Bash
    Preconditions: Vitest running
    Steps:
      1. Run `npm test -- src/store/__tests__/useFMCStore.test.ts`
      2. Assert all tests pass
      3. Assert coverage for store >= 100%
      4. Test setPage: assert page changes, history updated
      5. Test pressKey: assert scratchpad updates
      6. Test pressLSK: assert data entry works
      7. Test pressEXEC: assert commit clears modified flag
      8. Test goBack: assert history navigation
      9. Test aircraft switch: assert Boeing → Airbus
      10. Test tutorial start: assert mode = TUTORIAL
    Expected Result: All store actions tested, coverage 100%, no failures
    Failure Indicators: Tests fail, low coverage, missing action tests
    Evidence: .sisyphus/evidence/task-t72-store-tests.txt
  ```

  **Commit**: `test(store): add unit tests for FMC store`

---

- [ ] T7.3. **Write Unit Tests for Page Renderers**

  **What to do:**
  - Test all Boeing page renderers:
    - `renderIdentPage()` - verify output lines
    - `renderPosInitPage()` - verify fields
    - `renderRtePage()` - verify route display
    - etc. for all 12 pages
  - Test all Airbus page renderers
  - Verify correct line count (14)
  - Verify correct line width (24)
  - Verify correct colors
  - Verify correct LSK actions
  - Mock FMC state for consistent tests

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 7 (with T7.1-T7.2, T7.4-T7.6)
  **Blocks**: None
  **Blocked By**: T7.1

  **Acceptance Criteria:**
  - [ ] All Boeing renderers tested
  - [ ] All Airbus renderers tested
  - [ ] Line count verified
  - [ ] Colors verified
  - [ ] LSK actions verified

  **QA Scenarios:**
  ```
  Scenario: All page renderers tested with correct output
    Tool: Bash
    Preconditions: Vitest running
    Steps:
      1. Run `npm test -- shared/src/fmc/pages/__tests__`
      2. Assert all Boeing renderer tests pass
      3. Assert all Airbus renderer tests pass
      4. Test renderIdentPage: assert 14 lines, cyan header
      5. Test renderRtePage: assert origin/dest fields
      6. Test renderLegsPage: assert waypoint count, pagination
      7. Test renderInitA: assert FROM/TO, CI, CRZ FL fields
      8. Test line width: assert all lines <= 24 chars
      9. Test line count: assert all pages = 14 lines
      10. Assert coverage >= 90%
    Expected Result: All renderers tested, output verified, coverage high
    Failure Indicators: Tests fail, wrong output, missing pages, low coverage
    Evidence: .sisyphus/evidence/task-t73-page-tests.txt
  ```

  **Commit**: `test(pages): add unit tests for all page renderers`

---

- [ ] T7.4. **Write Unit Tests for Input Validation**

  **What to do:**
  - Test all validators from T4.1:
    - `isValidICAO()` - valid/invalid codes
    - `isValidWaypoint()` - valid/invalid identifiers
    - `isValidFlightNumber()` - valid/invalid formats
    - `isValidAltitude()` - boundary values
    - `isValidSpeed()` - boundary values
    - `isValidTemperature()` - boundary values
    - `isValidVSpeeds()` - cross-field validation
  - Test edge cases:
    - Empty strings
    - Null/undefined
    - Too long/short
    - Special characters
    - Unicode
  - Test error messages

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 7 (with T7.1-T7.3, T7.5-T7.6)
  **Blocks**: None
  **Blocked By**: T7.1

  **Acceptance Criteria:**
  - [ ] All validators have tests
  - [ ] Edge cases covered
  - [ ] Error messages verified
  - [ ] 100% validation coverage

  **QA Scenarios:**
  ```
  Scenario: All validators tested with edge cases
    Tool: Bash
    Preconditions: Vitest running
    Steps:
      1. Run `npm test -- shared/src/fmc/__tests__/validation.test.ts`
      2. Assert all tests pass
      3. Test isValidICAO: valid (KJFK, EGLL), invalid (KJ, 1234, kjfk)
      4. Test isValidAltitude: valid (350, 410), invalid (10, 999, -50)
      5. Test isValidSpeed: valid (250, 300), invalid (10, 600)
      6. Test isValidTemperature: valid (15, -20), invalid (-70, 70)
      7. Test isValidVSpeeds: valid (135,140,145), invalid (150,140,145)
      8. Test edge cases: empty string, null, undefined, unicode
      9. Test error messages: assert clear, helpful text
      10. Assert coverage >= 95%
    Expected Result: All validators tested, edge cases covered, coverage high
    Failure Indicators: Tests fail, missing edge cases, wrong error messages
    Evidence: .sisyphus/evidence/task-t74-validation-tests.txt
  ```

  **Commit**: `test(validation): add unit tests for input validation`

---

- [ ] T7.5. **Write Playwright E2E Tests**

  **What to do:**
  - Install Playwright: `npm install -D @playwright/test`
  - Configure `playwright.config.ts`:
    - Test against Chromium, Firefox, WebKit
    - Screenshot on failure
    - Video recording for debugging
  - Write E2E tests:
    - Full preflight tutorial (Boeing)
    - Aircraft switch (Boeing → Airbus)
    - Page navigation (all function keys)
    - Data entry and validation
    - MSFS connection flow
    - Mobile/touch interaction
  - Add test data fixtures
  - Mock WebSocket server for offline tests

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 7 (with T7.1-T7.4, T7.6)
  **Blocks**: None
  **Blocked By**: T7.1

  **Acceptance Criteria:**
  - [ ] Playwright installed and configured
  - [ ] E2E tests for full tutorial
  - [ ] E2E tests for aircraft switch
  - [ ] E2E tests for all pages
  - [ ] Screenshots on failure
  - [ ] Cross-browser tests

  **QA Scenarios:**
  ```
  Scenario: E2E tests pass across browsers
    Tool: Bash
    Preconditions: App built, Playwright installed
    Steps:
      1. Run `npx playwright test`
      2. Assert all tests pass in Chromium
      3. Assert all tests pass in Firefox
      4. Assert all tests pass in WebKit
      5. Test full preflight tutorial: start → complete
      6. Test aircraft switch: Boeing → Airbus
      7. Test page navigation: all function keys
      8. Test data entry: valid and invalid inputs
      9. Test mobile: touch interactions at 375px width
      10. Assert screenshots captured on failure
    Expected Result: All browsers pass, all flows work, mobile responsive
    Failure Indicators: Cross-browser failures, tutorial breaks, mobile broken
    Evidence: .sisyphus/evidence/task-t75-e2e-tests.txt
  ```

  **Commit**: `test(e2e): add Playwright end-to-end tests`

---

- [ ] T7.6. **Write MSFS Integration Tests**

  **What to do:**
  - Create mock SimConnect server for testing:
    - Simulate MSFS connection
    - Send mock aircraft data
    - Simulate disconnections
  - Write integration tests:
    - Connection establishment
    - Data sync (position, altitude, heading)
    - Disconnection handling
    - Reconnection logic
  - Test aircraft adapter switching
  - Test connection diagnostics UI

  **Category**: `unspecified-high`
  **Parallel Group**: Phase 7 (with T7.1-T7.5)
  **Blocks**: None
  **Blocked By**: T7.1

  **Acceptance Criteria:**
  - [ ] Mock SimConnect server created
  - [ ] Connection tests pass
  - [ ] Data sync tests pass
  - [ ] Disconnect tests pass
  - [ ] Reconnect tests pass

  **QA Scenarios:**
  ```
  Scenario: MSFS integration tests with mock server
    Tool: Bash
    Preconditions: Vitest running, mock SimConnect server
    Steps:
      1. Run `npm test -- server/src/__tests__/msfs.test.ts`
      2. Assert all tests pass
      3. Test connection: mock server accepts connection
      4. Test data sync: mock sends position, assert received
      5. Test disconnect: assert graceful cleanup
      6. Test reconnect: assert automatic retry
      7. Test adapter switch: PMDG → FBW
      8. Test error handling: mock server crash, assert no app crash
      9. Test diagnostics: assert metrics calculated
      10. Assert coverage >= 80%
    Expected Result: All MSFS tests pass, mock server works, coverage high
    Failure Indicators: Tests fail, mock server broken, real MSFS required
    Evidence: .sisyphus/evidence/task-t76-msfs-tests.txt
  ```

  **Commit**: `test(msfs): add MSFS integration tests`

---

## Final Verification Wave (MANDATORY — after ALL implementation)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`

  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.

  **Checklist:**
  - [ ] Phase 0: All 5 critical bugs fixed
  - [ ] Phase 1: Display engine with color tokens, font, utilities
  - [ ] Phase 2: Boeing multi-color, 14 function keys, keypad layout
  - [ ] Phase 3: Airbus correct labels, color semantics, complete pages
  - [ ] Phase 4: Input validation, LEGS/HOLD/FIX, nav database, SimBrief
  - [ ] Phase 5: MSFS connection, adapters, diagnostics, data sync
  - [ ] Phase 6: Failure modes, LSK labels, animations, tutorials
  - [ ] Phase 7: Vitest, unit tests, E2E tests, MSFS tests
  - [ ] No proprietary fonts
  - [ ] No breaking WebSocket changes
  - [ ] All tests pass

  **Output:** `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`

  Run `tsc --noEmit` + linter + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, `console.log` in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.

  **Checklist:**
  - [ ] TypeScript: 0 errors
  - [ ] Tests: All pass
  - [ ] Coverage: >= 80%
  - [ ] No AI slop patterns
  - [ ] No console.log in production code
  - [ ] No unused imports

  **Output:** `Build [PASS/FAIL] | Tests [N/N] | Coverage [N%] | Quality [PASS/FAIL] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)

  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration. Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.

  **Checklist:**
  - [ ] All Phase 0 bugs verified fixed
  - [ ] All Boeing pages render correctly
  - [ ] All Airbus pages render correctly
  - [ ] All function keys work
  - [ ] Input validation works
  - [ ] LEGS/HOLD/FIX functional
  - [ ] SimBrief import works
  - [ ] MSFS connection works (or mock)
  - [ ] Tutorials complete successfully
  - [ ] Mobile/touch works

  **Output:** `Scenarios [N/N] | Integration [PASS/FAIL] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`

  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination.

  **Checklist:**
  - [ ] All Phase 0-7 tasks implemented
  - [ ] No scope creep (extra features not in plan)
  - [ ] No missing features from plan
  - [ ] Guardrails respected (no proprietary fonts, no breaking changes)
  - [ ] Clean git history (atomic commits)

  **Output:** `Tasks [N/N compliant] | Scope [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

### Phase 0
- `fix(airbus): remove extra array wrapper in MCDU MENU page`
- `fix(server): add missing FMCState fields to default state`
- `fix(server): add null check for page renderer`
- `chore(deps): fix npm audit vulnerabilities`
- `chore(build): verify clean TypeScript compilation`

### Phase 1
- `feat(display): add unified color token system`
- `feat(display): add aviation-appropriate monospace font`
- `feat(display): add color support to DisplayLine`
- `feat(display): add text formatting utilities`
- `feat(config): add aviation color tokens to Tailwind`

### Phase 2
- `feat(boeing): apply multi-color display to all pages`
- `feat(boeing): add missing function keys (CLB, CRZ, DES, etc.)`
- `feat(boeing): reorganize keypad to match real CDU layout`
- `feat(ui): improve CDU bezel styling with depth effects`
- `refactor(boeing): migrate page renderers to text utilities`

### Phase 3
- `feat(airbus): correct function key labels to match real MCDU`
- `feat(airbus): implement color-coded semantics`
- `feat(airbus): complete missing page implementations`
- `fix(airbus): fix and style MCDU MENU page`
- `refactor(airbus): migrate page renderers to text utilities`

### Phase 4
- `feat(validation): add input validation framework`
- `feat(store): apply input validation to all data entry`
- `feat(legs): implement waypoint editing`
- `feat(hold): implement hold pattern creation`
- `feat(fix): implement fix reference functionality`
- `feat(nav): expand navigation database`
- `feat(integration): add SimBrief flight plan import`

### Phase 5
- `chore(deps): add node-simconnect for MSFS integration`
- `feat(msfs): implement basic SimConnect connection`
- `feat(msfs): define aircraft adapter interface`
- `feat(msfs): implement PMDG 737 adapter`
- `feat(msfs): implement FBW A320 adapter`
- `feat(ui): add MSFS connection diagnostics`
- `feat(msfs): sync aircraft data to FMC display`

### Phase 6
- `feat(failure): add FMC failure annunciations`
- `feat(ui): implement contextual LSK labels`
- `feat(ui): add realistic button press animations`
- `feat(tutorial): add error detection and scoring`
- `feat(tutorial): add performance metrics tracking`

### Phase 7
- `chore(test): set up Vitest test framework`
- `test(store): add unit tests for FMC store`
- `test(pages): add unit tests for all page renderers`
- `test(validation): add unit tests for input validation`
- `test(e2e): add Playwright end-to-end tests`
- `test(msfs): add MSFS integration tests`

---

## Success Criteria

### Build & Compilation
```bash
npm run typecheck:all    # Expected: exit code 0, 0 errors
npm run build            # Expected: exit code 0, dist/ created
npm audit                # Expected: 0 moderate+ vulnerabilities
npm test                 # Expected: all tests pass, >= 80% coverage
```

### Visual Accuracy
- [ ] Boeing CDU shows multi-color display (cyan headers, white labels, green data, magenta mods)
- [ ] All 14 Boeing function keys present and functional
- [ ] Airbus MCDU shows correct labels (DIR, PROG, PERF, INIT, DATA, F-PLN)
- [ ] Airbus MCDU shows color-coded semantics (white/blue/green/amber/magenta)
- [ ] Side-by-side with real CDU photos shows <10% visual variance

### Functional Accuracy
- [ ] Input validation catches 90%+ of common entry errors
- [ ] LEGS page allows waypoint editing
- [ ] HOLD/FIX pages functional
- [ ] Navigation database has top 100 airports + US states
- [ ] SimBrief import loads flight plans
- [ ] MSFS connection syncs basic aircraft data
- [ ] Tutorials complete with error detection

### Testing
- [ ] Unit tests for all store actions
- [ ] Unit tests for all page renderers
- [ ] Unit tests for all validators
- [ ] E2E tests for full user flows
- [ ] MSFS integration tests with mock server
- [ ] Code coverage >= 80%

---

## Notes

### Assumptions
- Real hardware specs based on publicly available sources
- Some variation exists between CDU manufacturers
- MSFS integration requires Windows + MSFS 2020 for manual testing
- Mock SimConnect server used for automated testing

### Known Limitations
- Font will be open-source approximation, not exact Boeing/Airbus font
- Navigation database is static subset, not full worldwide
- MSFS integration is basic read-only sync
- Failure modes are basic, not full system simulation

### Risk Mitigation
- **Low Risk:** Visual changes, button additions, animations
- **Medium Risk:** Navigation database size, SimConnect integration
- **High Risk:** Font licensing, MSFS testing dependency
- **Mitigation:** Mock server for MSFS, static nav data, open-source font

---

*This plan is a living document. Update as implementation progresses.*
*Plan saved to: `.sisyphus/plans/virtualcdu-complete-implementation.md`*
