import { TrainingScenario } from '../types/scenarios';

export const SCENARIOS: Record<string, TrainingScenario> = {
  RNP_DOWNGRADE: {
    id: 'rnp-downgrade',
    name: 'RNP Accuracy Downgrade',
    description:
      'During the approach to KSEA, GPS accuracy will degrade, forcing a transition to IRS/Radio navigation and an eventual UNABLE RNP alert.',
    initialState: {
      phase: 'APPROACH',
      origin: 'KPDX',
      destination: 'KSEA',
    },
    goals: [
      { id: 'g1', text: 'Maintain track despite GPS loss', completed: false },
      { id: 'g2', text: 'Verify ANP vs RNP on ND', completed: false },
    ],
    events: [
      {
        id: 'gps-fail',
        type: 'FAILURE',
        trigger: { type: 'TIME', value: 10 },
        action: { type: 'SET_FAILURE', payload: { sensor: 'GPS' } },
      },
      {
        id: 'msg-gps',
        type: 'MESSAGE',
        trigger: { type: 'TIME', value: 12 },
        action: { type: 'ADD_MESSAGE', payload: 'GPS PRIMARY LOST' },
      },
    ],
  },
  VNAV_T_D_PRACTICE: {
    id: 'vnav-td',
    name: 'VNAV Descent Planning',
    description: 'Practice monitoring the Top of Descent (T/D) and V-Path deviation during a descent into KSEA.',
    initialState: {
      phase: 'CRUISE',
      origin: 'KSEA',
      destination: 'KPDX',
    },
    goals: [
      { id: 'g1', text: 'Arrive at T/D in VNAV PATH mode', completed: false },
      { id: 'g2', text: 'Maintain vertical deviation < 50ft', completed: false },
    ],
    events: [
      {
        id: 'phase-climb',
        type: 'PHASE_CHANGE',
        trigger: { type: 'TIME', value: 5 },
        action: { type: 'CHANGE_PHASE', payload: 'CLIMB' },
      },
    ],
  },
  REROUTE_WEATHER: {
    id: 'reroute-weather',
    name: 'Reroute Due to Weather',
    description:
      'A line of thunderstorms has developed on your route. Dispatch (AOC) will send a reroute via ACARS which you must review and accept.',
    initialState: {
      phase: 'CRUISE',
      origin: 'KSEA',
      destination: 'KSFO',
    },
    goals: [
      { id: 'g1', text: 'Read ACARS weather alert', completed: false },
      { id: 'g2', text: 'Review and ACCEPT AOC Uplink', completed: false },
    ],
    events: [
      {
        id: 'wx-msg',
        type: 'MESSAGE',
        trigger: { type: 'TIME', value: 5 },
        action: {
          type: 'SEND_ACARS',
          payload: { from: 'DISPATCH', text: 'SIGMET 42: SEVERE TS ON ROUTE. REROUTE UPLINKED.', type: 'WEATHER' },
        },
      },
      {
        id: 'route-uplink',
        type: 'FAILURE', // Reusing FAILURE type as catch-all or we can add UPLINK
        trigger: { type: 'TIME', value: 8 },
        action: {
          type: 'UPLINK_ROUTE',
          payload: {
            waypoints: [
              { ident: 'ELMAA', lat: 47.0, lon: -123.5 },
              { ident: 'OED', lat: 42.4, lon: -122.9 },
            ],
          },
        },
      },
    ],
  },
};
