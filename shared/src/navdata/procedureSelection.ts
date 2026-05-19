import { Procedure, ProcedureType } from './navdataTypes';
import { PROCEDURES } from './navdataStore';

export function findProcedure(airportIcao: string, type: ProcedureType, ident: string): Procedure | undefined {
  return PROCEDURES.find((p) => p.airport === airportIcao && p.type === type && p.ident === ident);
}

export function getAvailableProcedures(airportIcao: string, type: ProcedureType): Procedure[] {
  return PROCEDURES.filter((p) => p.airport === airportIcao && p.type === type);
}
