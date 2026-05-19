# CDU Page Grammar

**Last updated:** 2026-05-16

This document specifies the 24×14 character grid grammar used to render Boeing CDU and Airbus MCDU pages. All page renderers (`*.grid.ts`) produce `DisplaySegment[]` arrays that follow these rules. Layout violations (overflow, overlap) are detected by the grammar validation layer and reported as test failures.

## Grid Specification

```
Columns: 0 ───────────────────────────── 23  (24 columns)
Rows:    0  Title row
        1  Label / data pair (LSK L1/R1)
        2  Label / data pair (LSK L2/R2)
        3  Label / data pair (LSK L3/R3)
        4  Label / data pair (LSK L4/R4)
        5  Label / data pair (LSK L5/R5)
        6  Label / data pair (LSK L6/R6)
        7  Additional content (if needed)
         ...
       12  Additional content
       13  Scratchpad row (separate render layer)
```

## Row Rules

### Title Row (Row 0)

- Spans full width (24 characters)
- White text on colored background (Boeing: inverse green, Airbus: inverse cyan)
- Contains page name (e.g., "IDENT") left-aligned or centered
- May include page indicator (e.g., "1/1") at column 20+

### Label Rows (Rows 1-6, odd)

- Left label at column 0-2 (e.g., "MODEL", "POS", "ZFW")
- Right label at column 20+ (e.g., "1/1", "POS INIT>")
- Left labels are white (Boeing) or white (Airbus)
- Each label row aligns with LSK L1-L6 (left) and R1-R6 (right)

### Data Rows (Rows 2-13, even)

- Data fields placed at the same column as their corresponding label
- Boeing: green text for active data, magenta for placeholder/required
- Airbus: green for active data, magenta for placeholder, amber for general text
- Boxed fields (required entry) rendered with box characters or inverse styling

### Scratchpad Row (Row 13)

- Rendered separately from the 14 page rows
- Contains user input buffer or highest-priority scratchpad message
- Blinking cursor at end of buffer text
- Error messages display in amber (Boeing) or amber flash (Airbus)

## Selectable Fields and LSK Mapping

Each selectable field is mapped to a Line Select Key (LSK):

| LSK   | Boeing Page                         | Airbus Page                         |
| ----- | ----------------------------------- | ----------------------------------- |
| L1-L6 | Left-side fields                    | Left-side fields                    |
| R1-R6 | Right-side fields / page navigation | Right-side fields / page navigation |

LSK actions are defined in `lskActions` object:

```ts
lskActions: {
  L1: 'data_index',     // Navigate to DATA INDEX page
  L2: 'set_flt_nbr',    // Set flight number from scratchpad
  L3: 'set_cost_index', // Set cost index from scratchpad
  R6: 'init_b',         // Navigate to INIT B page
}
```

## Display Features

### Boxed Required Fields

Fields that require user entry render with visual box indicators (inverse video or bracket characters at data boundaries).

### Dashes and Slashes

Empty/placeholder fields display dash patterns (e.g., `-----` or `---.-`) matching the expected value format.

### Small vs Large Text

- Small text (9px): secondary information, constraints, line labels
- Large text (11px): primary data, scratchpad input, critical values

### ACT/MOD States

- **ACT (Active)**: Standard display, route is confirmed
- **MOD (Modified)**: Pages show "TMPY" prefix (Airbus) or modified-row highlighting (Boeing) when route has pending EXEC-pending changes

### EXEC-Pending Display

When `state.isModified === true` and `state.execLit === true`:

- The EXEC annunciator light glows
- Pages may show dual ACT/MOD data or TMPY indicators
- EXEC button press applies pending changes and clears modified state

### Route Discontinuity Rendering

| Aircraft | Display                                                         |
| -------- | --------------------------------------------------------------- |
| Boeing   | `----- ROUTE DISCONTINUITY -----` in amber/magenta              |
| Airbus   | `----- F-PLN DISCONTINUITY -----` in amber, spanning full width |

Discontinuities are first-class `RouteDiscontinuity` objects in the route model, not boolean flags.

## Aircraft-Specific Differences

| Feature                        | Boeing CDU                    | Airbus MCDU                        |
| ------------------------------ | ----------------------------- | ---------------------------------- |
| Default text color             | Green (`cdu-text`)            | Amber (`cdu-amber`)                |
| Title background               | Inverse green                 | Inverse cyan                       |
| Data field color (active)      | Green                         | Green                              |
| Data field color (placeholder) | Magenta                       | Magenta                            |
| Small text size                | 9px                           | 9px                                |
| EXEC semantics                 | EXEC confirms pending changes | INSERT confirms individual changes |
| Page navigation                | L6/R6 `<` `>` arrows          | NEXT PHASE>, page index numbers    |

## Grammar Validation

The grammar layer validates that:

1. No segment exceeds 24 columns (`col + text.length ≤ 24`)
2. No overlapping segments (unless explicitly allowed)
3. LSK fields appear on valid selectable rows (1-6)
4. Scratchpad row (13) is reserved for scratchpad only

Invalid page definitions fail loudly in development and test environments through explicit test assertions.

## Example: Boeing IDENT Page Grammar

```ts
export function renderBoeingIdentGrid(state: FMCState): DisplayData {
  const { ident } = state;
  const segments: DisplaySegment[] = [
    seg('IDENT', 0, 1, { color: 'white', inverse: true }),
    seg('1/1', 0, 21, { color: 'white', inverse: true, size: 'small' }),
    seg('MODEL', 1, 1, { color: 'white' }),
    seg(ident.aircraftType || '737-800', 2, 1, { color: 'green' }),
    seg('NAV DATA', 3, 1, { color: 'white' }),
    seg(ident.navDataVersion || 'OCT05NOV01', 4, 1, { color: 'green' }),
    seg('NAV DATA>', 4, 20, { color: 'green', size: 'small' }),
    // ... more rows
  ];
  return {
    title: 'IDENT',
    lines: segmentsToLines(segments),
    lskActions: { R2: 'nav_data', L6: 'menu', R6: 'pos_init' },
  };
}
```
