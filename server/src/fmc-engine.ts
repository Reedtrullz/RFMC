/**
 * Backend FMC Engine — uses shared page logic to compute DisplayData.
 * In backend-authoritative mode, this is the source of truth.
 */

import type { FMCState, DisplayData, CDUKey } from '@shared';
import { getPageRenderer, parseRouteString } from '@shared';

export class FMCEngine {
  private state: FMCState;

  constructor() {
    this.state = this.createDefaultState();
  }

  private createDefaultState(): FMCState {
    return {
      currentPage: 'IDENT',
      pageHistory: [],
      scratchpad: '',
      scratchpadError: null,
      ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
      position: { refAirport: '', gate: '' },
      performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0 },
      takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 0, vr: 0, v2: 0, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0 },
      route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '' },
      flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },
      isModified: false,
      execLit: false,
      msgLight: false,
      mode: 'STANDBY',
      connectionStatus: 'DISCONNECTED',
      connectionMode: 'STANDALONE',
      legsPageIndex: 0,
      legsPageCount: 1,
      depArrSubPage: 'DEP',
      rteSubPage: 0,
    };
  }

  getDisplayData(): DisplayData {
    const renderer = getPageRenderer(this.state.currentPage);
    return renderer(this.state);
  }

  setPage(page: string): void {
    // Navigate between pages
    const pageMap: Record<string, any> = {
      'INIT_REF': 'IDENT',
      'RTE': 'RTE',
      'DEP_ARR': 'DEP_ARR',
      'LEGS': 'LEGS',
      'PERF': 'PERF_INIT',
      'PROG': 'PROGRESS',
      'MENU': 'MENU',
    };
    const target = pageMap[page] || page;
    this.state.pageHistory.push(this.state.currentPage);
    this.state.currentPage = target as any;
    this.state.scratchpad = '';
  }

  processInput(key: string): DisplayData {
    // Simple routing of inputs
    const navKeys = ['INIT_REF', 'RTE', 'DEP_ARR', 'LEGS', 'PERF', 'PROG', 'MENU'];
    if (navKeys.includes(key)) {
      this.setPage(key);
    } else if (key === 'CLR' || key === 'DEL') {
      this.state.scratchpad = this.state.scratchpad.slice(0, -1);
    } else if (key.length === 1) {
      this.state.scratchpad += key;
    }

    return this.getDisplayData();
  }

  getState(): FMCState {
    return this.state;
  }
}
