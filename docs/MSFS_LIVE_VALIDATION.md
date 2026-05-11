# MSFS Live Validation Checklist

This checklist is required before PMDG connected mode can be called verified. It must be run on Windows with MSFS and PMDG installed.

## Environment

| Field | Value |
| --- | --- |
| Date |  |
| VirtualCDU commit |  |
| Windows version |  |
| MSFS version |  |
| PMDG aircraft/version |  |
| Network topology | Same machine / LAN / other |

## Required PMDG Round Trip

| Check | Pass | Evidence |
| --- | --- | --- |
| WebSocket bridge starts cleanly |  |  |
| PMDG adapter connects |  |  |
| Adapter reports aircraft type and capabilities |  |  |
| VirtualCDU sends `RTE` keypress |  |  |
| PMDG CDU changes page |  |  |
| VirtualCDU reads back updated display |  |  |
| Scratchpad input round trip works |  |  |
| LSK input round trip works |  |  |
| Reconnect after bridge restart works |  |  |
| Reconnect after aircraft reload works |  |  |
| 30-minute connected session has no crash/desync |  |  |

## Metrics

| Metric | Target | Result |
| --- | ---: | ---: |
| Connection success rate | >= 98% |  |
| Average display latency | < 80 ms |  |
| Dropped messages | 0 critical |  |
| Desyncs in 30 minutes | 0 |  |

## Notes

- Record logs and screenshots for failures.
- Do not mark Phase 5 complete from mock adapter tests alone.
