import { describe, expect, it } from 'vitest';
import { renderFplnGrid } from '../fmc/pages/airbus/fpln.grid';
import type { FMCState } from '../types/fmc';

function makeState(overrides: Partial<FMCState> = {}): FMCState {
  return {
    aircraft: 'AIRBUS_A320',
    mode: 'ACTIVE',
    page: 'F_PLN',
    currentPage: 'F_PLN',
    pageHistory: [],
    scratchpad: '',
    scratchpadError: null,
    demoMode: false,
    connectionStatus: 'DISCONNECTED',
    connectionMode: 'STANDALONE',
    execLit: false,
    msgLight: false,
    ident: {
      aircraftType: 'A320-214',
      engRating: 'CFM56-5B4',
      navDataVersion: 'FMC21A1',
      opProgram: '2247662-03',
    },
    position: {
      refAirport: '',
      gate: '',
      lat: 0,
      lon: 0,
      irsState: 'NAV',
      irsTimeRemaining: 0,
      irsAlignmentProgress: 100,
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
      toMode: 'TO',
      assumedTemp: 0,
      v1: 0,
      vr: 0,
      v2: 0,
      suggestedV1: 0,
      suggestedVr: 0,
      suggestedV2: 0,
      trim: 0,
      oat: 0,
      windDir: 0,
      windSpeed: 0,
      qnh: 0,
      flaps: '1',
      flexTemp: 0,
    },
    landing: {
      runway: '',
      flaps: '',
      vref: 0,
      ilsFrequency: '',
      course: 0,
    },
    route: {
      origin: 'KJFK',
      destination: 'KDCA',
      flightNumber: 'AA123',
      alternate: '',
      routeString: 'KJFK DCT RBV J42 LENDY8 KDCA',
    },
    flightPlan: {
      origin: 'KJFK',
      destination: 'KDCA',
      flightNumber: 'AA123',
      route: 'KJFK DCT RBV J42 LENDY8 KDCA',
      waypoints: [],
    },
    pendingRoute: null,
    pendingFlightPlan: null,
    isModified: false,
    legsPageIndex: 0,
    legsPageCount: 1,
    depArrSubPage: 'DEP',
    rteSubPage: 0,
    posPageIndex: 0,
    takeoffRefPageIndex: 0,
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
    airbusFmgc: {
      fm1Healthy: true,
      fm2Healthy: true,
      mode: 'DUAL',
      leftMcduSource: 'FMGC1',
      rightMcduSource: 'FMGC1',
    },
    autopilot: {
      boeing: {} as any,
      airbus: {
        speed: 250,
        speedManaged: false,
        heading: 0,
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
    navPerformance: {
      anpNm: 0.05,
      rnpNm: 2.0,
      anp: 0.05,
      rnp: 2.0,
      rnpManual: false,
      activeSource: 'GPS',
      phase: 'ENROUTE',
      xteNm: 0,
    },
    activeNavSource: 'GPS',
    sensors: [{ source: 'GPS', available: true, positionErrorNm: 0.05 }],
    alerts: [],
    signsOn: false,
    windowsLocked: false,
    hold: { fix: '', inboundCourse: 0, legTime: 1.0, legDist: 0, direction: 'R' },
    holdPending: null,
    fix: { refFix: '', radial: 0, distance: 0 },
    fixEntries: [],
    atsu: { messages: [], pendingUplink: null },
    flightPhase: 'PREFLIGHT',
    scratchpadMessages: [],
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
    efisL: {
      mode: 'MAP',
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
        cstr: false,
      },
    },
    efisR: {
      mode: 'MAP',
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
        cstr: false,
      },
    },
    brightness: 100,
    cockpitMode: false,
    cockpitLayoutMode: 'fmc-focus',
    hiddenPanels: [],
    pinnedPanels: [],
    focusedPanel: null,
    latency: 0,
    sessionStartTime: null,
    radios: { vor1: '113.90', vor2: '115.70', adf1: '342' },
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
    trafficTargets: [],
    selectedMessageId: null,
    gpwsAlert: 'NONE',
    tcasAlert: false,
    ...overrides,
  };
}

describe('renderFplnGrid', () => {
  it('renders title with origin/destination from route', () => {
    const state = makeState();
    const data = renderFplnGrid(state);

    const titleSegments = data.segments?.filter((s) => s.semantic === 'title');
    expect(titleSegments).toHaveLength(1);
    expect(titleSegments![0].text).toContain('F-PLN');
    expect(titleSegments![0].text).toContain('KJFK');
    expect(titleSegments![0].inverse).toBe(true);
  });

  it('shows page indicator', () => {
    const state = makeState();
    const data = renderFplnGrid(state);

    const pageIndicatorSegments = data.segments?.filter((s) => s.semantic === 'pageIndicator');
    expect(pageIndicatorSegments).toHaveLength(1);
    expect(pageIndicatorSegments![0].text).toMatch(/^\d+\/\d+$/);
  });

  it('shows TMPY F-PLN when isModified', () => {
    const state = makeState({ isModified: true });
    const data = renderFplnGrid(state);

    const titleSegments = data.segments?.filter((s) => s.semantic === 'title');
    expect(titleSegments![0].text).toContain('TMPY F-PLN');
  });

  it('renders SPD/ALT column header', () => {
    const state = makeState();
    const data = renderFplnGrid(state);

    const headerSegments = data.segments?.filter((s) => s.row === 1 && s.text === ' SPD/ALT');
    expect(headerSegments).toHaveLength(1);
    expect(headerSegments![0].color).toBe('white');
  });

  it('renders waypoints with ident in white and constraints in green', () => {
    const state = makeState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: [
          {
            ident: 'KJFK',
            discontinuity: false,
            altitudeConstraint: { type: 'AT' as const, altitude: 10000 },
            speedConstraint: { type: 'AT' as const, speed: 250 },
          },
          {
            ident: 'RBV',
            discontinuity: false,
            altitudeConstraint: { type: 'AT_OR_ABOVE' as const, altitude: 24000 },
            speedConstraint: { type: 'AT' as const, speed: 280 },
          },
        ],
      },
    });
    const data = renderFplnGrid(state);

    const kjfkSeg = data.segments?.find((s) => s.text === 'KJFK');
    expect(kjfkSeg).toBeDefined();
    expect(kjfkSeg!.color).toBe('white');

    const rbvSeg = data.segments?.find((s) => s.text === 'RBV');
    expect(rbvSeg).toBeDefined();
    expect(rbvSeg!.color).toBe('white');

    const constraintSegments = data.segments?.filter((s) => s.color === 'green' && s.row > 1);
    expect(constraintSegments!.length).toBeGreaterThan(0);
    constraintSegments!.forEach((seg) => {
      expect(seg.color).toBe('green');
    });
  });

  it('renders route discontinuity in amber', () => {
    const state = makeState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: [
          {
            ident: 'KJFK',
            discontinuity: false,
          },
          {
            ident: 'DISCONTINUITY',
            discontinuity: true,
          },
          {
            ident: 'KDCA',
            discontinuity: false,
          },
        ],
      },
    });
    const data = renderFplnGrid(state);

    const discoSegment = data.segments?.find((s) => s.text.includes('DISCONTINUITY'));
    expect(discoSegment).toBeDefined();
    expect(discoSegment!.color).toBe('amber');
    expect(discoSegment!.text).toBe('----- F-PLN DISCONTINUITY -----');
  });

  it('handles empty waypoint list', () => {
    const state = makeState();
    const data = renderFplnGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.segments!.length).toBeGreaterThan(0);
  });

  it('sets L1 action to fpln_dep_arr', () => {
    const state = makeState();
    const data = renderFplnGrid(state);

    expect(data.lskActions.L1).toBe('fpln_dep_arr');
  });

  it('maps L2-L6 to waypoint edit actions', () => {
    const state = makeState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: [
          { ident: 'KJFK', discontinuity: false },
          { ident: 'RBV', discontinuity: false },
          { ident: 'LENDY', discontinuity: false },
          { ident: 'KDCA', discontinuity: false },
        ],
      },
    });
    const data = renderFplnGrid(state);

    expect(data.lskActions.L2).toBe('edit_wp_0');
    expect(data.lskActions.L3).toBe('edit_wp_1');
    expect(data.lskActions.L4).toBe('edit_wp_2');
    expect(data.lskActions.L5).toBe('edit_wp_3');
  });

  it('shows delete_wp actions in delete mode', () => {
    const state = makeState({
      deleteMode: true,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: [
          { ident: 'KJFK', discontinuity: false },
          { ident: 'KDCA', discontinuity: false },
        ],
      },
    });
    const data = renderFplnGrid(state);

    expect(data.lskActions.L2).toBe('delete_wp_0');
    expect(data.lskActions.L3).toBe('delete_wp_1');
  });

  it('provides next_page and prev_page navigation', () => {
    const waypoints = Array.from({ length: 10 }, (_, i) => ({
      ident: `WPT${String(i + 1).padStart(2, '0')}`,
      discontinuity: false,
    }));

    const statePage0 = makeState({
      legsPageIndex: 0,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints,
      },
    });
    const dataPage0 = renderFplnGrid(statePage0);
    expect(dataPage0.lskActions.L6).toBe('next_page');
    expect(dataPage0.lskActions.R6).not.toBe('prev_page');

    // Page 0 is the first of 2 pages (10 waypoints / 5 per LSK page = 2 pages)
    const statePage0_2 = makeState({
      legsPageIndex: 0,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: waypoints.slice(0, 8), // 8 waypoints → 2 pages (5+3)
      },
    });
    const dataPage0_2 = renderFplnGrid(statePage0_2);
    expect(dataPage0_2.lskActions.L6).toBe('next_page');

    // Page 1 is the last page → no next_page, only prev_page
    const statePage1 = makeState({
      legsPageIndex: 1,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: waypoints.slice(0, 8),
      },
    });
    const dataPage1 = renderFplnGrid(statePage1);
    expect(dataPage1.lskActions.L6).not.toBe('next_page');
    expect(dataPage1.lskActions.R6).toBe('prev_page');

    const stateLast = makeState({
      legsPageIndex: 1,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: waypoints.slice(0, 8),
      },
    });
    const dataLast = renderFplnGrid(stateLast);
    // L6 stays as edit_wp_4 (waypoint mapping takes priority, no next_page overwrite)
    expect(dataLast.lskActions.L6).toBe('edit_wp_4');
    expect(dataLast.lskActions.R6).toBe('prev_page');
  });

  it('shows erase on R6 when isModified', () => {
    const state = makeState({
      isModified: true,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints: [],
      },
    });
    const data = renderFplnGrid(state);

    expect(data.lskActions.R6).toBe('erase');
  });

  it('updates page indicator for multi-page flight plans', () => {
    const waypoints = Array.from({ length: 7 }, (_, i) => ({
      ident: `WPT${String(i + 1).padStart(2, '0')}`,
      discontinuity: false,
    }));

    const state = makeState({
      legsPageIndex: 1,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints,
      },
    });
    const data = renderFplnGrid(state);

    const pageIndicator = data.segments?.find((s) => s.semantic === 'pageIndicator');
    expect(pageIndicator!.text).toBe('2/2');
  });

  it('shows only 4 waypoints per page visually', () => {
    const waypoints = Array.from({ length: 6 }, (_, i) => ({
      ident: `WPT${String(i + 1).padStart(2, '0')}`,
      discontinuity: false,
    }));

    const state = makeState({
      legsPageIndex: 0,
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: 'AA123',
        route: '',
        waypoints,
      },
    });
    const data = renderFplnGrid(state);

    const wptSegments = data.segments?.filter((s) => s.text.startsWith('WPT') && s.color === 'white');
    expect(wptSegments).toHaveLength(4);
    expect(wptSegments![0].text).toBe('WPT01');
    expect(wptSegments![3].text).toBe('WPT04');
  });

  it('returns airbusPage with segments and lskActions', () => {
    const state = makeState();
    const data = renderFplnGrid(state);

    expect(data.segments).toBeDefined();
    expect(data.lskActions).toBeDefined();
    expect(data.lines).toEqual([]);
    expect(data.title).toBe('');
  });
});
