import { MockSimConnectAdapter } from './mock-simconnect';
import type { IAircraftAdapter } from './IAircraftAdapter';

export type AircraftAdapterKind = 'pmdg' | 'mock';

export function createAircraftAdapter(kind = process.env.AIRCRAFT_ADAPTER || 'mock'): IAircraftAdapter {
  const normalized = kind.trim().toLowerCase();
  if (normalized === 'mock' || normalized === 'mock-simconnect') {
    return new MockSimConnectAdapter();
  }

  if (normalized === 'pmdg' || normalized === 'pmdg-737') {
    throw new Error(
      'PMDG adapter is only supported in a Windows/MSFS bridge environment. Use AIRCRAFT_ADAPTER=mock on CI and VPS deployments.',
    );
  }

  throw new Error(`Unsupported AIRCRAFT_ADAPTER: ${kind}`);
}
