import { TrainingScenario } from './trainingTypes';

export const airbusLessons: TrainingScenario[] = [
  {
    id: 'a320-fcu-basics',
    aircraft: 'AIRBUS_A320',
    title: 'Airbus A320 — FCU Basics',
    description: 'Learn the "Push/Pull" philosophy of the Airbus Flight Control Unit.',
    level: 1,
    category: 'autopilot',
    difficulty: 'basic',
    estimatedMinutes: 5,
    setup: {
      page: 'MCDU_MENU',
      autopilot: {
        airbus: {
          speedManaged: false,
          headingManaged: false,
          altitudeManaged: false
        }
      }
    },
    steps: [
      {
        id: 'managed-speed',
        instruction: 'Push the Speed knob to engage MANAGED speed mode.',
        objective: 'Let the FMGS control speed.',
        expectedAction: { type: 'set_mcp', field: 'speedManaged', value: true },
        hint: 'Click the top part of the speed knob (Push).',
        validation: 'fcu.speedManaged === true'
      },
      {
        id: 'verify-fma-speed',
        instruction: 'Verify "CLB" or "DES" appears in the first column of the FMA.',
        objective: 'Confirm managed speed guidance.',
        expectedAction: { type: 'verify_fma', mode: 'CLB' },
        validation: 'fma.column1 === "CLB"'
      },
      {
        id: 'selected-heading',
        instruction: 'Pull the Heading knob to engage SELECTED heading mode.',
        objective: 'Manually select a heading.',
        expectedAction: { type: 'set_mcp', field: 'headingManaged', value: false },
        hint: 'Click the bottom part of the heading knob (Pull).',
        validation: 'fcu.headingManaged === false'
      },
      {
        id: 'set-heading',
        instruction: 'Turn the Heading knob to 090.',
        objective: 'Set specific heading.',
        expectedAction: { type: 'set_mcp', field: 'heading', value: 90 },
        validation: 'fcu.heading === 90'
      },
      {
        id: 'verify-fma-hdg',
        instruction: 'Verify "HDG" appears in the second column of the FMA.',
        objective: 'Confirm heading mode.',
        expectedAction: { type: 'verify_fma', mode: 'HDG' },
        validation: 'fma.column2 === "HDG"'
      }
    ],
    passCriteria: {
      minScore: 80,
      maxMistakes: 2
    }
  },
  {
    id: 'a320-managed-climb',
    aircraft: 'AIRBUS_A320',
    title: 'Airbus A320 — Managed Climb',
    description: 'Use the FCU to initiate a managed climb to your target altitude.',
    level: 4,
    category: 'autopilot',
    difficulty: 'intermediate',
    estimatedMinutes: 6,
    setup: {
      page: 'F_PLN'
    },
    steps: [
      {
        id: 'set-alt',
        instruction: 'Set the FCU altitude to 5000 feet.',
        objective: 'Set clearance altitude.',
        expectedAction: { type: 'set_mcp', field: 'altitude', value: 5000 },
        validation: 'fcu.altitude === 5000'
      },
      {
        id: 'push-alt',
        instruction: 'Push the Altitude knob to engage MANAGED CLB.',
        objective: 'Engage managed vertical mode.',
        expectedAction: { type: 'set_mcp', field: 'altitudeManaged', value: true },
        hint: 'Click the top of the altitude knob.',
        validation: 'fcu.altitudeManaged === true'
      },
      {
        id: 'verify-fma-clb',
        instruction: 'Verify "CLB" appears in green on the FMA.',
        objective: 'Confirm climb mode.',
        expectedAction: { type: 'verify_fma', mode: 'CLB' },
        validation: 'fma.pitch === "CLB"'
      }
    ],
    passCriteria: {
      minScore: 85,
      maxMistakes: 1
    }
  }
];
