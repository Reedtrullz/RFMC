import { NavFix, Procedure, ProcedureLeg, ExpandedLeg } from './navdataTypes';
import { getFix, PROCEDURES } from './navdataStore';

export function expandRoute(
  origin: string,
  destination: string,
  sidIdent?: string,
  starIdent?: string,
  approachIdent?: string,
  enrouteWaypoints: string[] = []
): ExpandedLeg[] {
  let legs: ExpandedLeg[] = [];
  
  // 1. SID
  if (sidIdent) {
    const sid = PROCEDURES.find(p => p.ident === sidIdent && p.type === 'SID');
    if (sid) legs = [...legs, ...expandProcedure(sid)];
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
  if (starIdent) {
    const star = PROCEDURES.find(p => p.ident === starIdent && p.type === 'STAR');
    if (star) legs = [...legs, ...expandProcedure(star)];
  }

  // 4. Approach
  if (approachIdent) {
    const appr = PROCEDURES.find(p => p.ident === approachIdent && p.type === 'APPROACH');
    if (appr) legs = [...legs, ...expandProcedure(appr)];
  } else if (destination && !starIdent) {
    const destFix = getFix(destination);
    if (destFix) legs.push(mapFixToLeg(destFix, 'DESTINATION'));
  }

  return legs;
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
