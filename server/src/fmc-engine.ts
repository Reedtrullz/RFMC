import type { FMCState, DisplayData, PageType } from '@shared';
import { getPageRenderer, parseRouteString } from '@shared';
import {
  isValidICAO, isValidAltitude, isValidSpeed, isValidTemperature,
  isValidWind, isValidFlightNumber, isValidWaypoint, isValidVSpeeds
} from '@shared';

function isFixInActiveRoute(state: FMCState, ident: string): boolean {
  const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
  const routeFixes = new Set([
    flightPlan.origin,
    flightPlan.destination,
    ...flightPlan.waypoints.map(wp => wp.ident),
  ].filter(Boolean).map(fix => fix.toUpperCase()));

  return routeFixes.size === 0 || routeFixes.has(ident.toUpperCase());
}

function ensureFixEntries(entries: FMCState['fixEntries'], legacy: FMCState['fix']): FMCState['fixEntries'] {
  return [
    { ...(entries[0] ?? legacy) },
    { ...(entries[1] ?? { refFix: '', radial: 0, distance: 0 }) },
  ];
}

export class FMCEngine {
  private state: FMCState;

  constructor() {
    this.state = this.createDefaultState();
  }

  private createDefaultState(): FMCState {
    return {
      aircraft: 'BOEING_737',
      currentPage: 'IDENT',
      pageHistory: [],
      scratchpad: '',
      scratchpadError: null,
      ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
      position: { refAirport: '', gate: '' },
      performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0 },
      takeoff: { runway: '', toMode: 'TO', assumedTemp: 0, v1: 0, vr: 0, v2: 0, trim: 0, oat: 0, windDir: 0, windSpeed: 0, qnh: 0 },
      landing: { runway: '', flaps: '', vref: 0, ilsFrequency: '', course: 0 },
      route: { origin: '', destination: '', flightNumber: '', companyRoute: '', routeString: '' },
      flightPlan: { origin: '', destination: '', flightNumber: '', route: '', waypoints: [] },
      pendingRoute: null,
      pendingFlightPlan: null,
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
      takeoffRefPageIndex: 0,
      hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' as 'L' | 'R' },
      holdPending: null,
      fix: { refFix: '', radial: 0, distance: 0 },
      fixEntries: [
        { refFix: '', radial: 0, distance: 0 },
        { refFix: '', radial: 0, distance: 0 },
      ],
      deleteMode: false,
      editWaypointIndex: null,
      aircraftState: null,
      connectedAircraft: null,
      connectedAircraftType: null,
      connectedCapabilities: [],
      lastError: null,
      simVariables: {},
      failureMessage: null,
      externalDisplayData: null,
    };
  }

  getDisplayData(): DisplayData {
    const renderer = getPageRenderer(this.state.currentPage);
    if (!renderer) {
      const fallback = getPageRenderer('MENU');
      if (fallback) return { ...fallback(this.state), scratchpadError: this.state.scratchpadError };
      return { lines: [], title: 'ERROR', pageIndicator: '', lskActions: {}, scratchpadError: this.state.scratchpadError };
    }
    return { ...renderer(this.state), scratchpadError: this.state.scratchpadError };
  }

  setPage(page: string): void {
    const pageMap: Record<string, PageType> = {
      'INIT_REF': 'POS_INIT',
      'RTE': 'RTE',
      'CLB': 'CLB',
      'CRZ': 'CRZ',
      'DES': 'DES',
      'DIR_INTC': 'DIR_INTC',
      'DEP_ARR': 'DEP_ARR',
      'LEGS': 'LEGS',
      'HOLD': 'HOLD',
      'FIX': 'FIX',
      'PERF': 'PERF_INIT',
      'PROG': 'PROGRESS',
      'N1_LIMIT': 'N1_LIMIT',
      'MENU': 'MENU',
      'INIT_A': 'INIT_A',
      'INIT_B': 'INIT_B',
      'F_PLN': 'F_PLN',
      'PERF_TAKEOFF': 'PERF_TAKEOFF',
      'PROG_A': 'PROG_A',
      'DEP_ARR_A': 'DEP_ARR_A',
      'MCDU_MENU': 'MCDU_MENU',
      'RAD_NAV': 'RAD_NAV',
      'DATA_INDEX': 'DATA_INDEX',
    };
    const target = pageMap[page] || (page as PageType);
    this.state.pageHistory.push(this.state.currentPage);
    this.state.currentPage = target;
    if (target === 'TAKEOFF_REF') this.state.takeoffRefPageIndex = 0;
    this.state.scratchpad = '';
  }

  processInput(key: string): DisplayData {
    this.state.scratchpadError = null;

    const functionKeys = ['INIT_REF', 'RTE', 'CLB', 'CRZ', 'DES', 'DIR_INTC', 'DEP_ARR', 'LEGS', 'HOLD', 'FIX', 'PERF', 'PROG', 'N1_LIMIT', 'MENU',
      'INIT_A', 'INIT_B', 'F_PLN', 'PERF_TAKEOFF', 'PROG_A', 'DEP_ARR_A', 'MCDU_MENU', 'RAD_NAV', 'DATA_INDEX'];

    if (functionKeys.includes(key)) {
      this.setPage(key);
    } else if (key === 'CLR' || key === 'DEL') {
      if (key === 'DEL' && this.state.currentPage === 'LEGS' && this.state.scratchpad === '') {
        this.state.deleteMode = !this.state.deleteMode;
      } else {
        this.state.scratchpad = this.state.scratchpad.slice(0, -1);
      }
    } else if (key === 'EXEC') {
      this.state.execLit = false;
      this.state.isModified = false;
      if (this.state.holdPending) {
        this.state.hold = { ...this.state.holdPending };
        this.state.holdPending = null;
      }
      if (this.state.pendingRoute) {
        this.state.route = { ...this.state.pendingRoute };
        this.state.pendingRoute = null;
      }
      if (this.state.pendingFlightPlan) {
        this.state.flightPlan = { ...this.state.pendingFlightPlan };
        this.state.pendingFlightPlan = null;
      }
    } else if (key === 'NEXT_PAGE') {
      this.advancePage();
    } else if (key === 'PREV_PAGE') {
      this.rewindPage();
    } else if (/^[LR][1-6]$/.test(key)) {
      const displayData = this.getDisplayData();
      const lskAction = displayData.lskActions[key];
      if (lskAction) {
        this.handleLskAction(lskAction);
      }
    } else if (key === 'DOT') {
      this.state.scratchpad += '.';
    } else if (key === 'SLASH') {
      this.state.scratchpad += '/';
    } else if (key === 'SPACE') {
      this.state.scratchpad += ' ';
    } else if (key === 'PLUS_MINUS' || key === '+/-') {
      this.state.scratchpad += '+/-';
    } else if (key.length === 1) {
      this.state.scratchpad += key;
    }

    return this.getDisplayData();
  }

  private advancePage(): boolean {
    if (this.state.currentPage === 'RTE') {
      const prev = this.state.rteSubPage;
      this.state.rteSubPage = Math.min(this.state.rteSubPage + 1, 1);
      return this.state.rteSubPage !== prev;
    } else if (this.state.currentPage === 'LEGS') {
      const prev = this.state.legsPageIndex;
      this.state.legsPageIndex = Math.min(this.state.legsPageIndex + 1, this.state.legsPageCount - 1);
      return this.state.legsPageIndex !== prev;
    } else if (this.state.currentPage === 'PERF_INIT') {
      this.state.pageHistory.push(this.state.currentPage);
      this.state.currentPage = 'TAKEOFF_REF';
      this.state.takeoffRefPageIndex = 0;
      this.state.scratchpad = '';
      return true;
    } else if (this.state.currentPage === 'TAKEOFF_REF') {
      if (this.state.takeoffRefPageIndex < 1) {
        this.state.takeoffRefPageIndex += 1;
      } else {
        this.state.pageHistory.push(this.state.currentPage);
        this.state.currentPage = 'PERF_INIT';
        this.state.takeoffRefPageIndex = 0;
      }
      this.state.scratchpad = '';
      return true;
    }
    return false;
  }

  private rewindPage(): boolean {
    if (this.state.currentPage === 'RTE') {
      const prev = this.state.rteSubPage;
      this.state.rteSubPage = Math.max(this.state.rteSubPage - 1, 0);
      return this.state.rteSubPage !== prev;
    } else if (this.state.currentPage === 'LEGS') {
      const prev = this.state.legsPageIndex;
      this.state.legsPageIndex = Math.max(this.state.legsPageIndex - 1, 0);
      return this.state.legsPageIndex !== prev;
    } else if (this.state.currentPage === 'PERF_INIT') {
      this.state.pageHistory.push(this.state.currentPage);
      this.state.currentPage = 'TAKEOFF_REF';
      this.state.takeoffRefPageIndex = 0;
      this.state.scratchpad = '';
      return true;
    } else if (this.state.currentPage === 'TAKEOFF_REF') {
      if (this.state.takeoffRefPageIndex > 0) {
        this.state.takeoffRefPageIndex -= 1;
      } else {
        this.state.pageHistory.push(this.state.currentPage);
        this.state.currentPage = 'PERF_INIT';
      }
      this.state.scratchpad = '';
      return true;
    }
    return false;
  }

  private handleLskAction(action: string): void {
    let handled = false;

    const pageNavMap: Record<string, PageType> = {
      pos_init: 'POS_INIT',
      perf_init: 'PERF_INIT',
      rte: 'RTE',
      dep_arr: 'DEP_ARR',
      legs: 'LEGS',
      thrust_lim: 'THRUST_LIM',
      takeoff_ref: 'TAKEOFF_REF',
      menu: 'MENU',
      ident: 'IDENT',
      init_a: 'INIT_A',
      init_b: 'INIT_B',
      perf_to: 'PERF_TAKEOFF',
      perf_appr: 'PERF_APPR',
      f_pln: 'F_PLN',
      fuel_pred: 'FUEL_PRED',
      sec_fpln: 'SEC_FPLN',
      rad_nav: 'RAD_NAV',
      data_index: 'DATA_INDEX',
      mcdu_menu: 'MCDU_MENU',
      fpln_dep_arr: 'DEP_ARR_A',
    };

    const targetPage = pageNavMap[action];
    if (targetPage) {
      this.state.pageHistory.push(this.state.currentPage);
      this.state.currentPage = targetPage;
      this.state.scratchpad = '';
      handled = true;
    } else if (action === 'dep_page') {
      this.state.depArrSubPage = 'DEP';
      handled = true;
    } else if (action === 'arr_page') {
      this.state.depArrSubPage = 'ARR';
      handled = true;
    } else if (action === 'next_page' || action === 'fpln_next') {
      handled = this.advancePage();
    } else if (action === 'prev_page' || action === 'fpln_prev') {
      handled = this.rewindPage();
    } else if (this.state.currentPage === 'LEGS') {
      const wpMatch = action.match(/^(delete_wp|edit_wp)_(\d+)$/);
      if (wpMatch) {
        const wpAction = wpMatch[1];
        const wpIndex = parseInt(wpMatch[2], 10);
        if (wpAction === 'delete_wp' && this.state.deleteMode) {
          const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
          const waypoints = [...flightPlan.waypoints];
          waypoints.splice(wpIndex, 1);
          this.state.pendingFlightPlan = { ...flightPlan, waypoints };
          this.state.deleteMode = false;
          handled = true;
          this.state.isModified = true;
          this.state.execLit = true;
        } else if (wpAction === 'edit_wp') {
          if (this.state.scratchpad) {
            const ident = this.state.scratchpad.toUpperCase();
            const result = isValidWaypoint(ident);
            if (!result.valid) {
              this.state.scratchpadError = result.error ?? 'INVALID ENTRY';
            } else {
              const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
              const waypoints = [...flightPlan.waypoints];
              const nextWaypoint = { ident, discontinuity: false };
              if (waypoints[wpIndex]?.discontinuity) {
                waypoints[wpIndex] = nextWaypoint;
              } else {
                waypoints.splice(wpIndex, 0, nextWaypoint);
              }
              this.state.pendingFlightPlan = { ...flightPlan, waypoints };
              this.state.scratchpad = '';
              this.state.isModified = true;
              this.state.execLit = true;
            }
          }
          this.state.editWaypointIndex = wpIndex;
          handled = true;
        }
      }
    } else if (action === 'atc') {
      handled = true;
    } else if (action === 'des_now') {
      this.state.scratchpad = 'DES NOW ARMED';
      this.state.msgLight = true;
      handled = true;
    } else if (action === 'select_to') {
      this.state.takeoff = { ...this.state.takeoff, toMode: this.state.scratchpad.trim().toUpperCase() || 'TO' };
      this.state.scratchpad = '';
      handled = true;
      this.state.isModified = true;
      this.state.execLit = true;
    } else if (action === 'select_to1') {
      this.state.takeoff = { ...this.state.takeoff, toMode: 'TO 1' };
      handled = true;
      this.state.isModified = true;
      this.state.execLit = true;
    } else if (action === 'select_to2') {
      this.state.takeoff = { ...this.state.takeoff, toMode: 'TO 2' };
      handled = true;
      this.state.isModified = true;
      this.state.execLit = true;
    }

    if (!handled) {
      const dataResult = this.handleDataEntry(action);
      if (dataResult === true) {
        handled = true;
        this.state.isModified = true;
        this.state.execLit = true;
      } else if (dataResult === 'error') {
        handled = true;
      }
    }

    if (!handled) {
      this.state.scratchpadError = 'NOT SUPPORTED';
    }
  }

  private handleDataEntry(action: string): boolean | 'error' {
    const sp = this.state.scratchpad.trim();
    if (!sp) return false;

    const err = (): 'error' => { this.state.scratchpadError = 'INVALID ENTRY'; return 'error'; };
    const icaoErr = (r: { valid: boolean; error?: string }): 'error' => { this.state.scratchpadError = r.error ?? 'INVALID ENTRY'; return 'error'; };

    switch (action) {
      case 'set_ref_airport': {
        const result = isValidICAO(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        this.state.position = { ...this.state.position, refAirport: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_gate': {
        this.state.position = { ...this.state.position, gate: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_origin': {
        const result = isValidICAO(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        const route = this.state.pendingRoute ?? this.state.route;
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        this.state.pendingRoute = { ...route, origin: sp.toUpperCase() };
        this.state.pendingFlightPlan = { ...flightPlan, origin: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_dest': {
        const result = isValidICAO(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        const route = this.state.pendingRoute ?? this.state.route;
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        this.state.pendingRoute = { ...route, destination: sp.toUpperCase() };
        this.state.pendingFlightPlan = { ...flightPlan, destination: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_flt_no': {
        const result = isValidFlightNumber(sp);
        if (!result.valid) return icaoErr(result);
        const route = this.state.pendingRoute ?? this.state.route;
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        this.state.pendingRoute = { ...route, flightNumber: sp.toUpperCase() };
        this.state.pendingFlightPlan = { ...flightPlan, flightNumber: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_route': {
        const routeStr = sp.toUpperCase();
        const parsed = parseRouteString(routeStr);
        const route = this.state.pendingRoute ?? this.state.route;
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        const waypoints = parsed.waypoints.length > 0 ? parsed.waypoints : [{ ident: parsed.origin, discontinuity: false }, { ident: parsed.destination, discontinuity: false }].filter(w => w.ident);
        this.state.pendingRoute = { ...route, routeString: routeStr };
        this.state.pendingFlightPlan = { ...flightPlan, waypoints, route: routeStr };
        this.state.legsPageCount = Math.max(1, Math.ceil(waypoints.length / 5));
        this.state.scratchpad = '';
        return true;
      }
      case 'set_crz_alt': {
        const result = isValidAltitude(sp);
        if (!result.valid) return icaoErr(result);
        this.state.performance = { ...this.state.performance, crzAlt: parseInt(sp) * 100 || parseInt(sp) || 0 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_cost_index': {
        const ci = parseInt(sp);
        if (isNaN(ci) || ci < 0 || ci > 500) return err();
        this.state.performance = { ...this.state.performance, costIndex: ci };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_zfw': {
        const zfw = parseFloat(sp);
        if (isNaN(zfw) || zfw <= 0) return err();
        this.state.performance = { ...this.state.performance, zfw: zfw * 1000 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_reserve': {
        const res = parseFloat(sp);
        if (isNaN(res) || res < 0) return err();
        this.state.performance = { ...this.state.performance, reserve: res * 1000 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_runway': {
        if (!sp || sp.length < 2) return err();
        const runway = sp.toUpperCase();
        const runwayChanged = this.state.takeoff.runway && this.state.takeoff.runway !== runway;
        const speedsEntered = this.state.takeoff.v1 > 0 || this.state.takeoff.vr > 0 || this.state.takeoff.v2 > 0;
        this.state.takeoff = runwayChanged && speedsEntered
          ? { ...this.state.takeoff, runway, v1: 0, vr: 0, v2: 0 }
          : { ...this.state.takeoff, runway };
        this.state.msgLight = runwayChanged && speedsEntered ? true : this.state.msgLight;
        this.state.scratchpad = runwayChanged && speedsEntered ? 'V SPEEDS DELETED' : '';
        return true;
      }
      case 'set_to_mode': {
        const mode = sp.toUpperCase();
        if (!['TO', 'TO 1', 'TO 2'].includes(mode)) return err();
        this.state.takeoff = { ...this.state.takeoff, toMode: mode };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_v1': {
        const result = isValidSpeed(sp);
        if (!result.valid) return icaoErr(result);
        const newTakeoff = { ...this.state.takeoff, v1: parseInt(sp) || 0 };
        const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
        if (!vsResult.valid) { this.state.scratchpadError = vsResult.error ?? 'INVALID V-SPEEDS'; return 'error'; }
        this.state.takeoff = newTakeoff;
        this.state.scratchpad = '';
        return true;
      }
      case 'set_vr': {
        const result = isValidSpeed(sp);
        if (!result.valid) return icaoErr(result);
        const newTakeoff = { ...this.state.takeoff, vr: parseInt(sp) || 0 };
        const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
        if (!vsResult.valid) { this.state.scratchpadError = vsResult.error ?? 'INVALID V-SPEEDS'; return 'error'; }
        this.state.takeoff = newTakeoff;
        this.state.scratchpad = '';
        return true;
      }
      case 'set_v2': {
        const result = isValidSpeed(sp);
        if (!result.valid) return icaoErr(result);
        const newTakeoff = { ...this.state.takeoff, v2: parseInt(sp) || 0 };
        const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
        if (!vsResult.valid) { this.state.scratchpadError = vsResult.error ?? 'INVALID V-SPEEDS'; return 'error'; }
        this.state.takeoff = newTakeoff;
        this.state.scratchpad = '';
        return true;
      }
      case 'set_trim': {
        const trim = parseFloat(sp);
        if (isNaN(trim)) return err();
        this.state.takeoff = { ...this.state.takeoff, trim };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_oat': {
        const result = isValidTemperature(sp);
        if (!result.valid) return icaoErr(result);
        this.state.takeoff = { ...this.state.takeoff, oat: parseInt(sp) || 0 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_assumed_temp': {
        const temp = parseInt(sp);
        if (isNaN(temp)) return err();
        this.state.takeoff = { ...this.state.takeoff, assumedTemp: temp };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_direct_to': {
        const result = isValidWaypoint(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        const route = this.state.pendingRoute ?? this.state.route;
        this.state.pendingRoute = { ...route, directTo: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_wind': {
        const result = isValidWind(sp);
        if (!result.valid) return icaoErr(result);
        const parts = sp.split('/');
        if (parts.length === 2) {
          this.state.takeoff = { ...this.state.takeoff, windDir: parseInt(parts[0]) || 0, windSpeed: parseInt(parts[1]) || 0 };
        }
        this.state.scratchpad = '';
        return true;
      }
      case 'set_qnh': {
        const qnh = parseFloat(sp);
        if (isNaN(qnh) || qnh < 900 || qnh > 1100) return err();
        this.state.takeoff = { ...this.state.takeoff, qnh: qnh * 100 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_landing_runway': {
        if (sp.length < 2) return err();
        const runway = sp.toUpperCase();
        this.state.landing = { ...this.state.landing, runway };
        this.state.route = { ...this.state.route, runway };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_landing_flaps': {
        const flaps = sp.toUpperCase();
        if (!['15', '30', '40'].includes(flaps)) return err();
        this.state.landing = { ...this.state.landing, flaps };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_landing_vref': {
        const vref = parseInt(sp, 10);
        if (isNaN(vref) || vref < 80 || vref > 200) return err();
        this.state.landing = { ...this.state.landing, vref };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_ils_frequency': {
        const frequency = parseFloat(sp);
        if (isNaN(frequency) || frequency < 108.1 || frequency > 111.95) return err();
        this.state.landing = { ...this.state.landing, ilsFrequency: frequency.toFixed(2) };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_ils_course': {
        const course = parseInt(sp, 10);
        if (isNaN(course) || course < 1 || course > 360) return err();
        this.state.landing = { ...this.state.landing, course };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_hold_fix': {
        const ident = sp.toUpperCase();
        const result = isValidWaypoint(ident);
        if (!result.valid) return icaoErr(result);
        if (!isFixInActiveRoute(this.state, ident)) return icaoErr({ valid: false, error: 'NOT IN ROUTE' });
        const base = this.state.holdPending ?? this.state.hold;
        this.state.holdPending = { ...base, fix: ident };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_inbound_crs': {
        const crs = parseInt(sp);
        if (isNaN(crs) || crs < 1 || crs > 360) return err();
        const base = this.state.holdPending ?? this.state.hold;
        this.state.holdPending = { ...base, inboundCourse: crs };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_leg_time': {
        const lt = parseFloat(sp);
        if (isNaN(lt) || lt <= 0 || lt > 9.9) return err();
        const base = this.state.holdPending ?? this.state.hold;
        this.state.holdPending = { ...base, legTime: lt };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_leg_dist': {
        const ld = parseFloat(sp);
        if (isNaN(ld) || ld < 0 || ld > 999) return err();
        const base = this.state.holdPending ?? this.state.hold;
        this.state.holdPending = { ...base, legDist: ld };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_hold_direction': {
        const dir = sp.toUpperCase();
        if (dir !== 'L' && dir !== 'R') return err();
        const base = this.state.holdPending ?? this.state.hold;
        this.state.holdPending = { ...base, direction: dir as 'L' | 'R' };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_fix_ref':
      case 'set_fix_ref_0':
      case 'set_fix_ref_1': {
        const result = isValidWaypoint(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        const entryIndex = action.endsWith('_1') ? 1 : 0;
        const fixEntries = ensureFixEntries(this.state.fixEntries, this.state.fix);
        fixEntries[entryIndex] = { ...fixEntries[entryIndex], refFix: sp.toUpperCase() };
        this.state.fixEntries = fixEntries;
        if (entryIndex === 0) this.state.fix = fixEntries[0];
        this.state.scratchpad = '';
        return true;
      }
      case 'set_fix_radial_distance':
      case 'set_fix_radial_distance_0':
      case 'set_fix_radial_distance_1': {
        const parts = sp.split('/');
        if (parts.length !== 2) return err();
        const radial = parseInt(parts[0]);
        const distance = parseInt(parts[1]);
        if (isNaN(radial) || radial < 1 || radial > 360 || isNaN(distance) || distance < 0 || distance > 999) return err();
        const entryIndex = action.endsWith('_1') ? 1 : 0;
        const fixEntries = ensureFixEntries(this.state.fixEntries, this.state.fix);
        fixEntries[entryIndex] = { ...fixEntries[entryIndex], radial, distance };
        this.state.fixEntries = fixEntries;
        if (entryIndex === 0) this.state.fix = fixEntries[0];
        this.state.scratchpad = '';
        return true;
      }
      case 'set_from_to': {
        if (sp.includes('/')) {
          const [from, to] = sp.toUpperCase().split('/');
          const fromResult = isValidICAO(from);
          const toResult = isValidICAO(to);
          if (!fromResult.valid) return icaoErr(fromResult);
          if (!toResult.valid) return icaoErr(toResult);
          const route = this.state.pendingRoute ?? this.state.route;
          const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
          this.state.pendingRoute = { ...route, origin: from, destination: to };
          this.state.pendingFlightPlan = { ...flightPlan, origin: from, destination: to };
          this.state.scratchpad = '';
          return true;
        }
        return false;
      }
      case 'set_crz_fl': {
        const result = isValidAltitude(sp);
        if (!result.valid) return icaoErr(result);
        this.state.performance = { ...this.state.performance, crzAlt: parseInt(sp) * 100 || parseInt(sp) || 0 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_altn': {
        const result = isValidICAO(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        this.state.route = { ...this.state.route, alternate: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_flt_nbr': {
        const result = isValidFlightNumber(sp);
        if (!result.valid) return icaoErr(result);
        const route = this.state.pendingRoute ?? this.state.route;
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        this.state.pendingRoute = { ...route, flightNumber: sp.toUpperCase() };
        this.state.pendingFlightPlan = { ...flightPlan, flightNumber: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_block': {
        const fuel = parseFloat(sp);
        if (isNaN(fuel) || fuel <= 0) return err();
        this.state.performance = { ...this.state.performance, fuel: fuel * 1000 };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_sid': {
        const route = this.state.pendingRoute ?? this.state.route;
        this.state.pendingRoute = { ...route, sid: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_rwy': {
        if (sp.length < 2) return err();
        const route = this.state.pendingRoute ?? this.state.route;
        this.state.pendingRoute = { ...route, runway: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_star': {
        const route = this.state.pendingRoute ?? this.state.route;
        this.state.pendingRoute = { ...route, star: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_appr': {
        const route = this.state.pendingRoute ?? this.state.route;
        this.state.pendingRoute = { ...route, approach: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_flaps': {
        this.state.takeoff = { ...this.state.takeoff, flaps: sp.toUpperCase() };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_flex': {
        const temp = parseInt(sp);
        if (isNaN(temp)) return err();
        this.state.takeoff = { ...this.state.takeoff, flexTemp: temp };
        this.state.scratchpad = '';
        return true;
      }
      case 'set_cg': {
        const cg = parseFloat(sp);
        if (isNaN(cg)) return err();
        this.state.performance = { ...this.state.performance, cg };
        this.state.scratchpad = '';
        return true;
      }
    }

    return false;
  }

  getState(): FMCState {
    return this.state;
  }
}
