import type { FlightPlan, FlightPlanWaypoint } from '../types/fmc';

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
  navlog?: { fix: Array<{ ident: string; pos_lat: string; pos_long: string }> };
}

/**
 * Parse SimBrief XML content into a flight plan.
 * SimBrief exports contain <origin>, <destination>, <route>, etc.
 */
function parseSimBriefXML(xml: string): Partial<FlightPlan> & {
  route: string;
  waypoints?: FlightPlanWaypoint[];
  performance?: { crzAlt?: number; costIndex?: number; zfw?: number; fuel?: number };
} {
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

  const waypoints: FlightPlanWaypoint[] = [];
  const navlogMatches = xml.match(/<navlog>[\s\S]*?<\/navlog>/i);
  if (navlogMatches) {
    const fixRegex =
      /<fix>[\s\S]*?<ident>([^<]+)<\/ident>[\s\S]*?<pos_lat>([^<]+)<\/pos_lat>[\s\S]*?<pos_long>([^<]+)<\/pos_long>[\s\S]*?<\/fix>/gi;
    let match;
    while ((match = fixRegex.exec(navlogMatches[0])) !== null) {
      waypoints.push({
        ident: match[1].trim(),
        lat: parseFloat(match[2]),
        lon: parseFloat(match[3]),
        coordinateSource: 'simbrief',
        discontinuity: false,
      });
    }
  }

  return {
    origin,
    destination,
    flightNumber,
    alternate,
    route,
    waypoints: waypoints.length > 0 ? waypoints : undefined,
    performance: { crzAlt, costIndex, zfw, fuel },
  };
}

/**
 * Parse SimBrief JSON into a flight plan.
 */
function parseSimBriefJSON(json: string): Partial<FlightPlan> & {
  route: string;
  waypoints?: FlightPlanWaypoint[];
  performance?: { crzAlt?: number; costIndex?: number; zfw?: number; fuel?: number };
} {
  const data = JSON.parse(json) as SimBriefData;
  return {
    origin: data.origin?.toUpperCase(),
    destination: data.destination?.toUpperCase(),
    flightNumber: data.flightNumber,
    alternate: data.alternate?.toUpperCase(),
    route: data.route || '',
    waypoints: data.navlog?.fix?.map((f) => ({
      ident: f.ident,
      lat: parseFloat(f.pos_lat),
      lon: parseFloat(f.pos_long),
      coordinateSource: 'simbrief',
      discontinuity: false,
    })),
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
export function parseSimBrief(raw: string): Partial<FlightPlan> & {
  route: string;
  waypoints?: FlightPlanWaypoint[];
  performance?: { crzAlt?: number; costIndex?: number; zfw?: number; fuel?: number };
} {
  const trimmed = raw.trim();
  if (trimmed.startsWith('<')) {
    return parseSimBriefXML(trimmed);
  }
  return parseSimBriefJSON(trimmed);
}
