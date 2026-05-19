import { describe, expect, it, vi } from 'vitest';
import { createAircraftAdapter } from '../aircraft-adapters';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

vi.mock('../aircraft-adapters/pmdg-737', () => {
  throw new Error('PMDG adapter should not be imported by the adapter factory');
});

vi.mock('../aircraft-adapters/fbw-a320', () => {
  throw new Error('FBW A320 adapter should not be imported by the adapter factory');
});

describe('createAircraftAdapter', () => {
  it('creates the mock adapter for CI and local integration tests', () => {
    expect(createAircraftAdapter()).toBeInstanceOf(MockSimConnectAdapter);
    expect(createAircraftAdapter('mock')).toBeInstanceOf(MockSimConnectAdapter);
    expect(createAircraftAdapter('mock-simconnect')).toBeInstanceOf(MockSimConnectAdapter);
  });

  it('does not load PMDG or FBW A320 on non-bridge deployments', () => {
    expect(() => createAircraftAdapter('pmdg')).toThrow(/Windows\/MSFS bridge environment/);
    expect(() => createAircraftAdapter('pmdg-737')).toThrow(/Windows\/MSFS bridge environment/);
    expect(() => createAircraftAdapter('fbw-a320')).toThrow(/Windows\/MSFS bridge environment/);
    expect(() => createAircraftAdapter('fbw')).toThrow(/Windows\/MSFS bridge environment/);
  });

  it('rejects unknown adapter kinds', () => {
    expect(() => createAircraftAdapter('unknown-adapter')).toThrow(/Unsupported AIRCRAFT_ADAPTER/);
  });
});
