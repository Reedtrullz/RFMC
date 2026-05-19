# VirtualCDU Audit & Quality Policy

This document outlines the engineering standards, quality gates, and security protocols for the VirtualCDU project.

## 1. Quality Gates

All contributions must satisfy the following automated quality gates:

### 1.1 Unit Testing (Vitest)

- **Minimum Coverage Thresholds**:
  - Statements: 50%
  - Branches: 50%
  - Functions: 50%
  - Lines: 50%
- **Target Coverage**: 80%+ for core business logic in `shared/src/fmc` and `src/store`.
- **Command**: `npm test -- --coverage`

### 1.2 Visual Regression (Playwright)

- **Visual Parity**: UI components (CDU, ND) must maintain visual parity with baseline screenshots within a 5% pixel difference.
- **Baseline Management**: Snapshots are stored in `e2e/visual-regression.spec.ts-snapshots`.
- **Command**: `npx playwright test e2e/visual-regression.spec.ts`

### 1.3 Static Analysis

- **Linting**: No ESLint errors or warnings allowed in production builds.
- **Type Safety**: No `any` types in core domain models; strict null checks enabled.

## 2. Design Principles

### 2.1 Aesthetic Excellence

- **Rich Aesthetics**: Vibrant colors (HSL), glassmorphism, and dynamic animations are mandatory for a premium feel.
- **Typography**: Exclusive use of modern, high-legibility fonts (e.g., B612 Mono for avionics).

### 2.2 Functional Fidelity

- **Boeing/Airbus Parity**: Page layouts must align with real-world 737 NG and A320 MCDU documentation.
- **Input Validation**: All scratchpad entries must be validated against real-world constraints (e.g., valid ICAO, altitude limits).

## 3. Security Protocols

- **No Secrets**: Zero tolerance for API keys, SimBrief pilot IDs, or other credentials in the source code.
- **Sanitization**: All user inputs (scratchpad, SimBrief imports) must be sanitized to prevent XSS or injection.
- **Persistence**: User-identifiable data (like SimBrief Pilot ID) must only be stored in `localStorage` and never transmitted to non-official third-party servers.

## 4. Maintenance & Compliance

- **Dependency Audits**: Monthly audits of `npm` dependencies using `npm audit`.
- **Roadmap Alignment**: All feature additions must be documented in `ROADMAP.md` and tracked in `IMPLEMENTATION_STATUS.md`.
