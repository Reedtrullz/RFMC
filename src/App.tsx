import React, { useState, useEffect } from 'react';
import { CDU } from './components/CDU/CDU';
import { ConnectionStatus } from './components/ConnectionStatus';
import { TutorialOverlay } from './components/TutorialOverlay';
import { DemoWelcome } from './components/DemoWelcome';
import { NavigationDisplay } from './components/ND/NavigationDisplay';
import { useKioskMode } from './hooks/useKioskMode';
import { useFMCStore } from './store/useFMCStore';
import { TrainingReport } from './components/Training/TrainingReport';

const AutopilotTrainer = React.lazy(() =>
  import('./components/Autopilot/AutopilotTrainer').then((m) => ({ default: m.AutopilotTrainer })),
);
const FmsInspector = React.lazy(() =>
  import('./components/Training/FmsInspector').then((m) => ({ default: m.FmsInspector })),
);
const TrainingOverlay = React.lazy(() =>
  import('./components/Training/TrainingOverlay').then((m) => ({ default: m.TrainingOverlay })),
);
import { devLog } from '@shared';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { PrimaryFlightDisplay } from './components/instruments/common/PFD';
import { CockpitLayout } from './components/CockpitMode/CockpitLayout';
import { SettingsPanel, ChecklistPanel } from './components/CockpitMode/CockpitPanels';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PerformanceOverlay } from './components/CockpitMode/PerformanceOverlay';
import { OrientationPrompt } from './components/CockpitMode/OrientationPrompt';
import { InstrumentSlot } from './components/layout/InstrumentSlot';
import { EICASPanel } from './components/CockpitMode/EICASPanel';
import { useCockpitLayoutStore } from './store/cockpitLayoutStore';
import { useAircraftStore } from './store/aircraftStore';
import { useAutopilotStore } from './store/autopilotStore';
import { useAuralAlerts } from './hooks/useAuralAlerts';
import { PwaUpdatePrompt } from './components/PWA/PwaUpdatePrompt';

const visualAircraftState = {
  lat: 59.91,
  lon: 10.75,
  altitude: 6240,
  altitudeFt: 6240,
  indicatedAirspeedKt: 238,
  ias: 238,
  tas: 246,
  groundSpeedKt: 252,
  gs: 252,
  heading: 284,
  headingDeg: 284,
  track: 281,
  trackDeg: 281,
  verticalSpeedFpm: 720,
  vs: 720,
  pitchDeg: 4,
  bankDeg: -14,
  fuelTotal: 8200,
  gw: 62800,
  accelerationKtS: 0.35,
};

const visualApproachAircraftState = {
  ...visualAircraftState,
  altitude: 2140,
  altitudeFt: 2140,
  indicatedAirspeedKt: 142,
  ias: 142,
  tas: 146,
  groundSpeedKt: 151,
  gs: 151,
  heading: 273,
  headingDeg: 273,
  track: 272,
  trackDeg: 272,
  verticalSpeedFpm: -650,
  vs: -650,
  pitchDeg: -2,
  bankDeg: 3,
  accelerationKtS: -0.08,
};

const visualFailureAircraftState = {
  ...visualAircraftState,
  altitude: 0,
  altitudeFt: 0,
  indicatedAirspeedKt: 0,
  ias: 0,
  tas: 0,
  groundSpeedKt: 0,
  gs: 0,
  heading: 0,
  headingDeg: 0,
  track: 0,
  trackDeg: 0,
  verticalSpeedFpm: 0,
  vs: 0,
  pitchDeg: 0,
  bankDeg: 0,
  accelerationKtS: 0,
};

export default function App() {
  const isKiosk = useKioskMode();
  const [showNd, setShowNd] = useState(true);
  const mode = useFMCStore((s) => s.mode);
  const tutorialActive = useFMCStore((s) => s.tutorialActive);
  const tutorialCompleted = useFMCStore((s) => s.tutorialCompleted);
  const aircraft = useAircraftStore((s) => s.aircraft);
  const setAircraft = useAircraftStore((s) => s.setAircraft);
  const setPage = useFMCStore((s) => s.setPage);
  const setRteSubPage = useFMCStore((s) => s.setRteSubPage);
  const setTakeoffRefPageIndex = useFMCStore((s) => s.setTakeoffRefPageIndex);
  const setNDMode = useFMCStore((s) => s.setNDMode);

  const cockpitMode = useCockpitLayoutStore((s) => s.cockpitMode);
  const setCockpitMode = useCockpitLayoutStore((s) => s.setCockpitMode);

  const tick = useFMCStore((s) => s.tick);

  useEffect(() => {
    let lastTime = performance.now();
    let frameId: number;

    const runTick = (time: number) => {
      const dt = (time - lastTime) / 1000;
      if (dt >= 0.1) {
        // 10Hz tick rate
        tick(dt);
        lastTime = time;
      }
      frameId = requestAnimationFrame(runTick);
    };

    frameId = requestAnimationFrame(runTick);
    return () => cancelAnimationFrame(frameId);
  }, [tick]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/visual/')) {
      useFMCStore.setState({ mode: 'ACTIVE' });
    }
    const setVisualPfdBase = (aircraftType: 'BOEING_737' | 'AIRBUS_A320') => {
      setCockpitMode(true);
      setAircraft(aircraftType);
      setShowNd(false);
      useFMCStore.setState({
        mode: 'ACTIVE',
        gpwsAlert: 'NONE',
        tcasAlert: false,
        position: {
          ...useFMCStore.getState().position,
          irsState: 'NAV',
          irsAlignmentProgress: 100,
          irsTimeRemaining: 0,
        },
      });
      useCockpitLayoutStore.setState({
        cockpitLayoutMode: 'automation',
        hiddenPanels: [],
        focusedPanel: null,
      });
      useAircraftStore.setState({ aircraftState: visualAircraftState });
    };

    const setBoeingPfdAutomation = () => {
      setVisualPfdBase('BOEING_737');
      useAutopilotStore.setState((state) => ({
        boeing: {
          ...state.boeing,
          speed: 240,
          heading: 290,
          altitude: 7000,
          verticalSpeed: 1000,
          fdLeft: true,
          autothrottleArm: true,
        },
        truth: {
          ...state.truth,
          thrustActive: 'SPEED',
          lateralActive: 'HDG_SEL',
          lateralArmed: 'LNAV',
          verticalActive: 'VS',
          verticalArmed: 'VNAV_PTH',
          autopilotStatus: 'CMD_A',
        },
      }));
    };

    const setAirbusPfdAutomation = () => {
      setVisualPfdBase('AIRBUS_A320');
      useAutopilotStore.setState((state) => ({
        airbus: {
          ...state.airbus,
          speed: 240,
          speedManaged: false,
          heading: 290,
          headingManaged: false,
          altitude: 7000,
          altitudeManaged: true,
          verticalSpeed: 1000,
          fd1: true,
          athr: true,
          ap1: true,
        },
        truth: {
          ...state.truth,
          thrustActive: 'THR_CLB',
          lateralActive: 'HDG_SEL',
          lateralArmed: 'NAV',
          verticalActive: 'OP_CLB',
          verticalArmed: 'VNAV_PTH',
          autopilotStatus: 'AP1',
        },
      }));
    };

    if (path === '/visual/boeing/pos-init') {
      setAircraft('BOEING_737');
      setPage('POS_INIT');
    } else if (path === '/visual/boeing/ident') {
      setAircraft('BOEING_737');
      setPage('IDENT');
    } else if (path === '/visual/boeing/rte-1') {
      setAircraft('BOEING_737');
      setPage('RTE');
      setRteSubPage(0);
    } else if (path === '/visual/boeing/rte-2') {
      setAircraft('BOEING_737');
      setPage('RTE');
      setRteSubPage(1);
    } else if (path === '/visual/boeing/legs') {
      setAircraft('BOEING_737');
      setPage('LEGS');
    } else if (path === '/visual/boeing/takeoff-ref') {
      setAircraft('BOEING_737');
      setPage('TAKEOFF_REF');
      setTakeoffRefPageIndex(0);
    } else if (path === '/visual/boeing/n1-limit') {
      setAircraft('BOEING_737');
      setPage('N1_LIMIT');
    } else if (path === '/visual/airbus/dir-intc') {
      setAircraft('AIRBUS_A320');
      setPage('DIR_INTC');
    } else if (path === '/visual/airbus/init-a') {
      setAircraft('AIRBUS_A320');
      setPage('INIT_A');
    } else if (path === '/visual/airbus/init-a-aligning') {
      setAircraft('AIRBUS_A320');
      setPage('INIT_A');
      useFMCStore.setState({
        position: { ...useFMCStore.getState().position, irsState: 'ALIGNING', irsTimeRemaining: 360 },
      });
    } else if (path === '/visual/airbus/f-pln') {
      setAircraft('AIRBUS_A320');
      setPage('F_PLN');
    } else if (path === '/visual/airbus/fuel-pred') {
      setAircraft('AIRBUS_A320');
      setPage('FUEL_PRED');
    } else if (path === '/visual/airbus/rad-nav') {
      setAircraft('AIRBUS_A320');
      setPage('RAD_NAV');
    } else if (path === '/visual/airbus/mcdu-menu') {
      setAircraft('AIRBUS_A320');
      setPage('MCDU_MENU');
    } else if (path === '/visual/airbus/perf-appr') {
      setAircraft('AIRBUS_A320');
      setPage('PERF_APPR');
    } else if (path === '/visual/nd/boeing-map') {
      setCockpitMode(false);
      setAircraft('BOEING_737');
      setNDMode('L', 'MAP');
      setShowNd(true);
    } else if (path === '/visual/nd/boeing-map-failure') {
      setCockpitMode(false);
      setAircraft('BOEING_737');
      setNDMode('L', 'MAP');
      setShowNd(true);
      useFMCStore.setState({ position: { ...useFMCStore.getState().position, irsState: 'OFF' } });
    } else if (path === '/visual/nd/airbus-arc') {
      setCockpitMode(false);
      setAircraft('AIRBUS_A320');
      setNDMode('L', 'ARC');
      setShowNd(true);
    } else if (path === '/visual/nd/airbus-arc-aligning') {
      setCockpitMode(false);
      setAircraft('AIRBUS_A320');
      setNDMode('L', 'ARC');
      setShowNd(true);
      useFMCStore.setState({ position: { ...useFMCStore.getState().position, irsState: 'ALIGNING' } });
    } else if (path === '/visual/pfd/boeing-automation') {
      setBoeingPfdAutomation();
    } else if (path === '/visual/pfd/boeing-focused') {
      setBoeingPfdAutomation();
      useCockpitLayoutStore.setState({
        focusedPanel: 'pfd',
        instrumentZoom: { ...useCockpitLayoutStore.getState().instrumentZoom, pfd: 1.45 },
      });
    } else if (path === '/visual/pfd/boeing-approach') {
      setVisualPfdBase('BOEING_737');
      useAircraftStore.setState({ aircraftState: visualApproachAircraftState });
      useCockpitLayoutStore.setState({ cockpitLayoutMode: 'approach', hiddenPanels: [], focusedPanel: null });
      useAutopilotStore.setState((state) => ({
        boeing: {
          ...state.boeing,
          speed: 142,
          heading: 273,
          altitude: 3000,
          verticalSpeed: -700,
          fdLeft: true,
          fdRight: true,
          autothrottleArm: true,
          courseL: 273,
          courseR: 273,
        },
        truth: {
          ...state.truth,
          thrustActive: 'SPEED',
          lateralActive: 'VOR_LOC',
          lateralArmed: 'APP',
          verticalActive: 'G_S',
          verticalArmed: 'G_S',
          autopilotStatus: 'CMD_A',
        },
      }));
    } else if (path === '/visual/pfd/boeing-failure') {
      setVisualPfdBase('BOEING_737');
      useFMCStore.setState({
        position: { ...useFMCStore.getState().position, irsState: 'OFF', irsAlignmentProgress: 0, irsTimeRemaining: 0 },
      });
      useAircraftStore.setState({ aircraftState: visualFailureAircraftState });
      useAutopilotStore.setState((state) => ({
        boeing: { ...state.boeing, speed: null, verticalSpeed: null, fdLeft: false, fdRight: false },
        truth: {
          ...state.truth,
          thrustActive: 'OFF',
          lateralActive: 'OFF',
          verticalActive: 'OFF',
          autopilotStatus: 'OFF',
        },
      }));
    } else if (path === '/visual/pfd/airbus-automation') {
      setAirbusPfdAutomation();
    } else if (path === '/visual/pfd/airbus-focused') {
      setAirbusPfdAutomation();
      useCockpitLayoutStore.setState({
        focusedPanel: 'pfd',
        instrumentZoom: { ...useCockpitLayoutStore.getState().instrumentZoom, pfd: 1.45 },
      });
    } else if (path === '/visual/pfd/airbus-approach') {
      setVisualPfdBase('AIRBUS_A320');
      useAircraftStore.setState({ aircraftState: visualApproachAircraftState });
      useCockpitLayoutStore.setState({ cockpitLayoutMode: 'approach', hiddenPanels: [], focusedPanel: null });
      useAutopilotStore.setState((state) => ({
        airbus: {
          ...state.airbus,
          speed: 142,
          speedManaged: false,
          heading: 273,
          headingManaged: false,
          altitude: 3000,
          altitudeManaged: false,
          verticalSpeed: -700,
          fd1: true,
          fd2: true,
          athr: true,
          ap1: true,
          loc: true,
          appr: true,
        },
        truth: {
          ...state.truth,
          thrustActive: 'SPEED',
          lateralActive: 'LOC',
          lateralArmed: 'NAV',
          verticalActive: 'G_S',
          verticalArmed: 'G_S',
          autopilotStatus: 'AP1',
        },
      }));
    } else if (path === '/visual/pfd/airbus-failure') {
      setVisualPfdBase('AIRBUS_A320');
      useFMCStore.setState({
        position: { ...useFMCStore.getState().position, irsState: 'OFF', irsAlignmentProgress: 0, irsTimeRemaining: 0 },
      });
      useAircraftStore.setState({ aircraftState: visualFailureAircraftState });
      useAutopilotStore.setState((state) => ({
        airbus: {
          ...state.airbus,
          speed: null,
          heading: null,
          verticalSpeed: null,
          fd1: false,
          fd2: false,
          athr: false,
          ap1: false,
          ap2: false,
        },
        truth: {
          ...state.truth,
          thrustActive: 'OFF',
          lateralActive: 'OFF',
          verticalActive: 'OFF',
          autopilotStatus: 'OFF',
        },
      }));
    } else if (path === '/visual/boeing/scratchpad-caution') {
      setAircraft('BOEING_737');
      setPage('LEGS');
      useFMCStore.setState({
        alerts: [
          {
            id: 'test-caution',
            text: 'UNABLE RNP',
            level: 'CAUTION',
            source: 'FMC',
            timestamp: Date.now(),
            clearable: true,
          },
        ],
      });
    }
  }, [setAircraft, setPage, setNDMode, setRteSubPage, setTakeoffRefPageIndex, setCockpitMode]);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // Setup interval to check for updates every hour
      if (r) {
        setInterval(
          () => {
            r.update();
          },
          60 * 60 * 1000,
        );
      }
    },
    onRegisterError(error: any) {
      devLog('SW registration error', error);
    },
  });

  const closePwaPrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const content = cockpitMode ? (
    <ErrorBoundary
      fallback={<SectionErrorFallback title="COCKPIT ERROR" message="Cockpit layout encountered an error" />}
    >
      <CockpitLayout />
      <SettingsPanel />
      <ChecklistPanel />
      <OrientationPrompt />
      <EICASPanel />
    </ErrorBoundary>
  ) : (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-black">
      <div className="flex w-full shrink-0 justify-center items-center py-3 px-4 bg-[#1a1c1c] border-b-4 border-[#2a2d2d] shadow-2xl">
        <div data-testid="autoflight-panel">
          <React.Suspense fallback={null}>
            <AutopilotTrainer />
          </React.Suspense>
        </div>
        <button
          type="button"
          aria-pressed={showNd}
          onClick={() => setShowNd((value) => !value)}
          className={`ml-4 px-3 py-2 rounded font-cdu text-xs font-bold uppercase transition-colors ${
            showNd
              ? 'bg-cdu-cyan/20 text-cdu-cyan border border-cdu-cyan/40'
              : 'bg-cdu-bezel-light border-cdu-bezel-light text-cdu-text/40 hover:text-cdu-text/60'
          }`}
        >
          {showNd ? 'Hide ND' : 'Show ND'}
        </button>
        <button
          onClick={() => setCockpitMode(true)}
          className="ml-3 px-4 py-2 bg-cdu-cyan text-cdu-bezel rounded font-cdu text-xs font-bold uppercase hover:bg-cdu-cyan/80 transition-colors"
        >
          Enter Cockpit
        </button>
      </div>

      <main className="grid flex-1 grid-cols-1 lg:grid-cols-2 overflow-hidden bg-black p-2 lg:p-4 gap-2 lg:gap-4">
        <div className="flex min-h-0 flex-col items-center justify-center gap-4 lg:flex-row">
          <ErrorBoundary
            fallback={<SectionErrorFallback title="PFD ERROR" message="Primary Flight Display encountered an error" />}
          >
            <InstrumentSlot className="h-full w-full max-w-[360px]" dataTestId="pfd-panel">
              <PrimaryFlightDisplay />
            </InstrumentSlot>
          </ErrorBoundary>

          <ErrorBoundary
            fallback={
              <SectionErrorFallback title="NAV DISPLAY ERROR" message="Navigation Display encountered an error" />
            }
          >
            <InstrumentSlot className={`${showNd ? '' : 'hidden'} h-full w-full max-w-[360px]`} dataTestId="nd-panel">
              <NavigationDisplay />
            </InstrumentSlot>
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallback={<SectionErrorFallback title="CDU ERROR" message="CDU display encountered an error" />}>
          <InstrumentSlot
            className="h-full w-full max-lg:col-span-2"
            contentClassName="normal-cdu-scale origin-top"
            dataTestId="cdu-panel"
          >
            <CDU />
          </InstrumentSlot>
        </ErrorBoundary>
      </main>
    </div>
  );

  const showWelcome = mode === 'STANDBY' && !tutorialActive && !tutorialCompleted;

  return (
    <ErrorBoundary>
      {content}
      {showWelcome && <DemoWelcome />}
      <ErrorBoundary
        fallback={<SectionErrorFallback title="TRAINING ERROR" message="Training overlay encountered an error" />}
      >
        <React.Suspense fallback={null}>
          {(tutorialActive || tutorialCompleted) && <TutorialOverlay />}
          <TrainingOverlay />
          <FmsInspector />
          <TrainingReport />
        </React.Suspense>
      </ErrorBoundary>
      {!isKiosk && <ConnectionStatus />}
      <PerformanceOverlay enabled={import.meta.env.DEV} />
      <AuralAlertsHandler />

      <PwaUpdatePrompt
        offlineReady={offlineReady}
        needRefresh={needRefresh}
        onClose={closePwaPrompt}
        onReload={() => updateServiceWorker(true)}
      />
    </ErrorBoundary>
  );
}

function AuralAlertsHandler() {
  useAuralAlerts();
  return null;
}

function SectionErrorFallback({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center bg-black p-8">
      <div className="text-center">
        <div className="mb-2 font-cdu text-lg font-bold text-cdu-red">{title}</div>
        <div className="font-cdu text-xs text-cdu-text/60">{message}</div>
      </div>
    </div>
  );
}
