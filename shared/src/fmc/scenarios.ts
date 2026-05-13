import { TrainingScenario } from '../types/scenarios';

export const SCENARIOS: Record<string, TrainingScenario> = {
  RNP_DOWNGRADE: {
    id: 'rnp-downgrade',
    name: 'RNP Accuracy Downgrade',
    description: 'During the approach to KSEA, GPS accuracy will degrade, forcing a transition to IRS/Radio navigation and an eventual UNABLE RNP alert.',
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
        action: { type: 'SET_FAILURE', payload: { sensor: 'GPS' } }
      },
      {
        id: 'msg-gps',
        type: 'MESSAGE',
        trigger: { type: 'TIME', value: 12 },
        action: { type: 'ADD_MESSAGE', payload: 'GPS PRIMARY LOST' }
      }
    ]
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
        action: { type: 'CHANGE_PHASE', payload: 'CLIMB' }
      }
    ]
  }
};
