import { MockSimConnectAdapter } from './mock-simconnect';
import type { IAircraftAdapter } from './IAircraftAdapter';
import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);

export type AircraftAdapterKind = 'pmdg' | 'mock' | 'fbw-a320' | 'fbw';

export function createAircraftAdapter(kind = process.env.AIRCRAFT_ADAPTER || 'mock'): IAircraftAdapter {
  const normalized = kind.trim().toLowerCase();
  if (normalized === 'mock' || normalized === 'mock-simconnect') {
    return new MockSimConnectAdapter();
  }

  if (normalized === 'pmdg' || normalized === 'pmdg-737') {
    if (process.platform !== 'win32') {
      throw new Error(
        'PMDG adapter is only supported in a Windows/MSFS bridge environment. Use AIRCRAFT_ADAPTER=mock on CI and VPS deployments.',
      );
    }
    const { PMDG737Adapter } = _require('./pmdg-737');
    return new PMDG737Adapter();
  }

  if (normalized === 'fbw-a320' || normalized === 'fbw') {
    if (process.platform !== 'win32') {
      throw new Error(
        'FBW A320 adapter is only supported in a Windows/MSFS bridge environment. Use AIRCRAFT_ADAPTER=mock on CI and VPS deployments.',
      );
    }
    const { FBWA320Adapter } = _require('./fbw-a320');
    return new FBWA320Adapter();
  }

  throw new Error(`Unsupported AIRCRAFT_ADAPTER: ${kind}`);
}
