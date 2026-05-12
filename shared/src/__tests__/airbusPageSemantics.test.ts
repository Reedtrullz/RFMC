import { describe, expect, it } from 'vitest';
import { renderInitA, renderPerfTakeoff, renderFuelPred, renderSecFpln, renderRadNav, renderDataIndex, renderProgA320 } from '../fmc/pages/airbus';
import { createBaseState } from './testUtils';

const baseState = createBaseState({
  aircraft: 'AIRBUS_A320',
  currentPage: 'INIT_A',
  ident: { aircraftType: 'A320neo', engRating: 'LEAP', navDataVersion: 'AIRAC', opProgram: 'FMGS' },
  performance: { crzAlt: 35000, costIndex: 50, zfw: 60000, fuel: 8000, cg: 25, reserve: 0 },
  takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 130, vr: 135, v2: 140, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0, flaps: 'CONF2', flexTemp: 55 },
  route: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AF123', companyRoute: '', routeString: '' },
  flightPlan: { origin: 'KJFK', destination: 'KDCA', flightNumber: 'AF123', route: '', waypoints: [] },
  efisL: {
    mode: 'ARC',
    range: 40,
    centered: false,
    side: 'L',
    overlays: {
      wpt: true, arpt: true, sta: true, data: false, 
      pos: false, terr: false, wxr: false, tfc: true, cstr: true
    },
  },
  efisR: {
    mode: 'ARC',
    range: 40,
    centered: false,
    side: 'R',
    overlays: {
      wpt: true, arpt: true, sta: true, data: false, 
      pos: false, terr: false, wxr: false, tfc: true, cstr: true
    },
  },
});

describe('Airbus page semantics', () => {
  it('tags INIT A title, labels, and modifiable fields', () => {
    const data = renderInitA(baseState);
    expect(data.lines[0]).toMatchObject({ semantic: 'title', inverse: true });
    expect(data.lines.find(l => l.text.includes('FROM/TO'))?.semantic).toBe('label');
    expect(data.lines.find(l => l.text.includes('KJFK/KDCA'))?.semantic).toBe('guidance');
  });

  it('tags active and guidance fields on PERF TAKEOFF', () => {
    const data = renderPerfTakeoff(baseState);
    expect(data.lines.find(l => l.text.includes('5000'))?.semantic).toBe('activeData');
    expect(data.lines.find(l => l.text.includes('CONF2'))?.semantic).toBe('guidance');
  });

  it('does not show interactive arrows on display-only Airbus pages', () => {
    const displayOnlyPages = [
      renderFuelPred(baseState),
      renderDataIndex(baseState),
      renderProgA320(baseState),
    ];

    for (const data of displayOnlyPages) {
      const hasArrows = data.lines.some((l: any) => l.leftLabel === '<');
      expect(hasArrows, `${data.title} should not show interactive arrows`).toBe(false);

      const allActions = Object.values(data.lskActions);
      const hasActions = allActions.some((a: any) => a !== null);
      expect(hasActions, `${data.title} should not expose any LSK actions`).toBe(false);
    }
  });
});
