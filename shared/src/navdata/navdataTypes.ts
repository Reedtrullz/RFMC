export type FixType = 'AIRPORT' | 'WAYPOINT' | 'VOR' | 'NDB' | 'RUNWAY';

export type NavFix = {
  ident: string;
  type: FixType;
  lat: number;
  lon: number;
  elevationFt?: number;
  frequency?: string;
};

export type AltitudeConstraint = {
  value: number;
  type: 'AT' | 'ABOVE' | 'BELOW' | 'BETWEEN';
  value2?: number;
};

export type SpeedConstraint = {
  value: number;
  type: 'AT' | 'ABOVE' | 'BELOW';
};

export type ArincLegType = 'IF' | 'TF' | 'DF' | 'CF' | 'RF' | 'HM' | 'VA' | 'CA' | 'FA' | 'HA' | 'VM';

export type ProcedureLeg = {
  type: ArincLegType;
  fixIdent?: string;
  courseDeg?: number;
  distanceNm?: number;
  altitudeConstraint?: AltitudeConstraint;
  speedConstraint?: SpeedConstraint;
  isFlyOver?: boolean;
};

export type ExpandedLeg = {
  ident: string;
  lat: number;
  lon: number;
  type: string;
  altitudeConstraint?: AltitudeConstraint;
  speedConstraint?: SpeedConstraint;
  isFlyOver?: boolean;
};

export interface Airport {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  elevationFt: number;
  runways: Runway[];
}

export interface Runway {
  ident: string;
  magneticCourse: number;
  thresholdLat: number;
  thresholdLon: number;
  elevationFt: number;
}

export interface Navaid {
  ident: string;
  type: 'VOR' | 'DME' | 'VORDME' | 'NDB' | 'ILS' | 'LOC' | 'VORTAC' | 'TACAN';
  frequency?: string;
  lat: number;
  lon: number;
}

export type ProcedureType = 'SID' | 'STAR' | 'APPROACH';

export interface ProcedureTransition {
  ident: string;
  legs: ProcedureLeg[];
}

export interface Procedure {
  type: ProcedureType;
  ident: string;
  runway?: string;
  airportIcao?: string;
  transitions?: ProcedureTransition[];
  commonLegs?: ProcedureLeg[];

  // Backward compatibility fields
  airport?: string;
  legs?: ProcedureLeg[];
}
