import type { FlightPlan, FlightPlanWaypoint } from '../types/fmc';
import { parseRouteString } from './flightPlanParser';

interface SimBriefData {
  origin?: string;
  destination?: string;
  flightNumber?: string;
  route?: string;
  alternate?: string;
  crzAlt?: number;
  costIndex?: number;
  zfw?: number;
  fuel?: number;
}

/**
 * Parse SimBrief XML content into a flight plan.
 * SimBrief exports contain <origin>, <destination>, <route>, etc.
 */
export function parseSimBriefXML(xml: string): Partial<FlightPlan> & { route: string; performance?: { crzAlt?: number; costIndex?: number; zfw?: number; fuel?: number } } {
  const getTag = (tag: string): string | undefined => {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
    return match?.[1]?.trim();
  };

  const origin = getTag('origin')?.toUpperCase();
  const destination = getTag('destination')?.toUpperCase();
  const flightNumber = getTag('flight_number') || getTag('callsign');
  const route = getTag('route') || getTag('general_route') || '';
  const alternate = getTag('alternate')?.toUpperCase();

  const crzAlt = parseInt(getTag('initial_altitude') || '') || undefined;
  const costIndex = parseInt(getTag('cost_index') || '') || undefined;
  const zfw = parseFloat(getTag('zfw') || '') * 1000 || undefined;
  const fuel = parseFloat(getTag('block_fuel') || '') * 1000 || undefined;

  return {
    origin,
    destination,
    flightNumber,
    alternate,
    route,
    performance: { crzAlt, costIndex, zfw, fuel },
  };
}

/**
 * Parse SimBrief JSON into a flight plan.
 */
export function parseSimBriefJSON(json: string): Partial<FlightPlan> & { route: string; performance?: { crzAlt?: number; costIndex?: number; zfw?: number; fuel?: number } } {
  const data = JSON.parse(json) as SimBriefData;
  return {
    origin: data.origin?.toUpperCase(),
    destination: data.destination?.toUpperCase(),
    flightNumber: data.flightNumber,
    alternate: data.alternate?.toUpperCase(),
    route: data.route || '',
    performance: {
      crzAlt: data.crzAlt,
      costIndex: data.costIndex,
      zfw: data.zfw,
      fuel: data.fuel,
    },
  };
}

/**
 * Attempt to parse SimBrief data from either XML or JSON.
 */
export function parseSimBrief(raw: string): Partial<FlightPlan> & { route: string; performance?: { crzAlt?: number; costIndex?: number; zfw?: number; fuel?: number } } {
  const trimmed = raw.trim();
  if (trimmed.startsWith('<')) {
    return parseSimBriefXML(trimmed);
  }
  return parseSimBriefJSON(trimmed);
}
