import { describe, it, expect } from 'vitest';
import { resolveLskNavigation } from '../fmc/actionHandlers/navigationActions';

describe('resolveLskNavigation', () => {
  it('Boeing pos_init returns POS_INIT page', () => {
    expect(resolveLskNavigation('pos_init')).toEqual({ action: 'pos_init', targetPage: 'POS_INIT', handled: true });
  });
  it('Boeing next_page returns NEXT_PAGE key press', () => {
    expect(resolveLskNavigation('next_page')).toEqual({ action: 'next_page', pressKey: 'NEXT_PAGE', handled: true });
  });
  it('Boeing dep_page returns DEP subpage', () => {
    expect(resolveLskNavigation('dep_page')).toEqual({
      action: 'dep_page',
      setSubPage: { depArrSubPage: 'DEP' },
      handled: true,
    });
  });
  it('Airbus init_a returns INIT_A page', () => {
    expect(resolveLskNavigation('init_a')).toEqual({ action: 'init_a', targetPage: 'INIT_A', handled: true });
  });
  it('Airbus perf_to returns PERF_TAKEOFF page', () => {
    expect(resolveLskNavigation('perf_to')).toEqual({ action: 'perf_to', targetPage: 'PERF_TAKEOFF', handled: true });
  });
  it('Unknown action returns null', () => {
    expect(resolveLskNavigation('nonexistent')).toBeNull();
  });
  it('Boeing ident returns IDENT page', () => {
    expect(resolveLskNavigation('ident')).toEqual({ action: 'ident', targetPage: 'IDENT', handled: true });
  });
});
