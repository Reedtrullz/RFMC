import type { AircraftType } from '@shared';
import { a320PreflightChecklists } from './a320Preflight';
import { b737PreflightChecklists } from './b737Preflight';
import type { CockpitChecklistSection } from './types';

export type { CockpitChecklistItem, CockpitChecklistSection } from './types';

const checklistsByAircraft: Record<AircraftType, CockpitChecklistSection[]> = {
  BOEING_737: b737PreflightChecklists,
  AIRBUS_A320: a320PreflightChecklists,
};

export function getCockpitChecklists(aircraft: AircraftType): CockpitChecklistSection[] {
  return checklistsByAircraft[aircraft] ?? b737PreflightChecklists;
}
