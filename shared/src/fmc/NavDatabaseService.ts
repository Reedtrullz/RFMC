import { Airport, Navaid, Procedure, Runway, NavFix } from '../navdata/navdataTypes';

export class NavDatabaseService {
  private airports: Record<string, Airport> = {};
  private navaids: Record<string, Navaid> = {};
  private procedures: Procedure[] = [];

  constructor() {
    this.loadDemoData();
  }

  private loadDemoData() {
    // KJFK
    const jfkRunways: Runway[] = [
      { ident: '31L', magneticCourse: 314, thresholdLat: 40.6413, thresholdLon: -73.7781, elevationFt: 13 },
      { ident: '13R', magneticCourse: 134, thresholdLat: 40.6413, thresholdLon: -73.7781, elevationFt: 13 },
    ];
    this.airports['KJFK'] = {
      icao: 'KJFK',
      name: 'John F Kennedy Intl',
      lat: 40.6413,
      lon: -73.7781,
      elevationFt: 13,
      runways: jfkRunways,
    };

    // EGLL
    const egllRunways: Runway[] = [
      { ident: '27L', magneticCourse: 272, thresholdLat: 51.4706, thresholdLon: -0.4619, elevationFt: 83 },
      { ident: '09R', magneticCourse: 092, thresholdLat: 51.4706, thresholdLon: -0.4619, elevationFt: 83 },
    ];
    this.airports['EGLL'] = {
      icao: 'EGLL',
      name: 'London Heathrow',
      lat: 51.4706,
      lon: -0.4619,
      elevationFt: 83,
      runways: egllRunways,
    };

    // Navaids
    this.navaids['JFK'] = { ident: 'JFK', type: 'VORDME', frequency: '115.9', lat: 40.6327, lon: -73.7709 };
    this.navaids['LON'] = { ident: 'LON', type: 'VORDME', frequency: '113.6', lat: 51.4875, lon: -0.4500 };

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
