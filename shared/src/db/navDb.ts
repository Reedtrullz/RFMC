import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { ProcedureLeg } from '../fmc/navdataSchema';

export type NavdataStatusValue = {
  isPopulated: boolean;
  airacCycle: string;
  version: number;
};

export type NavdataCheckpointValue = {
  airacCycle: string;
  version: number;
  storeName: string;
  batchIndex: number;
  processedItems: number;
};

export type DbMetadataValue = NavdataStatusValue | NavdataCheckpointValue;

export interface DbMetadata {
  key: string;
  value: DbMetadataValue;
}

export interface AirportRecord {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  elevation: number;
  runways: string[];
}

export interface RunwayRecord {
  id: string; // e.g. "ENGM-01L"
  airport_icao: string;
  ident: string;
  length: number;
  width: number;
  heading: number;
  lat: number;
  lon: number;
  ils_freq?: number;
}

export interface WaypointRecord {
  id: string; // Compound ID, e.g., "OSL-VOR" or "LUNIP-WP"
  ident: string;
  lat: number;
  lon: number;
  type?: string;
  country_code?: string;
}

export interface ProcedureRecord {
  id: string; // e.g. "ENGM-SID-LUNIP1A"
  airport_icao: string;
  type: 'SID' | 'STAR' | 'APPROACH';
  ident: string;
  transition?: string;
  legs: ProcedureLeg[];
}

export interface NavDBSchema extends DBSchema {
  metadata: {
    key: string;
    value: DbMetadata;
  };
  airports: {
    key: string;
    value: AirportRecord;
  };
  runways: {
    key: string;
    value: RunwayRecord;
    indexes: {
      'by-airport': string;
    };
  };
  waypoints: {
    key: string;
    value: WaypointRecord;
    indexes: {
      'by-ident': string;
    };
  };
  procedures: {
    key: string;
    value: ProcedureRecord;
    indexes: {
      'by-airport': string;
      'by-type': string;
    };
  };
}

const DB_NAME = 'virtual-cdu-navdata';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<NavDBSchema>> | null = null;

export function getNavDb(): Promise<IDBPDatabase<NavDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<NavDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('airports')) {
          db.createObjectStore('airports', { keyPath: 'icao' });
        }
        if (!db.objectStoreNames.contains('runways')) {
          const runwayStore = db.createObjectStore('runways', { keyPath: 'id' });
          runwayStore.createIndex('by-airport', 'airport_icao');
        }
        if (!db.objectStoreNames.contains('waypoints')) {
          const waypointStore = db.createObjectStore('waypoints', { keyPath: 'id' });
          waypointStore.createIndex('by-ident', 'ident');
        }
        if (!db.objectStoreNames.contains('procedures')) {
          const procedureStore = db.createObjectStore('procedures', { keyPath: 'id' });
          procedureStore.createIndex('by-airport', 'airport_icao');
          procedureStore.createIndex('by-type', 'type');
        }
      },
    });
  }
  return dbPromise;
}

export async function getAirport(icao: string): Promise<AirportRecord | undefined> {
  const db = await getNavDb();
  return db.get('airports', icao);
}

export async function getRunwaysForAirport(icao: string): Promise<RunwayRecord[]> {
  const db = await getNavDb();
  return db.getAllFromIndex('runways', 'by-airport', icao);
}

export async function getWaypointsByIdent(ident: string): Promise<WaypointRecord[]> {
  const db = await getNavDb();
  return db.getAllFromIndex('waypoints', 'by-ident', ident);
}

export async function getProceduresForAirport(
  icao: string,
  type: 'SID' | 'STAR' | 'APPROACH',
): Promise<ProcedureRecord[]> {
  const db = await getNavDb();
  const allProcs = await db.getAllFromIndex('procedures', 'by-airport', icao);
  return allProcs.filter((p) => p.type === type);
}
