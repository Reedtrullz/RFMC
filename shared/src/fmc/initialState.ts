import type { FMCState } from '../types/fmc';
import { createInitialScratchpadState } from './scratchpadEngine';

// ─────────────────────────────────────────────────────────────────────────────
// buildInitialFMCState
//
// Returns a fresh default FMCState. Used by fmcStore to seed Zustand state
// and by resetState() to restore defaults without a page reload.
// ─────────────────────────────────────────────────────────────────────────────

export function buildInitialFMCState(): FMCState {
  return {
    aircraft: 'BOEING_737',
    mode: 'ACTIVE',
    page: 'IDENT',
    currentPage: 'IDENT',
    pageHistory: [],
    scratchpad: '',
    scratchpadError: null,
    scratchpadState: createInitialScratchpadState(),
    demoMode: false,

    autopilot: {
      boeing: {
        courseL: 0,
        courseR: 0,
        speed: null,
        mach: null,
        heading: 0,
        altitude: 0,
        verticalSpeed: null,
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
        speed: null,
        speedManaged: false,
        heading: null,
        headingManaged: false,
        altitude: 0,
        altitudeManaged: false,
        verticalSpeed: null,
        fpa: null,
        fd1: false,
        fd2: false,
        athr: false,
        ap1: false,
        ap2: false,
        loc: false,
        appr: false,
        exped: false,
        hdgTrkMode: 'HDG_VS',
        metricAltitude: false,
        speedMachMode: 'SPD',
      },
      truth: {
        lateralActive: 'HDG_SEL',
        lateralArmed: undefined,
        verticalActive: 'VS',
        verticalArmed: undefined,
        thrustActive: 'N1',
        autopilotStatus: 'OFF',
        lastModeChangeTimestamps: {
          thrust: 0,
          lateral: 0,
          vertical: 0,
        },
      },
    },

    efisL: {
      mode: 'MAP',
      range: 40,
      overlays: {
        wpt: false,
        arpt: false,
        sta: false,
        data: false,
        pos: false,
        terr: false,
        wxr: false,
        tfc: false,
        cstr: false,
      },
      centered: false,
      side: 'L',
    },
    efisR: {
      mode: 'MAP',
      range: 40,
      overlays: {
        wpt: false,
        arpt: false,
        sta: false,
        data: false,
        pos: false,
        terr: false,
        wxr: false,
        tfc: false,
        cstr: false,
      },
      centered: false,
      side: 'R',
    },

    ident: {
      aircraftType: '737-800',
      engRating: 'CFM56-7B27',
      navDataVersion: '2501',
      opProgram: 'U10.8A',
    },

    position: {
      refAirport: '',
      gate: '',
      lat: 0,
      lon: 0,
      irsState: 'OFF',
      irsAlignmentProgress: 0,
      irsTimeRemaining: 0,
    },

    performance: {
      crzAlt: 0,
      costIndex: 0,
      zfw: 0,
      fuel: 0,
      cg: 0,
      reserve: 0,
      grossWeight: 0,
    },

    takeoff: {
      runway: '',
      toMode: '',
      assumedTemp: 0,
      v1: 0,
      vr: 0,
      v2: 0,
      trim: 0,
      oat: 0,
      windDir: 0,
      windSpeed: 0,
      qnh: 1013,
    },

    landing: {
      runway: '',
      flaps: '',
      vref: 0,
      ilsFrequency: '',
      course: 0,
    },

    route: {
      origin: null,
      destination: null,
      flightNumber: null,
    },

    flightPlan: {
      origin: '',
      destination: '',
      flightNumber: '',
      route: '',
      waypoints: [],
    },

    pendingRoute: null,
    pendingFlightPlan: null,
    isModified: false,
    execLit: false,
    msgLight: false,

    connectionStatus: 'DISCONNECTED',
    connectionMode: 'STANDALONE',
    connectedAircraft: null,
    connectedAircraftType: null,
    connectedCapabilities: null,
    lastError: null,
    simVariables: {},
    failureMessage: null,
    externalDisplayData: null,

    navPerformance: {
      anpNm: 0,
      anp: 0,
      rnpNm: 0.3,
      rnp: 0.3,
      rnpManual: false,
      activeSource: 'GPS',
      phase: 'TAKEOFF',
      xteNm: 0,
    },

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

    activeNavSource: 'GPS',
    sensors: [],
    alerts: [],

    signsOn: false,
    windowsLocked: false,

    hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' },
    holdPending: null,

    fix: { refFix: '', radial: 0, distance: 0 },
    fixEntries: [
      { refFix: '', radial: 0, distance: 0 },
      { refFix: '', radial: 0, distance: 0 },
    ],

    legsPageIndex: 0,
    legsPageCount: 1,
    depArrSubPage: 'DEP',
    rteSubPage: 0,
    posPageIndex: 0,
    takeoffRefPageIndex: 0,

    deleteMode: false,
    editWaypointIndex: null,
    aircraftState: null,

    brightness: 80,
    cockpitMode: false,
    latency: 0,
    sessionStartTime: null,
    radios: { vor1: '', vor2: '', adf1: '' },

    tutorialActive: false,
    tutorialCompleted: false,
    tutorialStepIndex: 0,
    selectedPlanWaypointIndex: null,
    tutorialScenario: null,
    tutorialStartTime: null,
    tutorialErrors: 0,
    tutorialHint: null,
    tutorialSkipAvailable: false,
    tutorialHighlight: null,
    tutorialConfidence: null,

    atsu: { messages: [], pendingUplink: null },

    flightPhase: 'PREFLIGHT',
    scratchpadMessages: [],

    cockpitLayoutMode: 'fmc-focus',
    hiddenPanels: [],
    pinnedPanels: [],
    focusedPanel: null,
    trafficTargets: [],
    selectedMessageId: null,
    gpwsAlert: '',
    tcasAlert: false,
  };
}
