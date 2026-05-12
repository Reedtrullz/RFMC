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

export type Airport = NavFix & {
  type: 'AIRPORT';
  icao: string;
  runways: Runway[];
};

export type Runway = {
  ident: string;
  lat: number;
  lon: number;
  heading: number;
  length: number;
};
