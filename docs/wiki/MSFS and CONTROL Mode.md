# MSFS And CONTROL Mode

CONTROL mode makes the backend FMC engine authoritative for display generation while the frontend relays inputs and shows updates over WebSocket.

Local CI can prove:

- Mock adapter behavior.
- WebSocket protocol behavior.
- Backend FMC rendering.
- CONTROL-mode input/display plumbing.

Local macOS CI cannot prove live PMDG/MSFS round trips. That requires Windows + MSFS + PMDG and must be recorded in `docs/MSFS_LIVE_VALIDATION.md`.
