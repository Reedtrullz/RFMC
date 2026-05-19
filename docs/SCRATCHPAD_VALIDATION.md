# Scratchpad Validation

**Last updated:** 2026-05-16

This document describes the scratchpad engine architecture, message priority model, validation lifecycle, and message triggers for VirtualCDU.

## Scratchpad Engine Architecture

The scratchpad engine (`shared/src/fmc/scratchpadEngine.ts`) centralizes all input handling, validation, and message display. It replaces the previous ad-hoc `scratchpadError` string pattern in the FMC store.

### State Model

```ts
interface ScratchpadState {
  buffer: string; // Current scratchpad text buffer
  message: ScratchpadMessage | null; // Currently displayed message (highest priority)
  messageQueue: ScratchpadMessage[]; // Priority-sorted message queue
  history: ScratchpadMessage[]; // All messages ever displayed
}

interface ScratchpadMessage {
  id: string;
  text: string;
  priority: MessagePriority;
  source: MessageSource;
  clearsOnInput: boolean;
  clearsOnExec: boolean;
  clearsOnPageChange: boolean;
  createdAt: number;
}
```

### Message Priority Model

Messages are prioritized with lower numbers indicating higher urgency:

| Priority | Level            | Example Messages                         | Persists on Input? |
| -------- | ---------------- | ---------------------------------------- | ------------------ |
| 1        | `SAFETY`         | UNABLE NEXT ALT, DRAG REQUIRED           | Yes                |
| 2        | `NAV_IMPOSSIBLE` | ROUTE DISCONTINUITY, VERIFY POSITION     | Yes                |
| 3        | `PERF_UNAVAIL`   | PERF VNAV UNAVAILABLE, INSUFFICIENT FUEL | Yes                |
| 4        | `DB_ERROR`       | NOT IN DATABASE                          | No                 |
| 5        | `INVALID_ENTRY`  | INVALID ENTRY                            | No                 |
| 6        | `ADVISORY`       | Advisory prompts                         | No                 |
| 7        | `INFO`           | Informational messages                   | No                 |
| 8        | `USER_INPUT`     | User typed input                         | N/A                |

**Priority 1-3 (Safety Band)**: Messages in the safety band persist through user typing. The user cannot dismiss these by simply starting to type — they must be acknowledged or resolved.

**Priority 4-8**: These messages clear when the user starts typing new input. The highest remaining message in the queue becomes the active display.

### Engine Operations

| Function                         | Behavior                                                             |
| -------------------------------- | -------------------------------------------------------------------- |
| `pushMessage(state, message)`    | Inserts into priority-sorted queue, promotes highest to active       |
| `clearMessage(state, messageId)` | Removes by ID, promotes next highest                                 |
| `typeChar(state, char)`          | Appends to buffer, clears messages with priority > PERF_UNAVAIL      |
| `deleteChar(state)`              | Removes last char from buffer                                        |
| `clearBuffer(state)`             | Clears buffer text                                                   |
| `getActiveDisplay(state)`        | Returns message text (if active) or buffer text (if non-empty) or '' |

## Validation Lifecycle

Every field entry follows this lifecycle:

```
Parse → Validate → Apply (or Reject)
  │        │          │
  │        │          └─→ Success: clear scratchpad, apply value to state
  │        └─→ Failure: show validation message on scratchpad
  └─→ Parse error: show INVALID ENTRY
```

### Field Validation Rules

Each field defines:

- **Parser**: Converts raw string to typed value (e.g., `parseInt`, `parseFloat`, `toUpperCase`)
- **Formatter**: Converts typed value to display string
- **Validator**: Checks against range, format, and database constraints
- **Applier**: Writes value to FMC state

Field validation rules are in `shared/src/fmc/validation.ts`. Aircraft-specific validation is in aircraft-specific files.

## Required Messages (8)

### INVALID ENTRY

- **Priority**: 5 (INVALID_ENTRY)
- **Source**: validation
- **Triggers**:
  - Invalid field syntax (e.g., letters where numbers expected)
  - Numeric value out of range
  - Invalid V-speed relationship (V1 > VR, VR > V2)
  - Field format does not match expected parser
- **Clear behavior**: Clears on next valid input or page change

### NOT IN DATABASE

- **Priority**: 4 (DB_ERROR)
- **Source**: validation
- **Triggers**:
  - ICAO airport code not found in navdata
  - Waypoint identifier not found
  - Navaid not found
  - Runway not found for selected airport
  - Airway or procedure not found
- **Clear behavior**: Clears on next valid database lookup or page change

### ROUTE DISCONTINUITY

- **Priority**: 2 (NAV_IMPOSSIBLE)
- **Source**: route
- **Triggers**:
  - Route legs cannot connect (gap between procedures)
  - SID/STAR insertion creates a gap
  - Airway exit/entry mismatch
  - Pilot clears a segment requiring manual connection
- **Clear behavior**: Does NOT clear on input (safety band). Clears when discontinuity is resolved.

### VERIFY POSITION

- **Priority**: 2 (NAV_IMPOSSIBLE)
- **Source**: nav
- **Triggers**:
  - Position initialization incomplete
  - IRS/ADIRS alignment not confirmed
  - Current position differs from reference beyond tolerance
- **Clear behavior**: Does NOT clear on input. Clears when position is verified or aligned.

### INSUFFICIENT FUEL

- **Priority**: 3 (PERF_UNAVAIL)
- **Source**: performance
- **Triggers**:
  - Predicted fuel at destination below reserve
  - Route/performance model estimates impossible mission
  - Reserves exceed available fuel
- **Clear behavior**: Does NOT clear on input. Clears when fuel/performance values are adjusted.

### PERF VNAV UNAVAILABLE

- **Priority**: 3 (PERF_UNAVAIL)
- **Source**: performance
- **Triggers**:
  - VNAV required data missing (CRZ ALT, ZFW)
  - Performance inputs incomplete
  - Invalid cruise altitude for aircraft envelope
- **Clear behavior**: Does NOT clear on input. Clears when required performance data is provided.

### UNABLE NEXT ALT

- **Priority**: 1 (SAFETY)
- **Source**: nav
- **Triggers**:
  - Aircraft cannot meet next altitude constraint based on climb/descent model
  - Descent path impossible from current position
  - Climb restriction beyond aircraft capability
- **Clear behavior**: Does NOT clear on input. Clears when constraint is modified or path is recalculated.

### DRAG REQUIRED

- **Priority**: 1 (SAFETY)
- **Source**: nav
- **Triggers**:
  - Descent profile is too high/fast for idle descent
  - Aircraft cannot meet vertical path without additional drag
  - Speed/altitude constraint conflict
- **Clear behavior**: Does NOT clear on input. Clears when descent path becomes feasible.
