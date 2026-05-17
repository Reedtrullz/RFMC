import { NavFix, Procedure, Airport } from './navdataTypes';

export const NAV_FIXES: Record<string, NavFix> = {
  // KJFK
  'KJFK': { ident: 'KJFK', type: 'AIRPORT', lat: 40.6413, lon: -73.7781, elevationFt: 13 },
  'JFK': { ident: 'JFK', type: 'VOR', lat: 40.6327, lon: -73.7709, frequency: '115.9' },
  'CANAR': { ident: 'CANAR', type: 'WAYPOINT', lat: 40.5639, lon: -73.9167 },
  'BETTE': { ident: 'BETTE', type: 'WAYPOINT', lat: 40.3800, lon: -73.3500 },
  
  // KDCA
  'KDCA': { ident: 'KDCA', type: 'AIRPORT', lat: 38.8522, lon: -77.0378, elevationFt: 15 },
  'DCA': { ident: 'DCA', type: 'VOR', lat: 38.8510, lon: -77.0366, frequency: '111.0' },
  'FERRY': { ident: 'FERRY', type: 'WAYPOINT', lat: 38.9300, lon: -77.0600 },
  
  // Route JFK-DCA
  'RBV': { ident: 'RBV', type: 'VOR', lat: 40.2023, lon: -74.4950 },
  'ENO': { ident: 'ENO', type: 'VOR', lat: 39.3875, lon: -75.4325 },
  'SWANN': { ident: 'SWANN', type: 'WAYPOINT', lat: 39.1500, lon: -76.3500 },
  
  // ENGM
  'ENGM': { ident: 'ENGM', type: 'AIRPORT', lat: 60.1939, lon: 11.1004, elevationFt: 681 },
  'OSL': { ident: 'OSL', type: 'VOR', lat: 60.1417, lon: 11.0767 },
  'SOXOT': { ident: 'SOXOT', type: 'WAYPOINT', lat: 60.3000, lon: 11.2000 },
  
  // ENBR
  'ENBR': { ident: 'ENBR', type: 'AIRPORT', lat: 60.2934, lon: 5.2181, elevationFt: 164 },
  'BGO': { ident: 'BGO', type: 'VOR', lat: 60.2883, lon: 5.2533 },
  // Route ENGM-ENBR
  'LUNIP': { ident: 'LUNIP', type: 'WAYPOINT', lat: 60.1000, lon: 10.5000 },
  'PESOT': { ident: 'PESOT', type: 'WAYPOINT', lat: 60.1500, lon: 8.5000 },
  'LOGUT': { ident: 'LOGUT', type: 'WAYPOINT', lat: 60.2000, lon: 6.5000 },
  'ROWSY': { ident: 'ROWSY', type: 'WAYPOINT', lat: 46.5200, lon: -122.4519 },
};

export const PROCEDURES: Procedure[] = [
  {
    airport: 'KJFK',
    type: 'SID',
    ident: 'BETTE3',
    runway: '31L',
    legs: [
      { type: 'IF', fixIdent: 'KJFK' },
      { type: 'TF', fixIdent: 'CANAR', courseDeg: 225, distanceNm: 10, speedConstraint: { value: 250, type: 'BELOW' } },
      { type: 'TF', fixIdent: 'BETTE', courseDeg: 120, distanceNm: 25, altitudeConstraint: { value: 5000, type: 'ABOVE' } },
    ]
  },
  {
    airport: 'KDCA',
    type: 'STAR',
    ident: 'IRONS7',
    runway: '19',
    legs: [
      { type: 'IF', fixIdent: 'RBV' },
      { type: 'TF', fixIdent: 'ENO', courseDeg: 240, distanceNm: 50, altitudeConstraint: { value: 12000, type: 'AT' } },
      { type: 'TF', fixIdent: 'SWANN', courseDeg: 235, distanceNm: 35, altitudeConstraint: { value: 6000, type: 'AT' } },
      { type: 'TF', fixIdent: 'FERRY', courseDeg: 195, distanceNm: 15, speedConstraint: { value: 210, type: 'AT' } },
    ]
  },
  {
    airport: 'KDCA',
    type: 'APPROACH',
    ident: 'ILS19',
    runway: '19',
    legs: [
      { type: 'IF', fixIdent: 'FERRY' },
      { type: 'CF', fixIdent: 'DCA', courseDeg: 188, distanceNm: 5, altitudeConstraint: { value: 1500, type: 'AT' } },
    ]
  },
  {
    airport: 'ENGM',
    type: 'SID',
    ident: 'LUNIP1A',
    runway: '01L',
    legs: [
      { type: 'IF', fixIdent: 'ENGM' },
      { type: 'TF', fixIdent: 'SOXOT', courseDeg: 10, distanceNm: 5 },
      { type: 'TF', fixIdent: 'LUNIP', courseDeg: 280, distanceNm: 15, altitudeConstraint: { value: 7000, type: 'ABOVE' } },
    ]
  },
  {
    airport: 'ENBR',
    type: 'STAR',
    ident: 'LOGUT1B',
    runway: '17',
    legs: [
      { type: 'IF', fixIdent: 'LOGUT' },
      { type: 'TF', fixIdent: 'BGO', courseDeg: 260, distanceNm: 20, altitudeConstraint: { value: 4000, type: 'AT' } },
    ]
  }
];

export function getFix(ident: string): NavFix | undefined {
  return NAV_FIXES[ident];
}

export function getProcedures(airportIcao: string): Procedure[] {
  return PROCEDURES.filter(p => p.airport === airportIcao);
}
