import type { FMCState, DisplayData, PageType } from '@virtual-cdu/shared';
import type { AircraftType, AltitudeConstraint, SpeedConstraint } from '@virtual-cdu/shared';
import { getPageRenderer, parseRouteString, FmsRuntimeEngine } from '@virtual-cdu/shared';
import {
  isValidICAO,
  isValidAltitude,
  isValidSpeed,
  isValidTemperature,
  isValidWind,
  isValidFlightNumber,
  isValidWaypoint,
  isValidVSpeeds,
  isProcedure,
  isValidFrequency,
  isValidADF,
  getTutorialScenario,
} from '@virtual-cdu/shared';

function isFixInActiveRoute(state: FMCState, ident: string): boolean {
  const flightPlan = state.pendingFlightPlan ?? state.flightPlan;
  const routeFixes = new Set(
    [flightPlan.origin, flightPlan.destination, ...flightPlan.waypoints.map((wp) => wp.ident)]
      .filter(Boolean)
      .map((fix) => fix.toUpperCase()),
  );

  return routeFixes.size === 0 || routeFixes.has(ident.toUpperCase());
}

function ensureFixEntries(entries: FMCState['fixEntries'], legacy: FMCState['fix']): FMCState['fixEntries'] {
  return [{ ...(entries[0] ?? legacy) }, { ...(entries[1] ?? { refFix: '', radial: 0, distance: 0 }) }];
}

export interface FMCEngineOptions {
  onError?: (err: Error) => void;
}

export class FMCEngine {
  private state: FMCState;
  private tickInterval: any = null;
  private onError?: (err: Error) => void;

  constructor(options?: FMCEngineOptions) {
    this.state = this.createDefaultState();
    this.onError = options?.onError;
    this.startTickLoop();
  }

  private startTickLoop(): void {
    // 10Hz periodic tick loop (100ms) to ensure LNAV/VNAV state updates on the backend
    this.tickInterval = setInterval(() => {
      try {
        const nextState = FmsRuntimeEngine.tick(this.state, 0.1);
        if (nextState) {
          this.state = {
            ...this.state,
            ...nextState,
            autopilot: {
              ...this.state.autopilot,
              truth: {
                ...this.state.autopilot.truth,
                ...nextState.autopilot?.truth,
              },
            },
          };
        }
      } catch (err) {
        const errorObject = err instanceof Error ? err : new Error(String(err));
        console.error('[FMC Engine] Error during server engine tick:', errorObject);
        if (this.onError) {
          this.onError(errorObject);
        }
        this.destroy();
      }
    }, 100);
  }

  destroy(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private createDefaultState(): FMCState {
    return {
      aircraft: 'BOEING_737',
      page: 'IDENT',
      currentPage: 'IDENT',
      pageHistory: [],
      scratchpad: '',
      scratchpadError: null,
      demoMode: false,
      ident: { aircraftType: '737-800', engRating: '26K', navDataVersion: 'FMC21A1', opProgram: '2247662-03' },
      position: {
        refAirport: '',
        gate: '',
        lat: 0,
        lon: 0,
        irsState: 'OFF',
        irsAlignmentProgress: 0,
        irsTimeRemaining: 600,
      },
      navPerformance: {
        anpNm: 2.0,
        rnpNm: 2.0,
        phase: 'ENROUTE',
        anp: 0.05,
        rnp: 2.0,
        rnpManual: false,
        activeSource: 'IRS',
        xteNm: 0,
      },
      activeNavSource: 'IRS',
      sensors: [
        { source: 'GPS', available: true, positionErrorNm: 0.05 },
        { source: 'IRS', available: true, positionErrorNm: 2.0 },
      ],
      alerts: [],
      signsOn: false,
      windowsLocked: false,
      posPageIndex: 0,
      performance: { crzAlt: 0, costIndex: 0, zfw: 0, fuel: 0, cg: 0, reserve: 0, grossWeight: 0 },
      takeoff: {
        runway: '',
        toMode: 'TO',
        assumedTemp: 0,
        v1: 0,
        vr: 0,
        v2: 0,
        trim: 0,
        oat: 0,
        windDir: 0,
        windSpeed: 0,
        qnh: 0,
      },
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
      autopilot: {
        boeing: {
          courseL: 0,
          courseR: 0,
          speed: 100,
          mach: null,
          heading: 0,
          altitude: 10000,
          verticalSpeed: 0,
          fdLeft: false,
          fdRight: false,
          autothrottleArm: false,
          n1: false,
          speedMode: false,
          lnav: false,
          vnav: false,
          lvlChg: false,
          hdgSel: false,
          vorLoc: false,
          app: false,
          altHold: false,
          vs: false,
          cmdA: false,
          cmdB: false,
          cwsA: false,
          cwsB: false,
        },
        airbus: {
          speed: 100,
          speedManaged: true,
          heading: 0,
          headingManaged: true,
          altitude: 10000,
          altitudeManaged: true,
          verticalSpeed: 0,
          fpa: 0,
          fd1: false,
          fd2: false,
          athr: false,
          ap1: false,
          ap2: false,
          loc: false,
          appr: false,
          exped: false,
          hdgTrkMode: 'HDG_VS' as const,
          metricAltitude: false,
          speedMachMode: 'SPD' as const,
        },
        truth: {
          lateralActive: 'OFF',
          verticalActive: 'OFF',
          thrustActive: 'OFF',
          autopilotStatus: 'OFF',
          lastModeChangeTimestamps: {
            thrust: 0,
            lateral: 0,
            vertical: 0,
          },
        },
      },
      efisL: this.createDefaultEFIS('BOEING_737', 'L'),
      efisR: this.createDefaultEFIS('BOEING_737', 'R'),
      brightness: 100,
      cockpitMode: false,
      cockpitLayoutMode: 'fmc-focus',
      hiddenPanels: ['nd', 'pfd', 'autoflight', 'checklist', 'connection', 'settings'],
      pinnedPanels: [],
      focusedPanel: null,
      latency: 0,
      sessionStartTime: null,
      radios: {
        vor1: '113.90',
        vor2: '115.70',
        adf1: '342',
      },
      tutorialActive: false,
      tutorialCompleted: false,
      tutorialStepIndex: 0,
      tutorialScenario: null,
      tutorialStartTime: null,
      tutorialErrors: 0,
      tutorialHint: null,
      tutorialSkipAvailable: false,
      tutorialHighlight: null,
      tutorialConfidence: null,
      selectedPlanWaypointIndex: null,
      trainingActive: false,
      trainingScenario: null,
      trainingEngine: null,
      trainingMistakes: [],
      trainingScore: null,
      trainingStepIndex: 0,
      trainingCompleted: false,
      activeScenario: null,
      flightPathHistory: [],
      debriefMode: false,
      isReportVisible: false,
      tutorialHintLevel: 0,
      tutorialHintTimer: null,
      atsu: {
        messages: [],
        pendingUplink: null,
      },
      flightPhase: 'PREFLIGHT',
      scratchpadMessages: [],
      trafficTargets: [],
      selectedMessageId: null,
      gpwsAlert: 'NONE',
      tcasAlert: false,
    };
  }

  private createDefaultEFIS(aircraft: AircraftType, side: 'L' | 'R'): any {
    return {
      mode: aircraft === 'AIRBUS_A320' ? 'ARC' : 'MAP',
      range: 40,
      overlays: {
        fix: true,
        hold: true,
        wpt: true,
        arpt: true,
        sta: true,
        data: false,
        pos: false,
        terr: false,
        wxr: false,
        tfc: true,
      },
      centered: false,
      side,
    };
  }

  getDisplayData(): DisplayData {
    const renderer = getPageRenderer(this.state.currentPage);
    if (!renderer) {
      const fallback = getPageRenderer('MENU');
      if (fallback) return { ...fallback(this.state), scratchpadError: this.state.scratchpadError };
      return {
        lines: [],
        title: 'ERROR',
        pageIndicator: '',
        lskActions: {},
        scratchpadError: this.state.scratchpadError,
      };
    }
    return { ...renderer(this.state), scratchpadError: this.state.scratchpadError };
  }

  setPage(page: string): void {
    const pageMap: Record<string, PageType> = {
      INIT_REF: 'POS_INIT',
      RTE: 'RTE',
      CLB: 'CLB',
      CRZ: 'CRZ',
      DES: 'DES',
      DIR_INTC: 'DIR_INTC',
      DEP_ARR: 'DEP_ARR',
      LEGS: 'LEGS',
      HOLD: 'HOLD',
      FIX: 'FIX',
      PERF: 'PERF_INIT',
      PROG: 'PROGRESS',
      N1_LIMIT: 'N1_LIMIT',
      MENU: 'MENU',
      INIT_A: 'INIT_A',
      INIT_B: 'INIT_B',
      F_PLN: 'F_PLN',
      PERF_TAKEOFF: 'PERF_TAKEOFF',
      PROG_A: 'PROG_A',
      DEP_ARR_A: 'DEP_ARR_A',
      MCDU_MENU: 'MCDU_MENU',
      RAD_NAV: 'RAD_NAV',
      DATA_INDEX: 'DATA_INDEX',
    };
    const target = pageMap[page] || (page as PageType);
    this.state.pageHistory.push(this.state.currentPage);
    this.state.currentPage = target;
    if (target === 'TAKEOFF_REF') this.state.takeoffRefPageIndex = 0;
    this.state.scratchpad = '';
  }

  processInput(key: string): DisplayData {
    this.state.scratchpadError = null;
    this.state.msgLight = false;

    const spBefore = this.state.scratchpad.trim();
    let handled = false;
    let action: string | null = null;

    if (
      key === 'L1' ||
      key === 'L2' ||
      key === 'L3' ||
      key === 'L4' ||
      key === 'L5' ||
      key === 'L6' ||
      key === 'R1' ||
      key === 'R2' ||
      key === 'R3' ||
      key === 'R4' ||
      key === 'R5' ||
      key === 'R6'
    ) {
      const display = this.getDisplayData();
      action = display.lskActions[key];
      if (action) {
        handled = this.handleLSKAction(action);
      }
    } else {
      handled = this.handleKeyAction(key);
    }

    if (this.state.tutorialActive) {
      this.checkTutorialProgression(key, action, spBefore);
    }

    return this.getDisplayData();
  }

  private handleKeyAction(key: string): boolean {
    const functionKeys = [
      'INIT_REF',
      'RTE',
      'CLB',
      'CRZ',
      'DES',
      'DIR_INTC',
      'DEP_ARR',
      'LEGS',
      'HOLD',
      'FIX',
      'PERF',
      'PROG',
      'N1_LIMIT',
      'MENU',
      'INIT_A',
      'INIT_B',
      'F_PLN',
      'PERF_TAKEOFF',
      'PROG_A',
      'DEP_ARR_A',
      'MCDU_MENU',
      'RAD_NAV',
      'DATA_INDEX',
    ];

    if (functionKeys.includes(key)) {
      this.setPage(key as PageType);
      return true;
    }

    if (key === 'CLR' || key === 'DEL') {
      if (key === 'DEL' && this.state.currentPage === 'LEGS' && this.state.scratchpad === '') {
        this.state.deleteMode = !this.state.deleteMode;
      } else if (key === 'CLR' && this.state.scratchpad === '' && this.state.isModified) {
        this.state.pendingRoute = null;
        this.state.pendingFlightPlan = null;
        this.state.holdPending = null;
        this.state.isModified = false;
        this.state.execLit = false;
      } else {
        this.state.scratchpad = this.state.scratchpad.slice(0, -1);
      }
      return true;
    }

    if (key === 'EXEC') {
      if (this.state.editWaypointIndex !== null && this.state.scratchpad.trim()) {
        const sp = this.state.scratchpad.trim();
        const idx = this.state.editWaypointIndex;
        let altitude: any;
        let speed: any;

        const altMatch = sp.match(/^(\d{3,5})$/);
        const spdMatch = sp.match(/^\/(\d{3})$/);
        const bothMatch = sp.match(/^(\d{3,5})\/(\d{3})$/);

        if (bothMatch) {
          const alt = parseInt(bothMatch[1], 10);
          const spd = parseInt(bothMatch[2], 10);
          altitude = { type: 'AT', altitude: alt >= 1000 ? alt : alt * 100 };
          speed = { type: 'AT', speed: spd };
        } else if (spdMatch) {
          speed = { type: 'AT', speed: parseInt(spdMatch[1], 10) };
        } else if (altMatch) {
          const alt = parseInt(altMatch[1], 10);
          altitude = { type: 'AT', altitude: alt >= 1000 ? alt : alt * 100 };
        } else {
          this.state.scratchpadError = 'INVALID FORMAT';
          return true;
        }

        this.updateWaypointConstraint(idx, altitude, speed);
        return true;
      }

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
      return true;
    }

    if (key === 'NEXT_PAGE') {
      return this.advancePage();
    }

    if (key === 'PREV_PAGE') {
      return this.rewindPage();
    }

    if (key === 'SPACE') {
      this.state.scratchpad += ' ';
      return true;
    }

    if (key === 'PLUS_MINUS' || key === '+/-') {
      this.state.scratchpad += '+/-';
      return true;
    }

    if (key === 'DOT') {
      this.state.scratchpad += '.';
      return true;
    }

    if (key === 'SLASH') {
      this.state.scratchpad += '/';
      return true;
    }

    if (key.length === 1) {
      this.state.scratchpad += key;
      return true;
    }

    return false;
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
    } else if (this.state.currentPage === 'INIT_A') {
      this.setPage('INIT_B');
      return true;
    } else if (this.state.currentPage === 'INIT_B') {
      this.setPage('INIT_A');
      return true;
    } else if (this.state.currentPage === 'PERF_TAKEOFF') {
      this.setPage('PERF_APPR');
      return true;
    } else if (this.state.currentPage === 'PERF_APPR') {
      this.setPage('PERF_TAKEOFF');
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
    } else if (this.state.currentPage === 'INIT_A') {
      this.setPage('INIT_B');
      return true;
    } else if (this.state.currentPage === 'INIT_B') {
      this.setPage('INIT_A');
      return true;
    } else if (this.state.currentPage === 'PERF_TAKEOFF') {
      this.setPage('PERF_APPR');
      return true;
    } else if (this.state.currentPage === 'PERF_APPR') {
      this.setPage('PERF_TAKEOFF');
      return true;
    }
    return false;
  }

  private updateWaypointConstraint(index: number, altitude?: AltitudeConstraint, speed?: SpeedConstraint): void {
    const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
    const waypoints = [...flightPlan.waypoints];
    if (index >= 0 && index < waypoints.length) {
      waypoints[index] = { ...waypoints[index], altitudeConstraint: altitude, speedConstraint: speed };
      this.state.pendingFlightPlan = { ...flightPlan, waypoints };
      this.state.isModified = true;
      this.state.execLit = true;
      this.state.editWaypointIndex = null;
      this.state.scratchpad = '';
    }
  }

  private handleLSKAction(action: string): boolean {
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
      erase: this.state.currentPage,
      copy_active: this.state.currentPage,
      set_vor1: this.state.currentPage,
      set_vor2: this.state.currentPage,
      set_adf1: this.state.currentPage,
      set_adf2: this.state.currentPage,
    };

    const targetPage = pageNavMap[action];
    if (targetPage) {
      if (action === 'erase') {
        this.state.pendingRoute = null;
        this.state.pendingFlightPlan = null;
        this.state.holdPending = null;
        this.state.isModified = false;
        this.state.execLit = false;
        this.state.editWaypointIndex = null;
        this.state.scratchpad = '';
      } else if (action === 'copy_active') {
        this.state.pendingFlightPlan = { ...this.state.flightPlan };
        this.state.pendingRoute = { ...this.state.route };
        this.state.isModified = true;
        this.state.execLit = true;
        this.state.scratchpad = 'COPIED TO SEC';
      } else if (action.startsWith('set_vor') || action.startsWith('set_adf')) {
        this.state.scratchpad = '';
      } else {
        this.state.pageHistory.push(this.state.currentPage);
        this.state.currentPage = targetPage;
      }
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
    return handled;
  }

  private handleDataEntry(action: string): boolean | 'error' {
    const sp = this.state.scratchpad.trim();
    if (!sp) return false;

    const err = (): 'error' => {
      this.state.scratchpadError = 'INVALID ENTRY';
      return 'error';
    };
    const icaoErr = (r: { valid: boolean; error?: string }): 'error' => {
      this.state.scratchpadError = r.error ?? 'INVALID ENTRY';
      return 'error';
    };

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
        const origin = sp.toUpperCase();

        this.state.pendingRoute = { ...route, origin };
        this.state.pendingFlightPlan = { ...flightPlan, origin };

        // If no waypoints, initialize with origin-dest if possible
        if (flightPlan.waypoints.length === 0 && flightPlan.destination) {
          this.state.pendingFlightPlan.waypoints = [{ ident: flightPlan.destination, discontinuity: false }];
        }

        this.state.scratchpad = '';
        return true;
      }
      case 'set_dest': {
        const result = isValidICAO(sp.toUpperCase());
        if (!result.valid) return icaoErr(result);
        const route = this.state.pendingRoute ?? this.state.route;
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        const destination = sp.toUpperCase();

        this.state.pendingRoute = { ...route, destination };
        this.state.pendingFlightPlan = { ...flightPlan, destination };

        // If no waypoints, initialize with destination
        if (flightPlan.waypoints.length === 0) {
          this.state.pendingFlightPlan.waypoints = [{ ident: destination, discontinuity: false }];
        }

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
        const tokens = routeStr.trim().split(/\s+/);

        let detectedSid: string | null = null;
        let detectedStar: string | null = null;

        if (tokens.length >= 2) {
          if (isProcedure(tokens[1])) detectedSid = tokens[1];
          // Usually STAR is the 2nd to last token (before destination)
          if (tokens.length >= 3 && isProcedure(tokens[tokens.length - 2])) {
            detectedStar = tokens[tokens.length - 2];
          }
        }

        const route = this.state.pendingRoute ?? this.state.route;

        let hasMismatch = false;
        let updatedSid = route.sid;
        let updatedStar = route.star;

        if (detectedSid) {
          if (!route.sid) updatedSid = detectedSid;
          else if (route.sid !== detectedSid) {
            hasMismatch = true;
            this.state.scratchpadError = 'ROUTE/SID MISMATCH';
          }
        }

        if (detectedStar) {
          if (!route.star) updatedStar = detectedStar;
          else if (route.star !== detectedStar) {
            hasMismatch = true;
            if (!this.state.scratchpadError) this.state.scratchpadError = 'ROUTE/STAR MISMATCH';
          }
        }

        if (hasMismatch) {
          // If mismatch, we do NOT execute the route setting. Let user clear error.
          return 'error';
        }

        const parsed = parseRouteString(routeStr);
        const flightPlan = this.state.pendingFlightPlan ?? this.state.flightPlan;
        const waypoints =
          parsed.waypoints.length > 0
            ? parsed.waypoints
            : [
                { ident: parsed.origin, discontinuity: false },
                { ident: parsed.destination, discontinuity: false },
              ].filter((w) => w.ident);

        this.state.pendingRoute = { ...route, routeString: routeStr, sid: updatedSid, star: updatedStar };
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
        this.state.takeoff =
          runwayChanged && speedsEntered
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
        if (!vsResult.valid) {
          this.state.scratchpadError = vsResult.error ?? 'INVALID V-SPEEDS';
          return 'error';
        }
        this.state.takeoff = newTakeoff;
        this.state.scratchpad = '';
        return true;
      }
      case 'set_vr': {
        const result = isValidSpeed(sp);
        if (!result.valid) return icaoErr(result);
        const newTakeoff = { ...this.state.takeoff, vr: parseInt(sp) || 0 };
        const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
        if (!vsResult.valid) {
          this.state.scratchpadError = vsResult.error ?? 'INVALID V-SPEEDS';
          return 'error';
        }
        this.state.takeoff = newTakeoff;
        this.state.scratchpad = '';
        return true;
      }
      case 'set_v2': {
        const result = isValidSpeed(sp);
        if (!result.valid) return icaoErr(result);
        const newTakeoff = { ...this.state.takeoff, v2: parseInt(sp) || 0 };
        const vsResult = isValidVSpeeds(newTakeoff.v1, newTakeoff.vr, newTakeoff.v2);
        if (!vsResult.valid) {
          this.state.scratchpadError = vsResult.error ?? 'INVALID V-SPEEDS';
          return 'error';
        }
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
      case 'set_clb_wind':
      case 'set_crz_wind':
      case 'set_des_wind':
      case 'set_wind': {
        const result = isValidWind(sp);
        if (!result.valid) return icaoErr(result);
        const parts = sp.split('/');
        if (parts.length === 2) {
          const wDir = parseInt(parts[0]) || 0;
          const wSpd = parseInt(parts[1]) || 0;
          if (action === 'set_wind') {
            this.state.takeoff = { ...this.state.takeoff, windDir: wDir, windSpeed: wSpd };
          } else if (action === 'set_clb_wind') {
            this.state.performance = { ...this.state.performance, clbWindDir: wDir, clbWindSpeed: wSpd };
          } else if (action === 'set_crz_wind') {
            this.state.performance = { ...this.state.performance, crzWindDir: wDir, crzWindSpeed: wSpd };
          } else if (action === 'set_des_wind') {
            this.state.performance = { ...this.state.performance, desWindDir: wDir, desWindSpeed: wSpd };
          }
        }
        this.state.scratchpad = '';
        return true;
      }
      case 'set_isa_dev': {
        const result = isValidTemperature(sp);
        if (!result.valid) return icaoErr(result);
        this.state.performance = { ...this.state.performance, isaDev: parseInt(sp) || 0 };
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
        if (isNaN(radial) || radial < 1 || radial > 360 || isNaN(distance) || distance < 0 || distance > 999)
          return err();
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
      case 'set_vor1': {
        const v1 = isValidFrequency(sp);
        if (!v1.valid) return icaoErr(v1);
        this.state.radios.vor1 = parseFloat(sp).toFixed(2);
        this.state.scratchpad = '';
        return true;
      }
      case 'set_vor2': {
        const v2 = isValidFrequency(sp);
        if (!v2.valid) return icaoErr(v2);
        this.state.radios.vor2 = parseFloat(sp).toFixed(2);
        this.state.scratchpad = '';
        return true;
      }
      case 'set_adf1': {
        const a1 = isValidADF(sp);
        if (!a1.valid) return icaoErr(a1);
        this.state.radios.adf1 = sp;
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
      case 'arr_page': {
        this.state.depArrSubPage = 'ARR';
        return true;
      }
      case 'dep_page': {
        this.state.depArrSubPage = 'DEP';
        return true;
      }
    }

    return false;
  }

  // ---- Tutorial Methods ----

  startTutorial(scenarioName: string): void {
    const scenario = getTutorialScenario(scenarioName);
    if (!scenario) return;

    this.state.tutorialActive = true;
    this.state.tutorialScenario = scenarioName;
    this.state.tutorialStepIndex = 0;
    this.state.tutorialErrors = 0;
    this.state.tutorialCompleted = false;
    this.state.tutorialStartTime = Date.now();
    this.state.tutorialHint = scenario.steps[0].instruction;
    this.state.tutorialHighlight = scenario.steps[0].highlightField || null;

    // Run setup if needed
    if (scenario.setup) {
      const resetFields = scenario.setup();
      // Logic to reset fields if needed (omitted for brevity, usually starts from default)
    }

    // Set page to step 0 page
    if (scenario.steps[0].page) {
      this.setPage(scenario.steps[0].page);
    }
  }

  advanceTutorial(): void {
    const scenario = getTutorialScenario(this.state.tutorialScenario || '');
    if (!scenario) return;

    this.state.tutorialStepIndex++;
    if (this.state.tutorialStepIndex >= scenario.steps.length) {
      this.state.tutorialCompleted = true;
      this.state.tutorialActive = false;
      this.state.tutorialHighlight = null;
      this.state.tutorialHint = 'Tutorial Complete!';
    } else {
      const step = scenario.steps[this.state.tutorialStepIndex];
      this.state.tutorialHint = step.instruction;
      this.state.tutorialHighlight = step.highlightField || null;
      if (step.page) {
        this.setPage(step.page);
      }
    }
  }

  recordTutorialError(): void {
    this.state.tutorialErrors++;
  }

  skipTutorialStep(): void {
    this.advanceTutorial();
  }

  getState(): FMCState {
    return structuredClone(this.state);
  }

  private checkTutorialProgression(key: string, action: string | null, sp: string): void {
    const scenario = getTutorialScenario(this.state.tutorialScenario || '');
    if (!scenario) return;

    const step = scenario.steps[this.state.tutorialStepIndex];
    if (!step) return;

    // Map keys for function key matching
    const keyMap: Record<string, string> = {
      INIT_REF: 'POS_INIT',
      RTE: 'RTE',
      DEP_ARR: 'DEP_ARR',
      LEGS: 'LEGS',
      PERF: 'PERF_INIT',
      PROG: 'PROGRESS',
      MENU: 'MENU',
      EXEC: 'EXEC',
      NEXT_PAGE: 'NEXT_PAGE',
      PREV_PAGE: 'PREV_PAGE',
      // Airbus keys
      INIT_A: 'INIT_A',
      INIT_B: 'INIT_B',
      F_PLN: 'F_PLN',
      PERF_TAKEOFF: 'PERF_TAKEOFF',
      PROG_A: 'PROG_A',
      DATA_INDEX: 'DATA_INDEX',
      DIR_INTC: 'DIR_INTC',
      MCDU_MENU: 'MCDU_MENU',
      RAD_NAV: 'RAD_NAV',
      FUEL_PRED: 'FUEL_PRED',
      SEC_FPLN: 'SEC_FPLN',
    };

    const mappedKey = keyMap[key] || key;

    // LSK Action check
    if (action) {
      const actionMatches = !step.expectedAction || action === step.expectedAction;
      const validatePasses = !step.validate || (step.validate as any)(sp, this.state);
      if (actionMatches && validatePasses) {
        this.advanceTutorial();
      } else {
        this.recordTutorialError();
      }
      return;
    }

    // Function key check
    if (mappedKey === step.expectedAction || key === step.expectedAction) {
      this.advanceTutorial();
      return;
    }

    // Alphanumeric keys: don't record errors while typing
    const isAlphaNumeric =
      /^[A-Z0-9]$/.test(key) || ['DOT', 'SLASH', 'PLUS_MINUS', 'SPACE', 'CLR', 'DEL'].includes(key);

    if (!isAlphaNumeric) {
      this.recordTutorialError();
    }
  }
}
