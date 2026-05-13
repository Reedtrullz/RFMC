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

export type ProcedureType = 'SID' | 'STAR' | 'APPROACH';

export type ArincLegType = 'IF' | 'TF' | 'DF' | 'CF' | 'RF' | 'HM';

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

export type Procedure = {
  airport: string;
  type: ProcedureType;
  ident: string;
  runway?: string;
  transition?: string;
  legs: ProcedureLeg[];
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
  type: 'VOR' | 'DME' | 'VORDME' | 'NDB' | 'ILS' | 'LOC';
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
  airportIcao: string;
  type: ProcedureType;
  ident: string;
  runway?: string;
  transitions: ProcedureTransition[];
  commonLegs: ProcedureLeg[]; // Added to handle common legs before/after transitions
}
