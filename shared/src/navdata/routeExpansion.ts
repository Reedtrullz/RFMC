import { NavFix, Procedure, ProcedureLeg, ExpandedLeg, ProcedureType } from './navdataTypes';
import { getFix, PROCEDURES } from './navdataStore';
import { NAV_CACHE } from '../fmc/navDatabase';

export function expandRoute(
  origin: string,
  destination: string,
  sidIdent?: string,
  starIdent?: string,
  approachIdent?: string,
  enrouteWaypoints: string[] = []
): ExpandedLeg[] {
  let legs: ExpandedLeg[] = [];
  
  const findProcedure = (airportIcao: string, ident: string, type: ProcedureType): Procedure | undefined => {
    const cachedProcs = NAV_CACHE.procedures[airportIcao.toUpperCase()];
    if (cachedProcs) {
      const p = cachedProcs.find(p => p.ident === ident && p.type === type);
      if (p) {
        return {
          ident: p.ident,
          type: p.type as ProcedureType,
          airportIcao: p.airport_icao,
          legs: p.legs.map(leg => ({
            type: leg.type as any,
            fixIdent: leg.fix,
            courseDeg: leg.course,
            distanceNm: leg.distanceNm,
            altitudeConstraint: leg.altitude ? parseAltitude(leg.altitude) : undefined,
            speedConstraint: leg.speed ? parseSpeed(leg.speed) : undefined,
            isFlyOver: leg.turnDirection === 'L' || leg.turnDirection === 'R'
          }))
        };
      }
    }
    
    return PROCEDURES.find(p => p.ident === ident && p.type === type && (p.airport === airportIcao || p.airportIcao === airportIcao));
  };

  // 1. SID
  if (sidIdent && origin) {
    const sid = findProcedure(origin, sidIdent, 'SID');
    if (sid) {
      legs = [...legs, ...expandProcedure(sid)];
    } else {
      const originFix = getFix(origin);
      if (originFix) legs.push(mapFixToLeg(originFix, 'ORIGIN'));
    }
  } else if (origin) {
    const originFix = getFix(origin);
    if (originFix) legs.push(mapFixToLeg(originFix, 'ORIGIN'));
  }

  // 2. Enroute
  for (const ident of enrouteWaypoints) {
    const fix = getFix(ident);
    if (fix) legs.push(mapFixToLeg(fix, 'ENROUTE'));
  }

  // 3. STAR
  if (starIdent && destination) {
    const star = findProcedure(destination, starIdent, 'STAR');
    if (star) legs = [...legs, ...expandProcedure(star)];
  }

  // 4. Approach
  if (approachIdent && destination) {
    const appr = findProcedure(destination, approachIdent, 'APPROACH');
    if (appr) legs = [...legs, ...expandProcedure(appr)];
  } else if (destination && !starIdent) {
    const destFix = getFix(destination);
    if (destFix) legs.push(mapFixToLeg(destFix, 'DESTINATION'));
  }

  return legs;
}

function parseAltitude(altStr: string) {
  const val = parseInt(altStr.replace(/[^0-9]/g, ''));
  return { value: val, type: 'AT' as const };
}

function parseSpeed(spdStr: string) {
  const val = parseInt(spdStr.replace(/[^0-9]/g, ''));
  return { value: val, type: 'AT' as const };
}

function mapFixToLeg(fix: NavFix, type: string): ExpandedLeg {
  return {
    ident: fix.ident,
    lat: fix.lat,
    lon: fix.lon,
    type: type,
  };
}

export function expandProcedure(procedure: Procedure): ExpandedLeg[] {
  if (!procedure.legs) return [];
  return procedure.legs.map(leg => {
    const fix = leg.fixIdent ? getFix(leg.fixIdent) : null;
    return {
      ident: leg.fixIdent || 'USER',
      lat: fix?.lat || 0,
      lon: fix?.lon || 0,
      type: leg.type,
      altitudeConstraint: leg.altitudeConstraint,
      speedConstraint: leg.speedConstraint,
      isFlyOver: leg.isFlyOver
    };
  });
}
