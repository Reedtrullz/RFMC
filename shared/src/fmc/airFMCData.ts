/**
 * Mock navigation data for the FMC.
 * In production, this would be loaded from a Navigraph or Aerosoft database.
 */

export const AIRPORTS: Record<string, { name: string; lat: number; lon: number; runways: string[] }> = {
  KJFK: { name: 'John F Kennedy Intl', lat: 40.6413, lon: -73.7781, runways: ['04L', '04R', '13L', '13R', '22L', '22R', '31L', '31R'] },
  KLAX: { name: 'Los Angeles Intl', lat: 33.9425, lon: -118.4081, runways: ['06L', '06R', '07L', '07R', '24L', '24R', '25L', '25R'] },
  KORD: { name: 'OHare Intl', lat: 41.9742, lon: -87.9073, runways: ['04L', '04R', '09L', '09R', '10C', '10L', '10R', '22L', '22R', '27L', '27R', '28C', '28L', '28R'] },
  KLAS: { name: 'Harry Reid Intl', lat: 36.0840, lon: -115.1537, runways: ['01L', '01R', '08L', '08R', '19L', '19R', '26L', '26R'] },
  KDCA: { name: 'Ronald Reagan Washington Natl', lat: 38.8512, lon: -77.0402, runways: ['01', '04', '15', '19', '22', '33'] },
  KATL: { name: 'Hartsfield-Jackson Atlanta Intl', lat: 33.6407, lon: -84.4277, runways: ['08L', '08R', '09L', '09R', '10', '26L', '26R', '27L', '27R', '28'] },
  KSEA: { name: 'Seattle-Tacoma Intl', lat: 47.4502, lon: -122.3088, runways: ['16L', '16C', '16R', '34L', '34C', '34R'] },
  KSFO: { name: 'San Francisco Intl', lat: 37.6213, lon: -122.3790, runways: ['01L', '01R', '10L', '10R', '19L', '19R', '28L', '28R'] },
  KMIA: { name: 'Miami Intl', lat: 25.7959, lon: -80.2870, runways: ['08L', '08R', '09', '12', '26L', '26R', '27', '30'] },
  EGLL: { name: 'London Heathrow', lat: 51.4700, lon: -0.4543, runways: ['09L', '09R', '27L', '27R'] },
  LFPG: { name: 'Paris Charles de Gaulle', lat: 49.0097, lon: 2.5479, runways: ['08L', '08R', '09L', '09R', '26L', '26R', '27L', '27R'] },
  EDDF: { name: 'Frankfurt', lat: 50.0379, lon: 8.5622, runways: ['07L', '07C', '07R', '18', '25L', '25C', '25R', '36'] },
};

export const WAYPOINTS: Record<string, { lat: number; lon: number }> = {
  RBV: { lat: 40.3682, lon: -74.4343 },
  LENDY: { lat: 39.8750, lon: -75.2500 },
  FRDMM: { lat: 39.5000, lon: -75.7500 },
  BETTE: { lat: 40.5000, lon: -73.7500 },
  JFK: { lat: 40.6333, lon: -73.7667 },
  DIXIE: { lat: 39.9722, lon: -75.1867 },
  MXE: { lat: 39.9000, lon: -75.3167 },
  OTT: { lat: 38.7500, lon: -76.8833 },
  AML: { lat: 38.9167, lon: -77.1167 },
  AYAZE: { lat: 42.5833, lon: -80.3500 },
  BRNAN: { lat: 41.1833, lon: -75.9167 },
  CHAAP: { lat: 42.5167, lon: -79.2500 },
  DORET: { lat: 41.7500, lon: -75.5833 },
  EWC: { lat: 40.7833, lon: -80.2167 },
  FJC: { lat: 40.5167, lon: -74.5833 },
  GDM: { lat: 42.5500, lon: -72.0167 },
  HNK: { lat: 41.5833, lon: -75.4500 },
  IGN: { lat: 41.6667, lon: -74.0667 },
  JAIKE: { lat: 40.4667, lon: -75.4833 },
  KEYNN: { lat: 43.1000, lon: -80.3333 },
  LRP: { lat: 40.1167, lon: -76.3000 },
  MIP: { lat: 40.4167, lon: -75.0167 },
  PSB: { lat: 40.8333, lon: -78.0833 },
  RACKI: { lat: 41.1500, lon: -76.0333 },
  SEG: { lat: 40.6167, lon: -76.8500 },
  TRYBE: { lat: 44.0333, lon: -77.6833 },
  ULW: { lat: 42.0500, lon: -77.1500 },
  VILLA: { lat: 42.9167, lon: -79.9167 },
  WOZEE: { lat: 42.7333, lon: -78.8500 },
  XR: { lat: 46.7500, lon: -80.5833 },
  YQO: { lat: 42.5833, lon: -82.0667 },
  ZANDR: { lat: 44.2167, lon: -80.9167 },
};

export const AIRWAYS: Record<string, string[]> = {
  'J42': ['RBV', 'LENDY', 'FRDMM'],
  'J75': ['DIXIE', 'MXE', 'OTT'],
  'J191': ['RBV', 'JFK', 'DIXIE'],
  'J48': ['ODF', 'MACEY', 'FLO'],
  'J6': ['RBV', 'BETTE', 'JFK'],
  'V123': ['LENDY', 'FRDMM', 'DIXIE'],
  'V229': ['MXE', 'AML', 'OTT'],
  'V308': ['RBV', 'DIXIE', 'MXE'],
  'Q42': ['RBV', 'LENDY', 'DIXIE'],
  'Q97': ['MXE', 'OTT', 'AML'],
};
