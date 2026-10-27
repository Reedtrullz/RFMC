import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AircraftState, AircraftType } from '@shared';
import { AirbusPFD } from '../airbus/AirbusPFD';
import { BoeingPFD } from '../boeing/BoeingPFD';
import { useAircraftStore } from '../../../store/aircraftStore';
import { useAutopilotStore } from '../../../store/autopilotStore';
import { useFMCStore } from '../../../store/useFMCStore';

const originalFmcState = useFMCStore.getState();
const originalAutopilotState = useAutopilotStore.getState();
const originalAircraftState = useAircraftStore.getState();
const originalStoredAircraft = localStorage.getItem('cdu-aircraft-type');

const telemetry: AircraftState = {
  lat: 59.9,
  lon: 10.7,
  headingDeg: 30,
  trackDeg: 30,
  altitudeFt: 10000,
  indicatedAirspeedKt: 250,
  verticalSpeedFpm: 0,
  pitchDeg: 0,
  bankDeg: 0,
  altitude: 10000,
  heading: 30,
  ias: 250,
  tas: 250,
  vs: 0,
  gs: 250,
  track: 30,
  fuelTotal: 9000,
  gw: 60000,
  accelerationKtS: 0,
};

const instruments = {
  AIRBUS_A320: { component: AirbusPFD, testId: 'airbus-pfd', heading: 270 },
  BOEING_737: { component: BoeingPFD, testId: 'boeing-pfd', heading: 360 },
} as const;

function assertPfd(aircraft: AircraftType) {
  const { testId, heading } = instruments[aircraft];
  const otherHeading = instruments[aircraft === 'AIRBUS_A320' ? 'BOEING_737' : 'AIRBUS_A320'].heading;

  expect(screen.getByTestId(testId)).toBeInTheDocument();
  expect(screen.getByText(`HDG SEL ${heading}`)).toBeInTheDocument();
  expect(screen.queryByText(`HDG SEL ${otherHeading}`)).not.toBeInTheDocument();
}

describe('PFD aircraft identity', () => {
  beforeEach(() => {
    useFMCStore.getState().resetState();
    useAutopilotStore.setState({
      boeing: { ...originalAutopilotState.boeing, speed: 300, heading: 360, altitude: 12000, verticalSpeed: -800 },
      airbus: {
        ...originalAutopilotState.airbus,
        speed: 210,
        speedManaged: false,
        heading: 270,
        headingManaged: false,
        altitude: 7000,
        verticalSpeed: 1200,
      },
      truth: { ...originalAutopilotState.truth },
    });
    useAircraftStore.setState({ aircraft: 'AIRBUS_A320', aircraftState: telemetry });
  });

  afterEach(() => {
    cleanup();
    useAircraftStore.setState(originalAircraftState, true);
    useAutopilotStore.setState(originalAutopilotState, true);
    useFMCStore.setState(originalFmcState, true);
    if (originalStoredAircraft === null) localStorage.removeItem('cdu-aircraft-type');
    else localStorage.setItem('cdu-aircraft-type', originalStoredAircraft);
  });

  it('renders the Airbus PFD and target when the FMC aircraft matches', () => {
    useFMCStore.getState().setAircraft('AIRBUS_A320');
    render(<AirbusPFD />);

    act(() => useFMCStore.getState().setConnectedAircraft('BOEING_737', [], 'BOEING_737'));

    assertPfd('AIRBUS_A320');
  });

  it('renders the Boeing PFD and target when the FMC aircraft matches', () => {
    useFMCStore.getState().setAircraft('BOEING_737');
    render(<BoeingPFD />);

    act(() => useFMCStore.getState().setConnectedAircraft('AIRBUS_A320', [], 'AIRBUS_A320'));

    assertPfd('BOEING_737');
  });

  it('keeps the mounted Airbus PFD identity when the real FMC aircraft action selects Boeing', () => {
    useFMCStore.getState().setAircraft('AIRBUS_A320');
    render(<AirbusPFD />);

    act(() => useFMCStore.getState().setAircraft('BOEING_737'));

    assertPfd('AIRBUS_A320');
  });

  it('keeps the mounted Boeing PFD identity when the real FMC aircraft action selects Airbus', () => {
    useFMCStore.getState().setAircraft('BOEING_737');
    render(<BoeingPFD />);

    act(() => useFMCStore.getState().setAircraft('AIRBUS_A320'));

    assertPfd('BOEING_737');
  });
});
