# Scratchpad And Validation Engine

The scratchpad/message layer centralizes trainer feedback for successful entries, invalid data, and FMC-style messages.

Validation covers common trainer inputs such as:

- ICAO airport identifiers.
- V-speed ordering.
- QNH ranges.
- Wind direction/speed.
- Temperatures and altitude-like entries.

New actions should return typed action results and use the centralized scratchpad adapter instead of ad hoc error state.

See `docs/SCRATCHPAD_VALIDATION.md`.
