import { describe, expect, it } from 'vitest';
import { getAdapterHealth, toAdapterCapabilities } from '../aircraft-adapters/adapter-health';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

describe('adapter health contract', () => {
  it('maps legacy string capabilities to structured production capabilities', () => {
    const adapter = new MockSimConnectAdapter();

    expect(toAdapterCapabilities(adapter)).toMatchObject({
      instruments: ['CDU', 'ND'],
      commands: ['keyPress', 'lskPress'],
      replay: true,
    });
    expect(toAdapterCapabilities(adapter).data).toEqual(
      expect.arrayContaining(['display', 'telemetry', 'adapterVersion']),
    );
  });

  it('reports profile-bound health without claiming live validation', async () => {
    const adapter = new MockSimConnectAdapter();
    await adapter.connect();

    expect(getAdapterHealth(adapter)).toMatchObject({
      state: 'CONNECTED',
      adapterName: 'Mock SimConnect Adapter',
      profileVersion: 'boeing-737ng-cdu-v1',
      lastError: null,
    });
  });
});
