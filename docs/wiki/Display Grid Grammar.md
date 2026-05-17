# Display Grid Grammar

CDU/MCDU display output uses a strict 24-column by 14-row trainer grid.

The grid model protects:

- Row and column bounds.
- Segment overflow.
- Cell overlap.
- Semantic roles such as title, label, active data, modified data, guidance, warning, and scratchpad.

Display changes should preserve the grid contract and renderer grammar tests.

See `docs/CDU_PAGE_GRAMMAR.md`.
