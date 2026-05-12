import type { CockpitChecklistSection } from './types';

export const a320PreflightChecklists: CockpitChecklistSection[] = [
  {
    id: 'cockpit-preparation',
    aircraft: 'AIRBUS_A320',
    title: 'Cockpit Preparation',
    badge: 'A320',
    items: [
      { id: 'battery', label: 'Batteries', expected: 'ON', completed: true },
      { id: 'external-power', label: 'External Power', expected: 'AS REQUIRED', completed: true },
      { id: 'adris', label: 'ADIRS', expected: 'NAV' },
      { id: 'mcdu-init', label: 'MCDU INIT', expected: 'COMPLETE', relatedControl: 'INIT_A' },
      { id: 'fpln', label: 'Flight Plan', expected: 'CHECKED', relatedControl: 'F_PLN' },
    ],
  },
  {
    id: 'before-takeoff',
    aircraft: 'AIRBUS_A320',
    title: 'Before Takeoff',
    badge: 'A320',
    items: [
      { id: 'fcu-speed', label: 'FCU Speed', expected: 'MANAGED/SELECTED', relatedControl: 'A320_SPEED' },
      { id: 'fcu-heading', label: 'FCU Heading', expected: 'MANAGED/SELECTED', relatedControl: 'A320_HDG' },
      { id: 'fcu-altitude', label: 'FCU Altitude', expected: 'CLEARED ALT', relatedControl: 'A320_ALT' },
      { id: 'athr', label: 'A/THR', expected: 'ARMED', relatedControl: 'A320_ATHR' },
      { id: 'appr', label: 'APPR Mode', expected: 'AS REQUIRED', relatedControl: 'A320_APPR' },
    ],
  },
];
