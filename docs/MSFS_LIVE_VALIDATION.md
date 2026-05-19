# MSFS Live Validation Checklist

This checklist is required before PMDG connected mode can be called verified. It must be run on Windows with MSFS and PMDG installed.

## Environment

| Field                 | Value                      |
| --------------------- | -------------------------- |
| Date                  |                            |
| VirtualCDU commit     |                            |
| Windows version       |                            |
| MSFS version          |                            |
| PMDG aircraft/version |                            |
| Network topology      | Same machine / LAN / other |

## Required PMDG Round Trip

| Check                                           | Pass | Evidence |
| ----------------------------------------------- | ---- | -------- |
| WebSocket bridge starts cleanly                 |      |          |
| PMDG adapter connects                           |      |          |
| Adapter reports aircraft type and capabilities  |      |          |
| VirtualCDU sends `RTE` keypress                 |      |          |
| PMDG CDU changes page                           |      |          |
| VirtualCDU reads back updated display           |      |          |
| Scratchpad input round trip works               |      |          |
| LSK input round trip works                      |      |          |
| Reconnect after bridge restart works            |      |          |
| Reconnect after aircraft reload works           |      |          |
| 30-minute connected session has no crash/desync |      |          |

## CONTROL-Mode Mock Coverage Boundary

Local CI and macOS development can validate mock adapter behavior, backend FMC rendering, WebSocket input/display messages, malformed-message handling, and reconnect behavior. This evidence is useful, but it is not live PMDG validation.

Record the exact automated command and commit when citing mock evidence:

| Mock check                    | Command               | Commit | Evidence |
| ----------------------------- | --------------------- | ------ | -------- |
| Backend FMC parity            | `npm test -- --run`   |        |          |
| Bridge/WebSocket mock adapter | `npm test -- --run`   |        |          |
| Smoke E2E with mock adapter   | `npm run test:e2e:ci` |        |          |

## Evidence Requirements

- Capture the VirtualCDU commit SHA.
- Capture bridge logs for connection, keypress, display readback, reconnect, and shutdown.
- Capture screenshots or video of the PMDG CDU before and after at least one page key, one alphanumeric scratchpad entry, and one LSK press.
- Attach any server-side errors or dropped-message counters.
- Do not mark the PMDG path verified from mock adapter results alone.

## Metrics

| Metric                  |     Target | Result |
| ----------------------- | ---------: | -----: |
| Connection success rate |     >= 98% |        |
| Average display latency |    < 80 ms |        |
| Dropped messages        | 0 critical |        |
| Desyncs in 30 minutes   |          0 |        |

## Notes

- Record logs and screenshots for failures.
- Do not mark Phase 5 complete from mock adapter tests alone.
