import type { RouteModification, RouteModificationState } from './routeModification';

export function deriveExecLit(modification: RouteModification | null): boolean {
  if (!modification) return false;
  return modification.state === 'MODIFIED';
}

export function deriveIsModified(modification: RouteModification | null): boolean {
  if (!modification) return false;
  return modification.state !== 'NONE' && modification.state !== 'EXECUTED';
}

export function isModificationActive(modification: RouteModification | null): boolean {
  return deriveIsModified(modification) && !deriveExecLit(modification);
}

export function hasPendingChanges(modification: RouteModification | null): boolean {
  if (!modification) return false;
  return modification.pendingChanges.length > 0;
}

export function describeModificationState(state: RouteModificationState): string {
  return state;
}
