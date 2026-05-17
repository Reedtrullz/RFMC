# Route Model And Navdata

RFMC uses deterministic trainer navdata and ARINC-lite fixtures, not global operational AIRAC data.

Current goals:

- Versioned route fixtures.
- Procedure expansion where scoped.
- SID/STAR mismatch warnings.
- Typed route discontinuities.
- Shared route truth for CDU/MCDU, ND, training, LNAV, and backend rendering.

See `docs/NAVDATA_SCHEMA.md`.
