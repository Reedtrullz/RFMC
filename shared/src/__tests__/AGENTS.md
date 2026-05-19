# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-19
**Area:** shared/src/**tests**

## OVERVIEW

Unit tests for shared FMC logic, types, and utilities.

## STRUCTURE

```
__tests__/
├── autopilot/
├── fmc/
├── navdata/
├── pfd/
├── training/
├── types/
└── utils/
```

## WHERE TO LOOK

| Task                    | Location               |
| ----------------------- | ---------------------- |
| FMC page tests          | `__tests__/fmc/`       |
| Navigation data tests   | `__tests__/navdata/`   |
| Autopilot tests         | `__tests__/autopilot/` |
| PFD tests               | `__tests__/pfd/`       |
| Tutorial/scenario tests | `__tests__/training/`  |
| Type utility tests      | `__tests__/types/`     |
| General utility tests   | `__tests__/utils/`     |

## CONVENTIONS

- **Vitest**: Uses `describe`, `it`, `expect` from Vitest
- **Mocking**: Use `vi.mock()` for mocks, reset with `vi.resetAllMocks()`
- **Async**: Use `async/await` for promises, `await vi.waitUntil()` for polling
- **Snapshots**: Avoid unless testing complex objects; prefer explicit assertions
- **Test file naming**: Match source file (e.g., `navDatabase.test.ts` for `navDatabase.ts`)
- **Coverage**: Aim for 80%+ on modified files; global threshold is 50%

## ANTI-PATTERNS

- **No console.log**: Tests should be silent; use `expect` or `vi.spyOn` for verification
- **No hardcoded timeouts**: Use `vi.useFakeTimers()` or polling with `vi.waitUntil()`
- **No testing private methods**: Test through public interface only
- **No duplicate setup**: Use `beforeEach`/`afterEach` for shared state
- **No magic numbers**: Define constants for test data (ICAO codes, weights, etc.)
