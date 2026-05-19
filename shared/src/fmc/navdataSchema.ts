import type { AircraftType } from '../types/fmc';

export type ProcedureType = 'SID' | 'STAR' | 'APPROACH';
export type ProcedureLegType = 'IF' | 'TF' | 'DF' | 'CF' | 'RF' | 'RW' | 'HM' | 'DISCONTINUITY';

export interface NavdataCycle {
  provider: string;
  cycle: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface RunwayRecord {
  ident: string;
  lat?: number;
  lon?: number;
  course?: number;
  lengthFt?: number;
  ils?: { frequency: string; course: number };
}

export interface ProcedureLeg {
  type: ProcedureLegType;
  fix?: string;
  course?: number;
  distanceNm?: number;
  turnDirection?: 'L' | 'R';
  altitude?: string;
  speed?: string;
}

export interface ProcedureTransition {
  id: string;
  legs: ProcedureLeg[];
}

export interface ProcedureRecord {
  id: string;
  airport: string;
  type: ProcedureType;
  runway?: string;
  transitions: ProcedureTransition[];
  legs: ProcedureLeg[];
}

export interface AirportRecord {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  runways: RunwayRecord[];
  procedures: ProcedureRecord[];
}

export interface SimBriefRouteFixture {
  id: string;
  aircraft: AircraftType;
  origin: string;
  destination: string;
  alternate?: string;
  flightNumber: string;
  costIndex: number;
  cruiseAltitude: number;
  zfw: number;
  fuel: number;
  route: string;
  expected: {
    sid: string | null;
    star: string | null;
    approach: string | null;
    warnings: string[];
  };
}

export function validateIcao(value: string): boolean {
  return /^[A-Z]{4}$/.test(value);
}

export function validateRouteFixture(fixture: SimBriefRouteFixture): string[] {
  const errors: string[] = [];
  if (!fixture.id || !/^[a-z0-9-]+$/.test(fixture.id)) errors.push('id must be kebab-case');
  if (fixture.aircraft !== 'BOEING_737' && fixture.aircraft !== 'AIRBUS_A320')
    errors.push('aircraft must be supported');
  if (!validateIcao(fixture.origin)) errors.push('origin must be a four-letter ICAO');
  if (!validateIcao(fixture.destination)) errors.push('destination must be a four-letter ICAO');
  if (fixture.alternate && !validateIcao(fixture.alternate)) errors.push('alternate must be a four-letter ICAO');
  if (!fixture.flightNumber) errors.push('flightNumber is required');
  if (!Number.isFinite(fixture.costIndex) || fixture.costIndex < 0) errors.push('costIndex must be non-negative');
  if (!Number.isFinite(fixture.cruiseAltitude) || fixture.cruiseAltitude <= 0)
    errors.push('cruiseAltitude must be positive');
  if (!Number.isFinite(fixture.zfw) || fixture.zfw <= 0) errors.push('zfw must be positive');
  if (!Number.isFinite(fixture.fuel) || fixture.fuel <= 0) errors.push('fuel must be positive');
  if (!fixture.route.trim()) errors.push('route is required');
  if (!fixture.expected || !Array.isArray(fixture.expected.warnings))
    errors.push('expected warnings array is required');
  return errors;
}
