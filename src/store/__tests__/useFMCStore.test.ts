import { describe, it, expect, beforeEach } from 'vitest';
import { useFMCStore } from '../useFMCStore';

describe('FMC Store', () => {
  beforeEach(() => {
    useFMCStore.getState().resetState();
  });

  it('sets page correctly', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    expect(useFMCStore.getState().currentPage).toBe('RTE');
  });

  it('tracks page history', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    store.setPage('PERF_INIT');
    expect(useFMCStore.getState().pageHistory).toContain('RTE');
  });

  it('goes back to previous page', () => {
    const store = useFMCStore.getState();
    store.setPage('RTE');
    store.setPage('PERF_INIT');
    store.goBack();
    expect(useFMCStore.getState().currentPage).toBe('RTE');
  });

  it('presses keys into scratchpad', () => {
    const store = useFMCStore.getState();
    store.pressKey('1');
    store.pressKey('2');
    expect(useFMCStore.getState().scratchpad).toBe('12');
  });

  it('clears scratchpad with CLR', () => {
    const store = useFMCStore.getState();
    store.pressKey('A');
    store.pressKey('B');
    store.pressKey('CLR');
    expect(useFMCStore.getState().scratchpad).toBe('A');
  });

  it('sets aircraft type', () => {
    const store = useFMCStore.getState();
    store.setAircraft('AIRBUS_A320');
    expect(useFMCStore.getState().aircraft).toBe('AIRBUS_A320');
  });

  it('loads flight plan', () => {
    const store = useFMCStore.getState();
    store.loadFlightPlan({ origin: 'KJFK', destination: 'KDCA', route: 'DCT' });
    const state = useFMCStore.getState();
    expect(state.flightPlan.origin).toBe('KJFK');
    expect(state.flightPlan.destination).toBe('KDCA');
  });

  it('sets and clears failure mode', () => {
    const store = useFMCStore.getState();
    store.setFailureMode('FAIL', 'TEST FAILURE');
    let state = useFMCStore.getState();
    expect(state.mode).toBe('FAIL');
    expect(state.failureMessage).toBe('TEST FAILURE');

    store.clearFailureMode();
    state = useFMCStore.getState();
    expect(state.mode).toBe('ACTIVE');
    expect(state.failureMessage).toBeNull();
  });

  it('renders FAIL display data', () => {
    const store = useFMCStore.getState();
    store.setFailureMode('FAIL');
    const data = store.getDisplayData();
    expect(data.title).toBe('FAIL');
    expect(data.lines.some(l => l.text.includes('FAIL'))).toBe(true);
  });
});
