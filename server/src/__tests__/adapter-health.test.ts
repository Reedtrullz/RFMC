import { describe, expect, it } from 'vitest';
import { getAdapterHealth, toAdapterCapabilities } from '../aircraft-adapters/adapter-health';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

class CapabilityAdapter extends MockSimConnectAdapter {
  readonly capabilities: string[];

  constructor(capabilities: string[]) {
    super();
    this.capabilities = capabilities;
  }
}

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

  it('normalizes real adapter capability aliases before mapping them', () => {
    const adapter = new CapabilityAdapter([
      ' Display ',
      'POSITION',
      'heading',
      'speed',
      'altitude',
      'radios',
      'flightPlan',
      'AIRAC',
      'playback',
      '',
    ]);

    expect(toAdapterCapabilities(adapter)).toEqual({
      instruments: ['CDU', 'ND'],
      commands: ['keyPress', 'lskPress'],
      data: ['display', 'telemetry', 'flightPlan', 'navCycle', 'adapterVersion'],
      replay: true,
    });
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
