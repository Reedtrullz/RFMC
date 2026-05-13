import { describe, expect, it } from 'vitest';
import { MockSimConnectAdapter } from '../aircraft-adapters/mock-simconnect';

describe('MockSimConnectAdapter', () => {
  it('connects, records keypresses, and returns display readback', async () => {
    const adapter = new MockSimConnectAdapter();

    await expect(adapter.connect()).resolves.toBe(true);
    await adapter.sendKeypress('RTE');
    await adapter.sendLSK('L', 1);

    const display = await adapter.readDisplay();
    expect(adapter.recordedKeypresses).toEqual(['RTE', 'L1']);
    expect(display.title).toBe('KEY L1');
    expect(display.lines[0]).toContain('KEY L1');
  });

  it('returns deterministic aircraft state for CI integration tests', async () => {
    const adapter = new MockSimConnectAdapter({ aircraftType: 'AIRBUS_A320' });

    await adapter.connect();
    const state = await adapter.readAircraftState();

    expect(adapter.aircraftType).toBe('AIRBUS_A320');
    expect(state.lat).toBe(40.6413);
    expect(state.lon).toBe(-73.7781);
    expect(state.ias).toBe(280);
  });

  it('models connection failures and disconnected read errors', async () => {
    const adapter = new MockSimConnectAdapter({ failConnect: true });

    await expect(adapter.connect()).resolves.toBe(false);
    expect(adapter.connectionStatus).toBe('ERROR');
    expect(adapter.lastError).toBe('MOCK CONNECT FAILURE');
    await expect(adapter.readDisplay()).rejects.toThrow('MOCK ADAPTER NOT CONNECTED');
  });
});
