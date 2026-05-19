import { describe, it, expect } from 'vitest';
import type { RouteData } from '../types/fmc';
import type { PendingChange, RouteModification, RouteModificationState } from '../fmc/routeModification';
import {
  initiateModification,
  queueChange,
  executeModification,
  cancelModification,
  getModificationState,
} from '../fmc/routeModification';

function makeRoute(overrides: Partial<RouteData> = {}): RouteData {
  return {
    origin: 'KJFK',
    destination: 'KDCA',
    flightNumber: 'VA123',
    routeString: 'KJFK DCT RBV J42 LENDY8 KDCA',
    ...overrides,
  } as RouteData;
}

function makeChange(overrides: Partial<PendingChange> = {}): PendingChange {
  return {
    type: 'origin',
    field: 'origin',
    oldValue: 'KJFK',
    newValue: 'KORD',
    requiresExec: true,
    ...overrides,
  };
}

describe('RouteModification State Machine', () => {
  describe('initiateModification', () => {
    it('creates a modification with state NONE and both routes as copies', () => {
      const route = makeRoute({ origin: 'KJFK', destination: 'KDCA' });
      const mod = initiateModification(route);

      expect(mod.id).toBeDefined();
      expect(mod.state).toBe('NONE');
      expect(mod.originalRoute).toEqual(route);
      expect(mod.modifiedRoute).toEqual(route);
      expect(mod.pendingChanges).toEqual([]);
      expect(mod.createdAt).toBeGreaterThan(0);
      expect(mod.executedAt).toBeUndefined();
    });

    it('creates independent copies (mutating route does not affect modification)', () => {
      const route = makeRoute();
      const mod = initiateModification(route);

      route.origin = 'KLAX';

      expect(mod.originalRoute.origin).toBe('KJFK');
      expect(mod.modifiedRoute.origin).toBe('KJFK');
    });
  });

  describe('queueChange', () => {
    it('transitions NONE → MODIFIED and appends the change', () => {
      const route = makeRoute();
      const mod = initiateModification(route);
      const change = makeChange({ field: 'destination', newValue: 'KORD' });

      const result = queueChange(mod, change);

      expect(getModificationState(result)).toBe('MODIFIED');
      expect(result.pendingChanges).toHaveLength(1);
      expect(result.pendingChanges[0]).toEqual(change);
    });

    it('appends multiple changes, keeping state MODIFIED', () => {
      const mod = initiateModification(makeRoute());

      const change1 = makeChange({ field: 'origin', newValue: 'KORD' });
      const after1 = queueChange(mod, change1);
      expect(after1.pendingChanges).toHaveLength(1);

      const change2 = makeChange({ type: 'destination', field: 'destination', newValue: 'KLAX' });
      const after2 = queueChange(after1, change2);
      expect(after2.pendingChanges).toHaveLength(2);
      expect(getModificationState(after2)).toBe('MODIFIED');
    });

    it('does not mutate the original modification', () => {
      const mod = initiateModification(makeRoute());
      const change = makeChange();

      queueChange(mod, change);

      expect(mod.state).toBe('NONE');
      expect(mod.pendingChanges).toHaveLength(0);
    });

    it('throws when queuing change in state EXECUTED', () => {
      const mod = initiateModification(makeRoute());
      const change = makeChange();
      const afterQueue = queueChange(mod, change);
      const executed = executeModification(afterQueue);

      expect(() => queueChange(executed, change)).toThrow(/Cannot queue change/);
    });

    it('throws when queuing change in state EXEC_PENDING', () => {
      const mod: RouteModification = {
        ...initiateModification(makeRoute()),
        state: 'EXEC_PENDING',
      };

      expect(() => queueChange(mod, makeChange())).toThrow(/Cannot queue change/);
    });
  });

  describe('executeModification', () => {
    it('transitions MODIFIED → EXECUTED and applies pending changes to modifiedRoute', () => {
      const route = makeRoute({ origin: 'KJFK', destination: 'KDCA' });
      const mod = initiateModification(route);
      const change = makeChange({ field: 'destination', newValue: 'KORD' });
      const afterQueue = queueChange(mod, change);

      const result = executeModification(afterQueue);

      expect(getModificationState(result)).toBe('EXECUTED');
      expect(result.modifiedRoute.destination).toBe('KORD');
      expect(result.originalRoute.destination).toBe('KDCA');
      expect(result.executedAt).toBeGreaterThan(0);
    });

    it('clears pendingChanges after execution', () => {
      const mod = initiateModification(makeRoute());
      const afterQueue = queueChange(mod, makeChange());

      const result = executeModification(afterQueue);

      expect(result.pendingChanges).toEqual([]);
    });

    it('does not mutate the input modification', () => {
      const mod = initiateModification(makeRoute());
      const afterQueue = queueChange(mod, makeChange());

      executeModification(afterQueue);

      expect(afterQueue.state).toBe('MODIFIED');
      expect(afterQueue.pendingChanges).toHaveLength(1);
    });

    it('throws when executing in state NONE', () => {
      const mod = initiateModification(makeRoute());

      expect(() => executeModification(mod)).toThrow(/Cannot execute modification/);
    });

    it('throws when executing in state EXECUTED', () => {
      const mod = initiateModification(makeRoute());
      const afterQueue = queueChange(mod, makeChange());
      const executed = executeModification(afterQueue);

      expect(() => executeModification(executed)).toThrow(/Cannot execute modification/);
    });

    it('throws when executing in state EXEC_PENDING', () => {
      const mod: RouteModification = {
        ...initiateModification(makeRoute()),
        state: 'EXEC_PENDING',
      };

      expect(() => executeModification(mod)).toThrow(/Cannot execute modification/);
    });
  });

  describe('cancelModification', () => {
    it('reverts modifiedRoute to originalRoute and sets state NONE (from MODIFIED)', () => {
      const route = makeRoute({ origin: 'KJFK', destination: 'KDCA' });
      const mod = initiateModification(route);
      const change = makeChange({ field: 'destination', newValue: 'KORD' });
      const afterQueue = queueChange(mod, change);

      const result = cancelModification(afterQueue);

      expect(getModificationState(result)).toBe('NONE');
      expect(result.modifiedRoute.destination).toBe('KDCA');
      expect(result.modifiedRoute).toEqual(result.originalRoute);
      expect(result.pendingChanges).toEqual([]);
    });

    it('reverts modifiedRoute to originalRoute and sets state NONE (from EXEC_PENDING)', () => {
      const mod: RouteModification = {
        ...initiateModification(makeRoute()),
        state: 'EXEC_PENDING',
        pendingChanges: [makeChange()],
      };

      const result = cancelModification(mod);

      expect(getModificationState(result)).toBe('NONE');
      expect(result.modifiedRoute).toEqual(result.originalRoute);
      expect(result.pendingChanges).toEqual([]);
    });

    it('does not mutate the input modification', () => {
      const afterQueue = queueChange(initiateModification(makeRoute()), makeChange());

      cancelModification(afterQueue);

      expect(afterQueue.state).toBe('MODIFIED');
      expect(afterQueue.pendingChanges).toHaveLength(1);
    });

    it('throws when cancelling in state NONE', () => {
      const mod = initiateModification(makeRoute());

      expect(() => cancelModification(mod)).toThrow(/Cannot cancel modification/);
    });

    it('throws when cancelling in state EXECUTED', () => {
      const mod = initiateModification(makeRoute());
      const afterQueue = queueChange(mod, makeChange());
      const executed = executeModification(afterQueue);

      expect(() => cancelModification(executed)).toThrow(/Cannot cancel modification/);
    });
  });

  describe('getModificationState', () => {
    it('returns NONE after initiation', () => {
      const mod = initiateModification(makeRoute());
      expect(getModificationState(mod)).toBe('NONE');
    });

    it('returns MODIFIED after queueChange', () => {
      const mod = queueChange(initiateModification(makeRoute()), makeChange());
      expect(getModificationState(mod)).toBe('MODIFIED');
    });

    it('returns EXECUTED after executeModification', () => {
      const mod = executeModification(queueChange(initiateModification(makeRoute()), makeChange()));
      expect(getModificationState(mod)).toBe('EXECUTED');
    });

    it('returns NONE after cancelModification', () => {
      const mod = cancelModification(queueChange(initiateModification(makeRoute()), makeChange()));
      expect(getModificationState(mod)).toBe('NONE');
    });
  });

  describe('state machine - full lifecycle', () => {
    it('NONE → MODIFIED → EXECUTED (happy path)', () => {
      const route = makeRoute({ origin: 'KJFK', destination: 'KDCA' });

      const mod1 = initiateModification(route);
      expect(getModificationState(mod1)).toBe('NONE');

      const change1 = makeChange({ field: 'origin', newValue: 'KORD' });
      const mod2 = queueChange(mod1, change1);
      expect(getModificationState(mod2)).toBe('MODIFIED');
      expect(mod2.pendingChanges).toHaveLength(1);

      const change2 = makeChange({ type: 'destination', field: 'destination', newValue: 'KLAX' });
      const mod3 = queueChange(mod2, change2);
      expect(getModificationState(mod3)).toBe('MODIFIED');
      expect(mod3.pendingChanges).toHaveLength(2);

      const mod4 = executeModification(mod3);
      expect(getModificationState(mod4)).toBe('EXECUTED');
      expect(mod4.modifiedRoute.origin).toBe('KORD');
      expect(mod4.modifiedRoute.destination).toBe('KLAX');
      expect(mod4.originalRoute.origin).toBe('KJFK');
      expect(mod4.originalRoute.destination).toBe('KDCA');
      expect(mod4.pendingChanges).toEqual([]);
      expect(mod4.executedAt).toBeGreaterThan(0);
    });

    it('NONE → MODIFIED → NONE (cancel from MODIFIED)', () => {
      const route = makeRoute({ origin: 'KJFK', destination: 'KDCA' });

      const mod1 = initiateModification(route);
      const change = makeChange({ field: 'destination', newValue: 'KORD' });
      const mod2 = queueChange(mod1, change);
      expect(getModificationState(mod2)).toBe('MODIFIED');

      const mod3 = cancelModification(mod2);
      expect(getModificationState(mod3)).toBe('NONE');
      expect(mod3.modifiedRoute.destination).toBe('KDCA');
      expect(mod3.pendingChanges).toEqual([]);
    });

    it('NONE → MODIFIED → EXEC_PENDING → NONE (cancel from EXEC_PENDING)', () => {
      const route = makeRoute({ origin: 'KJFK', destination: 'KDCA' });

      const mod1 = initiateModification(route);
      const change = makeChange({ field: 'destination', newValue: 'KORD' });
      const mod2 = queueChange(mod1, change);

      // Manually set EXEC_PENDING (reserved for auto-EXEC timeout)
      const mod3: RouteModification = { ...mod2, state: 'EXEC_PENDING' };
      expect(getModificationState(mod3)).toBe('EXEC_PENDING');

      const mod4 = cancelModification(mod3);
      expect(getModificationState(mod4)).toBe('NONE');
      expect(mod4.modifiedRoute.destination).toBe('KDCA');
    });
  });

  describe('immutability', () => {
    it('all functions return new objects, never mutating inputs', () => {
      const route = makeRoute();
      const originalRouteSnapshot = { ...route };

      const mod1 = initiateModification(route);
      const mod1Snapshot = { ...mod1, pendingChanges: [...mod1.pendingChanges] };

      const change = makeChange();
      const mod2 = queueChange(mod1, change);
      expect(mod1).toEqual(mod1Snapshot);

      const mod3 = executeModification(mod2);
      expect(mod2.state).toBe('MODIFIED');

      const mod4 = cancelModification(mod2);
      expect(mod2.state).toBe('MODIFIED');

      // Original route data never changed
      expect(route).toEqual(originalRouteSnapshot);
    });
  });
});
