import { describe, it, expect } from 'vitest';
import { renderIdentPage, renderPosInitPage } from '../fmc/pages/setup';
import { renderLegsPage, renderHoldPage, renderFixPage, renderProgressPage } from '../fmc/pages/navigation';
import type { FMCState } from '../types/fmc';

const baseState: FMCState = {
  aircraft: 'BOEING_737',
  currentPage: 'IDENT',
  pageHistory: [],
  scratchpad: '',
  scratchpadError: null,
  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  position: { refAirport: '', gate: '' },
  performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0 },
  takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 0, vr: 0, v2: 0, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0 },
  route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '' },
  flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AA123', route: '', waypoints: [] },
  isModified: false,
  execLit: false,
  msgLight: false,
  mode: 'STANDBY',
  connectionStatus: 'DISCONNECTED',
  connectionMode: 'STANDALONE',
  hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' },
  holdPending: null,
  fix: { refFix: '', radial: 0, distance: 0 },
  legsPageIndex: 0,
  legsPageCount: 1,
  depArrSubPage: 'DEP',
  rteSubPage: 0,
  deleteMode: false,
  editWaypointIndex: null,
  aircraftState: null,
  connectedAircraft: null,
  connectedAircraftType: null,
  connectedCapabilities: null,
  lastError: null,
  simVariables: {},
  failureMessage: null,
  externalDisplayData: null,
};

describe('Page Renderers', () => {
  it('renders IDENT page', () => {
    const data = renderIdentPage(baseState);
    expect(data.title).toBe('IDENT');
    expect(data.lines.some(l => l.text.includes('737-800'))).toBe(true);
  });

  it('renders POS INIT page', () => {
    const data = renderPosInitPage(baseState);
    expect(data.title).toBe('POS INIT');
    expect(data.lines.some(l => l.text.includes('REF AIRPORT'))).toBe(true);
  });

  it('renders PROGRESS page', () => {
    const data = renderProgressPage(baseState);
    expect(data.title).toBe('PROGRESS');
    expect(data.lines.some(l => l.text.includes('KJFK'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('KDCA'))).toBe(true);
  });

  it('renders HOLD page', () => {
    const data = renderHoldPage(baseState);
    expect(data.title).toBe('HOLD');
    expect(data.lines.some(l => l.text.includes('FIX'))).toBe(true);
  });

  it('renders FIX page', () => {
    const data = renderFixPage(baseState);
    expect(data.title).toBe('FIX');
    expect(data.lines.some(l => l.text.includes('REF FIX'))).toBe(true);
  });

  it('renders LEGS page with waypoints', () => {
    const state = {
      ...baseState,
      flightPlan: {
        ...baseState.flightPlan,
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
    };
    const data = renderLegsPage(state);
    expect(data.title).toBe('LEGS');
    expect(data.lines.some(l => l.text.includes('RBV'))).toBe(true);
  });

  it('emits delete_wp_* LSK actions when deleteMode is true', () => {
    const state = {
      ...baseState,
      deleteMode: true,
      flightPlan: {
        ...baseState.flightPlan,
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
          { ident: 'LENDY', discontinuity: false },
        ],
      },
    };
    const data = renderLegsPage(state);
    expect(data.lskActions['L1']).toBe('delete_wp_0');
    expect(data.lskActions['L2']).toBe('delete_wp_1');
    expect(data.lskActions['L3']).toBe('delete_wp_2');
    expect(data.lines.some(l => l.text.includes('DEL') && l.text.includes('RBV'))).toBe(true);
  });

  it('emits edit_wp_* LSK actions when deleteMode is false', () => {
    const state = {
      ...baseState,
      deleteMode: false,
      flightPlan: {
        ...baseState.flightPlan,
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
    };
    const data = renderLegsPage(state);
    expect(data.lskActions['L1']).toBe('edit_wp_0');
    expect(data.lskActions['L2']).toBe('edit_wp_1');
  });

  it('shows DEL mode indicator in title when deleteMode is true', () => {
    const state = {
      ...baseState,
      deleteMode: true,
      flightPlan: {
        ...baseState.flightPlan,
        waypoints: [{ ident: 'RBV', discontinuity: false }],
      },
    };
    const data = renderLegsPage(state);
    expect(data.lines[0].text.includes('DEL')).toBe(true);
  });
});
