import { describe, expect, it, vi } from 'vitest';
import { createAircraftAdapter } from '../aircraft-adapters';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

vi.mock('../aircraft-adapters/pmdg-737', () => ({
  PMDG737Adapter: class MockedPMDG737Adapter {
    name = 'PMDG 737 Adapter';
    aircraftType = 'BOEING_737';
    capabilities = [];
    connectionStatus = 'DISCONNECTED';
    lastError = null;
    isConnected = false;
    connect = vi.fn();
    disconnect = vi.fn();
    readDisplay = vi.fn();
    sendKeypress = vi.fn();
    sendLSK = vi.fn();
    readAircraftState = vi.fn();
  },
}));

describe('createAircraftAdapter', () => {
  it('creates the mock adapter for CI and local integration tests', () => {
    expect(createAircraftAdapter('mock')).toBeInstanceOf(MockSimConnectAdapter);
    expect(createAircraftAdapter('mock-simconnect')).toBeInstanceOf(MockSimConnectAdapter);
  });

  it('defaults to the PMDG adapter for production behavior', () => {
    expect(createAircraftAdapter().name).toBe('PMDG 737 Adapter');
    expect(createAircraftAdapter('pmdg').name).toBe('PMDG 737 Adapter');
  });
});
