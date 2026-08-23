import type { AdapterCapabilities, AdapterHealth } from '@virtual-cdu/shared';
import type { IAircraftAdapter } from './IAircraftAdapter';

type CommandCapability = AdapterCapabilities['commands'][number];
type DataCapability = AdapterCapabilities['data'][number];

const DISPLAY_CAPABILITIES = new Set(['display', 'displayreadback', 'cdudisplay', 'mcdudisplay']);
const TELEMETRY_CAPABILITIES = new Set([
  'aircraftstate',
  'position',
  'heading',
  'speed',
  'altitude',
  'radios',
  'telemetry',
]);
const FLIGHT_PLAN_CAPABILITIES = new Set(['flightplan', 'route', 'fpln']);
const NAV_CYCLE_CAPABILITIES = new Set(['navcycle', 'navdata', 'airac']);
const REPLAY_CAPABILITIES = new Set(['latencysimulation', 'replay', 'playback']);

function normalizeCapabilities(capabilities: readonly string[]): Set<string> {
  return new Set(capabilities.map((capability) => capability.trim().toLowerCase()).filter(Boolean));
}

function hasAny(raw: Set<string>, candidates: Set<string>): boolean {
  for (const candidate of candidates) {
    if (raw.has(candidate)) return true;
  }
  return false;
}

export function toAdapterCapabilities(adapter: IAircraftAdapter): AdapterCapabilities {
  const raw = normalizeCapabilities(adapter.capabilities);
  const commands: CommandCapability[] = ['keyPress', 'lskPress'];
  const data: DataCapability[] = [
    ...(hasAny(raw, DISPLAY_CAPABILITIES) ? (['display'] as DataCapability[]) : []),
    ...(hasAny(raw, TELEMETRY_CAPABILITIES) ? (['telemetry'] as DataCapability[]) : []),
    ...(hasAny(raw, FLIGHT_PLAN_CAPABILITIES) ? (['flightPlan'] as DataCapability[]) : []),
    ...(hasAny(raw, NAV_CYCLE_CAPABILITIES) ? (['navCycle'] as DataCapability[]) : []),
    'adapterVersion',
  ];

  return {
    instruments: adapter.aircraftType === 'AIRBUS_A320' ? ['MCDU', 'ND'] : ['CDU', 'ND'],
    commands,
    data,
    replay: hasAny(raw, REPLAY_CAPABILITIES),
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
