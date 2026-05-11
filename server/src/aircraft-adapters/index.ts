import { MockSimConnectAdapter } from './mock-simconnect';
import { PMDG737Adapter } from './pmdg-737';
import type { IAircraftAdapter } from './IAircraftAdapter';

export type AircraftAdapterKind = 'pmdg' | 'mock';

export function createAircraftAdapter(kind = process.env.AIRCRAFT_ADAPTER || 'pmdg'): IAircraftAdapter {
  const normalized = kind.trim().toLowerCase();
  if (normalized === 'mock' || normalized === 'mock-simconnect') {
    return new MockSimConnectAdapter();
  }
  return new PMDG737Adapter();
}
