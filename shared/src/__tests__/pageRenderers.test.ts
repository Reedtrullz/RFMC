import { describe, it, expect } from 'vitest';
import { renderIdentPage, renderMenuPage, renderPerfInitPage, renderPosInitPage, renderTakeoffRefPage, renderThrustLimPage } from '../fmc/pages/setup';
import { renderLegsPage, renderHoldPage, renderFixPage, renderProgressPage } from '../fmc/pages/navigation';
import { renderRtePage, renderDepArrPage } from '../fmc/pages/route';
import { renderClbPage } from '../fmc/pages/climb';
import { renderCrzPage } from '../fmc/pages/cruise';
import { renderDesPage } from '../fmc/pages/descent';
import { renderDirIntcPage } from '../fmc/pages/direct';
import { renderN1LimitPage } from '../fmc/pages/n1limit';
import { getAirbusPageRenderer } from '../fmc/pages/airbus/index';
import { renderBoeingProgressGrid } from '../fmc/pages/boeing/progress.grid';
import { createBaseState } from './testUtils';

const baseState = createBaseState({
  aircraft: 'BOEING_737',
  currentPage: 'IDENT',
  ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
  flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AA123', route: '', waypoints: [] },
  efisL: {
    mode: 'MAP',
    range: 40,
    centered: false,
    side: 'L',
    overlays: {
      wpt: true, arpt: true, sta: true, data: false, 
      pos: false, terr: false, wxr: false, tfc: true, cstr: false
    },
  },
  efisR: {
    mode: 'MAP',
    range: 40,
    centered: false,
    side: 'R',
    overlays: {
      wpt: true, arpt: true, sta: true, data: false, 
      pos: false, terr: false, wxr: false, tfc: true, cstr: false
    },
  },
});

describe('Page Renderers', () => {
  it('renders IDENT page', () => {
    const data = renderIdentPage(baseState);
    expect(data.title).toBe('IDENT');
    expect(data.lines.some(l => l.text.includes('737-800'))).toBe(true);
  });

  it('tags Boeing setup page lines with display semantics', () => {
    const data = renderIdentPage(baseState);
    expect(data.lines[0]).toMatchObject({ semantic: 'title', inverse: true });
    expect(data.lines.find(l => l.text.includes('MODEL'))?.semantic).toBe('label');
    expect(data.lines.find(l => l.text.includes('737-800'))?.semantic).toBe('activeData');
  });

  it('tags every primary Boeing page title as a semantic title', () => {
    const renderers = [
      renderIdentPage,
      renderPosInitPage,
      renderPerfInitPage,
      renderThrustLimPage,
      renderTakeoffRefPage,
      renderMenuPage,
      renderLegsPage,
      renderProgressPage,
      renderHoldPage,
      renderFixPage,
      renderRtePage,
      renderDepArrPage,
      renderClbPage,
      renderCrzPage,
      renderDesPage,
      renderDirIntcPage,
      renderN1LimitPage,
    ];

    for (const renderer of renderers) {
      const data = renderer(baseState);
      if (data.segments && data.segments.length > 0) {
        expect(data.segments.some(s => s.semantic === 'title')).toBe(true);
      } else if (data.lines && data.lines.length > 0) {
        expect(data.lines[0].semantic, data.title).toBe('title');
      }
    }
  });

  it('exposes DES NOW as a supported trainer action', () => {
    const data = renderDesPage(baseState);
    expect(data.lskActions.R6).toBe('des_now');
    expect(data.lskLabels?.R6).toBe('DES NOW');
    expect(data.lines.some(line => line.text.includes('DES NOW'))).toBe(true);
  });

  it('renders TAKEOFF REF page 2 as landing and approach reference', () => {
    const data = renderTakeoffRefPage({
      ...baseState,
      takeoffRefPageIndex: 1,
      route: { ...baseState.route, approach: 'ILS19' },
      landing: { runway: '19', flaps: '30', vref: 142, ilsFrequency: '109.90', course: 193 },
    });

    expect(data.pageIndicator).toBe('2/2');
    expect(data.lines.some(l => l.text.includes('LANDING RW'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('ILS19'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('142 KT'))).toBe(true);
    expect(data.lskActions.L3).toBe('set_landing_flaps');
    expect(data.lskActions.R3).toBe('set_landing_vref');
  });

  it('renders POS INIT page', () => {
    const data = renderPosInitPage(baseState);
    expect(data.title).toBe('POS INIT');
    const hasRefAirport = data.segments?.some(s => s.text.includes('REF AIRPORT')) || 
                          data.lines?.some(l => l.text.includes('REF AIRPORT'));
    expect(hasRefAirport).toBe(true);
  });

  it('renders authentic Boeing PROGRESS page layout', () => {
    const data = renderProgressPage(baseState);
    expect(data.title).toBe('PROGRESS');
    expect(data.lines.some(l => l.text.includes('LAST'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('TO'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('NEXT'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('DEST'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('CMD SPD'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('KJFK'))).toBe(true);
    expect(data.lines.some(l => l.text.includes('KDCA'))).toBe(true);
  });

  it('renders Boeing PROGRESS from shared LNAV VNAV and performance truth', () => {
    const state = createBaseState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: 'FIX1 KDCA',
        waypoints: [
          { ident: 'KJFK', lat: 40.6413, lon: -73.7781, discontinuity: false },
          {
            ident: 'FIX1',
            lat: 39.9,
            lon: -74.4,
            discontinuity: false,
            altitudeConstraint: { type: 'AT_OR_ABOVE', altitude: 8000 },
          },
          { ident: 'KDCA', lat: 38.8512, lon: -77.0402, discontinuity: false },
        ],
      },
      route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AA123', routeString: 'FIX1' },
      performance: {
        crzAlt: 18000,
        costIndex: 30,
        zfw: 126000,
        fuel: 18000,
        cg: 24,
        reserve: 3000,
        grossWeight: 144000,
      },
      takeoff: {
        ...baseState.takeoff,
        runway: '04L',
        flaps: '5',
      },
      aircraftState: {
        lat: 40.6413,
        lon: -73.7781,
        altitude: 2000,
        altitudeFt: 2000,
        heading: 220,
        headingDeg: 220,
        track: 220,
        trackDeg: 220,
        ias: 230,
        indicatedAirspeedKt: 230,
        tas: 260,
        gs: 280,
        verticalSpeedFpm: 1200,
        vs: 1200,
        fuelTotal: 18000,
        gw: 144000,
      },
    });

    const lineData = renderProgressPage(state);
    expect(lineData.lines.some(l => l.text.includes('FIX1'))).toBe(true);
    expect(lineData.lines.some(l => l.text.includes('VNAV'))).toBe(true);
    expect(lineData.lines.some(l => l.text.includes('8000'))).toBe(true);

    const gridData = renderBoeingProgressGrid(state);
    expect(gridData.segments?.some(s => s.text === 'FIX1')).toBe(true);
    expect(gridData.segments?.some(s => s.text === 'FUEL DEST')).toBe(true);
    expect(gridData.segments?.some(s => s.text === 'VNAV')).toBe(true);
  });

  it('renders HOLD page', () => {
    const data = renderHoldPage(baseState);
    expect(data.title).toBe('HOLD');
    expect(data.lines.some(l => l.text.includes('FIX'))).toBe(true);
  });

  it('renders FIX page', () => {
    const data = renderFixPage(baseState);
    expect(data.title).toBe('FIX');
    expect(data.lines.some(l => l.text.includes('REF FIX 1'))).toBe(true);
  });

  it('renders two FIX entries and exposes entry-specific actions', () => {
    const data = renderFixPage({
      ...baseState,
      fixEntries: [
        { refFix: 'RBV', radial: 180, distance: 20 },
        { refFix: 'DIXIE', radial: 270, distance: 35 },
      ],
    });

    expect(data.lines.some(l => l.text.includes('RBV'))).toBe(true);
    expect(data.lines.some(l => l.rightLabel === 'DIXIE')).toBe(true);
    expect(data.lines.some(l => l.rightLabel === '270/035')).toBe(true);
    expect(data.lskActions.L1).toBe('set_fix_ref_0');
    expect(data.lskActions.R1).toBe('set_fix_ref_1');
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

describe('Airbus Page Renderers', () => {
  const airbusState = createBaseState({
    aircraft: 'AIRBUS_A320',
    currentPage: 'INIT_A',
    position: { irsState: 'OFF', irsTimeRemaining: 0, irsAlignmentProgress: 0, refAirport: '', gate: '', lat: 0, lon: 0 },
    navPerformance: { anpNm: 0.05, rnpNm: 1.0, anp: 0.05, rnp: 1.0, rnpManual: false, activeSource: 'IRS', phase: 'ENROUTE', xteNm: 0 }
  });

  it('renders INIT A page with alignment prompt when IRS is off', () => {
    const renderer = getAirbusPageRenderer('INIT_A');
    const data = renderer!(airbusState);
    const hasIrsInit = data.segments
      ? data.segments.some(s => s.text === '<IRS INIT')
      : data.lines.some(l => l.leftLabel === '<IRS INIT');
    expect(hasIrsInit).toBe(true);
    expect(data.lskActions.L6).toBe('align_irs');
  });

  it('renders PROG page with Nav Accuracy', () => {
    const renderer = getAirbusPageRenderer('PROG_A');
    const data = renderer!(airbusState);
    const segments = (data as any).segments || data.lines;
    const hasNavAccur = Array.isArray(segments) 
      ? segments.some((s: any) => (s.text || '').includes('NAV ACCUR'))
      : segments.some((l: any) => (l.text || '').includes('NAV ACCUR'));
    const hasHigh = Array.isArray(segments)
      ? segments.some((s: any) => (s.text || '').includes('HIGH'))
      : segments.some((l: any) => (l.text || '').includes('HIGH'));
    expect(hasNavAccur).toBe(true);
    expect(hasHigh).toBe(true);
  });
});
