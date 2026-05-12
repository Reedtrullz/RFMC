import type { AircraftType } from '@shared';

export interface CockpitChecklistItem {
  id: string;
  label: string;
  expected: string;
  completed?: boolean;
  relatedControl?: string;
}

export interface CockpitChecklistSection {
  id: string;
  aircraft: AircraftType;
  title: string;
  badge: string;
  items: CockpitChecklistItem[];
}
