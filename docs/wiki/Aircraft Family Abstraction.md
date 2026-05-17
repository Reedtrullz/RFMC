# Aircraft Family Abstraction

The project keeps Boeing and Airbus behavior separate while sharing trainer infrastructure where possible.

Shared:

- Display grid and semantic display segments.
- Scratchpad/message behavior.
- LNAV/VNAV/performance-derived trainer models.
- Training progress selectors.
- Backend display transport.

Aircraft-specific:

- Page names and workflow order.
- CDU/MCDU key layout and labels.
- Boeing LNAV/VNAV terminology versus Airbus managed/selected terminology.
- MCP versus FCU presentation.
- Boeing-first workflow completion priority.

See `docs/AIRCRAFT_ABSTRACTION.md` and `docs/SCOPE.md`.
