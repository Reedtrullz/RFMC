# Airbus A320 MCDU Workflow

Scoped Airbus flow:

```txt
INIT A -> F-PLN -> DEP/ARR -> INIT B -> PERF TAKEOFF -> PROG / FUEL PRED
```

Airbus support is intentionally secondary to Boeing. Functional pages, partial pages, and display-only pages are tracked in `docs/SCOPE.md`.

Important rules:

- Do not use Boeing LNAV/VNAV labels where Airbus managed/selected wording is expected.
- Visible LSK actions must be functional or intentionally disabled.
- CONTROL-mode parity is required before a page is described as supported.
