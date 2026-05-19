# Navdata Schema Plan

This is the Phase 4 target schema for ARINC-lite trainer behavior. It is intentionally smaller than full ARINC 424 and should support only the trainer workflows that are testable in VirtualCDU.

## Goals

- Store airports, runways, waypoints, procedures, transitions, constraints, and AIRAC/version metadata.
- Let SimBrief import match route text to supported SID/STAR/approach fixtures.
- Render supported procedure legs and constraints on LEGS.
- Surface clear mismatch warnings when procedure data is unavailable.

## Initial Entities

```ts
interface NavdataCycle {
  provider: string;
  cycle: string;
  effectiveFrom: string;
  effectiveTo: string;
}

interface AirportRecord {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  runways: RunwayRecord[];
  procedures: ProcedureRecord[];
}

interface RunwayRecord {
  ident: string;
  lat?: number;
  lon?: number;
  course?: number;
  lengthFt?: number;
  ils?: { frequency: string; course: number };
}

interface ProcedureRecord {
  id: string;
  airport: string;
  type: 'SID' | 'STAR' | 'APPROACH';
  runway?: string;
  transitions: ProcedureTransition[];
  legs: ProcedureLeg[];
}

interface ProcedureTransition {
  id: string;
  legs: ProcedureLeg[];
}

interface ProcedureLeg {
  type: 'IF' | 'TF' | 'DF' | 'CF' | 'RF' | 'RW' | 'HM' | 'DISCONTINUITY';
  fix?: string;
  course?: number;
  distanceNm?: number;
  turnDirection?: 'L' | 'R';
  altitude?: string;
  speed?: string;
}
```

## First Supported Leg Types

| Type          | Meaning                 | Phase 4 support                  |
| ------------- | ----------------------- | -------------------------------- |
| IF            | Initial fix             | Required                         |
| TF            | Track to fix            | Required                         |
| DF            | Direct to fix           | Required                         |
| CF            | Course to fix           | Required                         |
| RW            | Runway fix              | Required                         |
| HM            | Hold/manual termination | Required for HOLD integration    |
| DISCONTINUITY | Route discontinuity     | Required                         |
| RF            | Radius-to-fix           | Optional in first implementation |

## Fixture Policy

- Start with `fixtures/simbrief/routes.json`.
- Expand to at least 20 fixtures before the Phase 4 exit gate.
- Each fixture must define expected procedure matches and expected mismatch warnings.

## Data Source Review

Before importing external navdata, document:

- License and redistribution constraints.
- Cost and account requirements.
- AIRAC update mechanism.
- Offline cache strategy.
- Whether data can be used in an open-source repo, local-only installation, or both.
