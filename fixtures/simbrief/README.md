# SimBrief Route Fixtures

These fixtures are versioned training/test inputs for Phase 4 navdata and SimBrief realism work.

Each fixture should include:

- Origin, destination, alternate when known.
- Flight number, cost index, cruise altitude, fuel/ZFW when available.
- Route string.
- Expected SID/STAR/approach matching behavior.
- Expected warnings for unsupported procedures or navdata mismatches.

The fixture set must stay at or above 20 routes before the Phase 4 exit gate. The current regression test enforces that minimum.
