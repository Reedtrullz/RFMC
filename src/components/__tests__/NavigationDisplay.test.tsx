import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { NavigationDisplay } from '../ND/NavigationDisplay';
import { useFMCStore } from '../../store/useFMCStore';

describe('NavigationDisplay', () => {
  beforeEach(() => {
    useFMCStore.getState().resetState();
  });

  it('renders route labels, mode, range, and active overlays', () => {
    useFMCStore.setState({
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          {
            ident: 'RBV',
            discontinuity: false,
            speedConstraint: { type: 'AT', speed: 250 },
            altitudeConstraint: { type: 'AT_OR_ABOVE', altitude: 10000 },
          },
          { ident: 'DIXIE', discontinuity: false },
          { ident: 'KDCA', discontinuity: false },
        ],
      },
      route: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        companyRoute: '',
        routeString: '',
        approach: 'ILS19',
        runway: '19',
      },
      hold: { fix: 'RBV', inboundCourse: 270, legTime: 1.5, legDist: 0, direction: 'L' },
      fix: { refFix: 'DIXIE', radial: 180, distance: 20 },
      fixEntries: [
        { refFix: 'DIXIE', radial: 180, distance: 20 },
        { refFix: 'RBV', radial: 270, distance: 35 },
      ],
      aircraftState: {
        position: { lat: 40.0, lon: -74.0 }, // Near DIXIE/RBV
        heading: 0,
        track: 0,
        selectedHeading: 0,
      }
    });

    render(<NavigationDisplay />);

    expect(screen.getByTestId('navigation-display')).toBeInTheDocument();
    expect(screen.getByText(/BOEING/i)).toBeInTheDocument();
    expect(screen.getByText('ILS19 / RW19')).toBeInTheDocument();
    expect(screen.getAllByText('MAP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('40').length).toBeGreaterThan(0);
    expect(screen.getAllByText('RBV').length).toBeGreaterThan(0);
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('10000A')).toBeInTheDocument();
    expect(screen.getByTestId('nd-hold-overlay')).toBeInTheDocument();
    expect(screen.getAllByTestId('nd-fix-overlay')).toHaveLength(2);
  });

  it('switches display style for Airbus without changing route data', () => {
    useFMCStore.setState({
      aircraft: 'AIRBUS_A320',
      flightPlan: {
        origin: 'LFPG',
        destination: 'LEBL',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'DJL', lat: 48.6, lon: 2.6, discontinuity: false },
          { ident: 'LEBL', lat: 48.7, lon: 2.7, discontinuity: false },
        ],
      },
      aircraftState: {
        position: { lat: 48.5, lon: 2.5 },
        heading: 0,
        track: 0,
        selectedHeading: 0,
      }
    });

    render(<NavigationDisplay />);

    expect(screen.getByText(/AIRBUS/i)).toBeInTheDocument();
    expect(screen.getAllByText('LFPG').length).toBeGreaterThan(0);
    expect(screen.getAllByText('DJL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('LEBL').length).toBeGreaterThan(0);
  });

  it('shows DIR INTC selections in the ND header', () => {
    useFMCStore.setState({
      route: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        companyRoute: '',
        routeString: '',
        directTo: 'DIXIE',
      },
      flightPlan: {
        origin: 'KJFK',
        destination: 'KDCA',
        flightNumber: '',
        route: '',
        waypoints: [
          { ident: 'RBV', discontinuity: false },
          { ident: 'DIXIE', discontinuity: false },
        ],
      },
    });

    render(<NavigationDisplay />);

    expect(screen.getByText('DIR DIXIE')).toBeInTheDocument();
    expect(screen.getAllByText('DIXIE').length).toBeGreaterThan(0);
  });
});
