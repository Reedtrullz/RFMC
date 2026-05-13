import type { CockpitChecklistSection } from './types';

export const b737PreflightChecklists: CockpitChecklistSection[] = [
  {
    id: 'preflight',
    aircraft: 'BOEING_737',
    title: 'Preflight Checklist',
    badge: 'B738',
    items: [
      { id: 'parking-brake', label: 'Parking Brake', expected: 'SET', completed: true },
      { id: 'fuel-pumps', label: 'Fuel Pumps', expected: 'ON', completed: true },
      { id: 'passenger-signs', label: 'Passenger Signs', expected: 'ON', relatedControl: 'SIGNS' },
      { id: 'windows', label: 'Windows', expected: 'LOCKED', relatedControl: 'WINDOWS' },
      { id: 'mcp-speed', label: 'MCP Speed', expected: 'V2 SET', relatedControl: 'IAS_SEL' },
      { id: 'mcp-heading', label: 'MCP Heading', expected: 'RWY HDG', relatedControl: 'HDG_SEL' },
      { id: 'mcp-altitude', label: 'MCP Altitude', expected: 'CLEARED ALT', relatedControl: 'ALT_SEL' },
    ],
  },
  {
    id: 'before-takeoff',
    aircraft: 'BOEING_737',
    title: 'Before Takeoff Checklist',
    badge: 'B738',
    items: [
      { id: 'flaps', label: 'Flaps', expected: 'SET' },
      { id: 'autothrottle', label: 'A/T Arm', expected: 'ARM', relatedControl: 'AT_ARM' },
      { id: 'lnav', label: 'LNAV', expected: 'ARMED AS REQUIRED', relatedControl: 'LNAV' },
      { id: 'vnav', label: 'VNAV', expected: 'ARMED AS REQUIRED', relatedControl: 'VNAV' },
      { id: 'exec', label: 'FMC Changes', expected: 'EXECUTED', relatedControl: 'EXEC' },
    ],
  },
];
