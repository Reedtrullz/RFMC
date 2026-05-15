import type { AdapterCapabilities, AdapterHealth } from '@virtual-cdu/shared';
import type { IAircraftAdapter } from './IAircraftAdapter';

export function toAdapterCapabilities(adapter: IAircraftAdapter): AdapterCapabilities {
  const raw = new Set(adapter.capabilities);
  return {
    instruments: adapter.aircraftType === 'AIRBUS_A320' ? ['MCDU', 'ND'] : ['CDU', 'ND'],
    commands: ['keyPress', 'lskPress'],
    data: [
      ...(raw.has('displayReadback') ? ['display' as const] : []),
      ...(raw.has('aircraftState') ? ['telemetry' as const] : []),
      'adapterVersion',
    ],
    replay: raw.has('latencySimulation'),
  };
}

export function getAdapterHealth(adapter: IAircraftAdapter): AdapterHealth {
  return {
    state: adapter.connectionStatus,
    adapterName: adapter.name,
    profileVersion: adapter.aircraftType === 'AIRBUS_A320' ? 'airbus-a320-mcdu-v0' : 'boeing-737ng-cdu-v1',
    lastError: adapter.lastError,
  };
}
