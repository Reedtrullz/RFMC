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
    this.navaids['LON'] = { ident: 'LON', type: 'VORDME', frequency: '113.6', lat: 51.4875, lon: -0.4500 };
    this.navaids['SEA'] = { ident: 'SEA', type: 'VORTAC', frequency: '116.8', lat: 47.4354, lon: -122.3113 };

    // Procedures (KSEA ELMAA4 SID)
    this.procedures.push({
      airportIcao: 'KSEA',
      type: 'SID',
      ident: 'ELMAA4',
      runway: '16L',
      commonLegs: [
        { type: 'VA', heading: 161, altitude: 1500 }, // Heading to Altitude
        { type: 'DF', fixIdent: 'ELMAA', altitude: 5000 }, // Direct to Fix
      ],
      transitions: [
        { ident: 'HQM', legs: [{ type: 'TF', fixIdent: 'HQM' }] }
      ]
    });

    // Procedures (KSEA HAWKZ7 STAR)
    this.procedures.push({
      airportIcao: 'KSEA',
      type: 'STAR',
      ident: 'HAWKZ7',
      commonLegs: [
        { type: 'IF', fixIdent: 'HAWKZ', altitude: 12000, speed: 250 },
        { type: 'TF', fixIdent: 'LIYTE', altitude: 8000, speed: 230 },
        { type: 'TF', fixIdent: 'CHINS', altitude: 6000, speed: 210 },
      ],
      transitions: [
        { ident: 'YKM', legs: [{ type: 'TF', fixIdent: 'TITUS' }, { type: 'TF', fixIdent: 'HAWKZ' }] }
      ]
    });

    // Procedures (Simplified demo)
    this.procedures.push({
      airportIcao: 'KJFK',
      type: 'SID',
      ident: 'BETTE3',
      runway: '31L',
      transitions: [{ ident: 'BETTE', legs: [{ type: 'TF', fixIdent: 'BETTE' }] }],
      commonLegs: [{ type: 'IF', fixIdent: 'KJFK' }, { type: 'TF', fixIdent: 'CANAR' }],
    });
  }

  public getAirport(icao: string): Airport | undefined {
    return this.airports[icao.toUpperCase()];
  }

  public getNavaid(ident: string): Navaid | undefined {
    return this.navaids[ident.toUpperCase()];
  }

  public getProcedures(airportIcao: string): Procedure[] {
    return this.procedures.filter(p => p.airportIcao === airportIcao.toUpperCase());
  }

  public getActiveNavDataCycle(): string {
    return "FMC21A1";
  }

  public getEffectiveDate(): string {
    return "OCT05/26";
  }

  public getExpiryDate(): string {
    return "NOV01/26";
  }
}

export const navDatabase = new NavDatabaseService();
