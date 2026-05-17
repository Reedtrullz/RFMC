# Boeing 737 CDU Workflow

Primary trainer flow:

```txt
IDENT -> POS INIT -> RTE -> DEP/ARR -> LEGS -> PERF INIT -> THRUST LIM -> TAKEOFF REF -> EXEC
```

Supported foundations include route entry, procedure selection, LEGS review, V-speed validation, thrust-limit selection, HOLD staging, FIX overlays, DIR INTC, and PROGRESS/LNAV/VNAV trainer cues.

Remaining workflow work focuses on EXEC-staged LEGS edits, explicit CLR/DEL cancellation, stronger discontinuity blocking, and full frontend/backend parity for the same input sequences.
