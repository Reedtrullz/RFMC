import { describe, expect, it } from 'vitest';
import { renderInitAGrid } from '../fmc/pages/airbus/initA.grid';
import { renderPerfTakeoffGrid } from '../fmc/pages/airbus/perfTakeoff.grid';
import { renderFuelPredGrid } from '../fmc/pages/airbus/fuelPred.grid';
import { renderProgGrid } from '../fmc/pages/airbus/prog.grid';
import { createBaseState } from './testUtils';

const baseState = createBaseState({
  aircraft: 'AIRBUS_A320',
  currentPage: 'INIT_A',
  ident: { aircraftType: 'A320neo', engRating: 'LEAP', navDataVersion: 'AIRAC', opProgram: 'FMGS' },
  performance: { crzAlt: 35000, costIndex: 50, zfw: 60000, fuel: 8000, cg: 25, reserve: 0, grossWeight: 68000 },
  takeoff: {
    runway: '',
    toMode: 'TO',
    assumedTemp: 0,
    v1: 130,
    vr: 135,
    v2: 140,
    trim: 0,
    oat: 0,
    windDir: 0,
    windSpeed: 0,
    qnh: 0,
    flaps: 'CONF2',
    flexTemp: 55,
  },
  route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AF123', companyRoute: '', routeString: '' },
  flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AF123', route: '', waypoints: [] },
  efisL: {
    mode: 'ARC',
    range: 40,
    centered: false,
    side: 'L',
    overlays: {
      wpt: true,
      arpt: true,
      sta: true,
      data: false,
      pos: false,
      terr: false,
      wxr: false,
      tfc: true,
      cstr: true,
    },
  },
  efisR: {
    mode: 'ARC',
    range: 40,
    centered: false,
    side: 'R',
    overlays: {
      wpt: true,
      arpt: true,
      sta: true,
      data: false,
      pos: false,
      terr: false,
      wxr: false,
      tfc: true,
      cstr: true,
    },
  },
});

describe('Airbus page semantics', () => {
  it('tags INIT A title, labels, and modifiable fields', () => {
    const data = renderInitAGrid(baseState);
    const titleSeg = data.segments!.find((s) => s.row === 0 && s.semantic === 'title');
    expect(titleSeg).toMatchObject({ semantic: 'title', inverse: true });
    expect(data.segments!.find((s) => s.text.includes('FROM/TO'))?.semantic).toBe('label');
    expect(data.segments!.find((s) => s.text.includes('KJFK/KDCA'))?.semantic).toBe('activeData');
  });

  it('tags active and guidance fields on PERF TAKEOFF', () => {
    const data = renderPerfTakeoffGrid(baseState);
    expect(data.segments!.find((s) => s.text.includes('5000'))?.semantic).toBe('activeData');
    expect(data.segments!.find((s) => s.text.includes('CONF2'))?.semantic).toBe('guidance');
  });

  it('does not show interactive arrows on display-only Airbus pages', () => {
    const displayOnlyPages = [renderFuelPredGrid(baseState), renderProgGrid(baseState)];

    for (const data of displayOnlyPages) {
      const hasArrows = data.segments!.some((s) => s.text.includes('<'));
      expect(hasArrows, `should not show interactive arrows`).toBe(false);

      const allActions = Object.values(data.lskActions);
      const hasActions = allActions.some((a) => a !== null);
      expect(hasActions, `should not expose any LSK actions`).toBe(false);
    }
  });
});
