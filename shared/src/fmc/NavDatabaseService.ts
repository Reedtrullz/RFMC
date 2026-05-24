import { Airport, Navaid, Procedure, Runway, NavFix } from '../navdata/navdataTypes';

export class NavDatabaseService {
  private airports: Record<string, Airport> = {};
  private navaids: Record<string, Navaid> = {};
  private procedures: Procedure[] = [];

  constructor() {
    this.loadDemoData();
  }

  private loadDemoData() {
    // KSEA
    const kseaRunways: Runway[] = [
      { ident: '16L', magneticCourse: 161, thresholdLat: 47.4438, thresholdLon: -122.3017, elevationFt: 432 },
      { ident: '34R', magneticCourse: 341, thresholdLat: 47.4438, thresholdLon: -122.3017, elevationFt: 432 },
    ];
    this.airports['KSEA'] = {
      icao: 'KSEA',
      name: 'Seattle-Tacoma Intl',
      lat: 47.4438,
      lon: -122.3017,
      elevationFt: 432,
      runways: kseaRunways,
    };

    // Navaids
    this.navaids['JFK'] = { ident: 'JFK', type: 'VORDME', frequency: '115.9', lat: 40.6327, lon: -73.7709 };
    this.navaids['LON'] = { ident: 'LON', type: 'VORDME', frequency: '113.6', lat: 51.4875, lon: -0.45 };
    this.navaids['SEA'] = { ident: 'SEA', type: 'VORTAC', frequency: '116.8', lat: 47.4354, lon: -122.3113 };

    // Procedures (KSEA ELMAA4 SID)
    this.procedures.push({
      airportIcao: 'KSEA',
      type: 'SID',
      ident: 'ELMAA4',
      runway: '16L',
      commonLegs: [
        { type: 'VA', courseDeg: 161, altitudeConstraint: { value: 1500, type: 'AT' } }, // Heading to Altitude
        { type: 'DF', fixIdent: 'ELMAA', altitudeConstraint: { value: 5000, type: 'AT' } }, // Direct to Fix
      ],
      transitions: [{ ident: 'HQM', legs: [{ type: 'TF', fixIdent: 'HQM' }] }],
    });

    // Procedures (KSEA HAWKZ7 STAR)
    this.procedures.push({
      airportIcao: 'KSEA',
      type: 'STAR',
      ident: 'HAWKZ7',
      commonLegs: [
        {
          type: 'IF',
          fixIdent: 'HAWKZ',
          altitudeConstraint: { value: 12000, type: 'AT' },
          speedConstraint: { value: 250, type: 'AT' },
        },
        {
          type: 'TF',
          fixIdent: 'LIYTE',
          altitudeConstraint: { value: 8000, type: 'AT' },
          speedConstraint: { value: 230, type: 'AT' },
        },
        {
          type: 'TF',
          fixIdent: 'CHINS',
          altitudeConstraint: { value: 6000, type: 'AT' },
          speedConstraint: { value: 210, type: 'AT' },
        },
      ],
      transitions: [
        {
          ident: 'YKM',
          legs: [
            { type: 'TF', fixIdent: 'TITUS' },
            { type: 'TF', fixIdent: 'HAWKZ' },
          ],
        },
      ],
    });

    // Procedures (Simplified demo)
    this.procedures.push({
      airportIcao: 'KJFK',
      type: 'SID',
      ident: 'BETTE3',
      runway: '31L',
      transitions: [{ ident: 'BETTE', legs: [{ type: 'TF', fixIdent: 'BETTE' }] }],
      commonLegs: [
        { type: 'IF', fixIdent: 'KJFK' },
        { type: 'TF', fixIdent: 'CANAR' },
      ],
    });

    // ENVA Trondheim Værnes
    const envaRunways: Runway[] = [
      { ident: '09', magneticCourse: 88, thresholdLat: 63.457, thresholdLon: 10.91, elevationFt: 56 },
      { ident: '27', magneticCourse: 268, thresholdLat: 63.457, thresholdLon: 10.9383, elevationFt: 56 },
    ];
    this.airports['ENVA'] = {
      icao: 'ENVA',
      name: 'Trondheim Værnes',
      lat: 63.4575,
      lon: 10.9242,
      elevationFt: 56,
      runways: envaRunways,
    };
    this.navaids['TRD'] = { ident: 'TRD', type: 'VORDME', frequency: '114.4', lat: 63.455, lon: 10.9183 };
  }

  public getAirport(icao: string): Airport | undefined {
    return this.airports[icao.toUpperCase()];
  }

  public getNavaid(ident: string): Navaid | undefined {
    return this.navaids[ident.toUpperCase()];
  }

  public getProcedures(airportIcao: string): Procedure[] {
    return this.procedures.filter((p) => p.airportIcao === airportIcao.toUpperCase());
  }

  public getActiveNavDataCycle(): string {
    return 'FMC21A1';
  }

  public getEffectiveDate(): string {
    return 'OCT05/26';
  }

  public getExpiryDate(): string {
    return 'NOV01/26';
  }
}

export const navDatabase = new NavDatabaseService();
