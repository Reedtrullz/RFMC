import { describe, expect, it } from 'vitest';
import { calculateTutorialGrade, preflightScenario, isStepComplete } from '../fmc/tutorialEngine';
import { airbusTutorialScenarios } from '../fmc/tutorials/airbus-tutorials';
import type { FMCState } from '../types/fmc';

describe('tutorialEngine', () => {
  it('calculates an A grade for perfect performance', () => {
    const result = calculateTutorialGrade(0, 300, 600); // 0 errors, 5 mins vs 10 mins target
    expect(result.grade).toBe('A');
    expect(result.score).toBeGreaterThanOrEqual(95);
  });

  it('calculates a B grade for some errors', () => {
    const result = calculateTutorialGrade(2, 400, 600);
    expect(result.grade).toBe('B');
  });

  it('calculates a C grade for significant errors', () => {
    const result = calculateTutorialGrade(5, 500, 600);
    expect(result.grade).toBe('C');
  });

  it('calculates a D grade for poor performance', () => {
    const result = calculateTutorialGrade(10, 800, 600);
    expect(result.grade).toBe('D');
  });

  it('identifies completed steps correctly', () => {
    const state: Partial<FMCState> = {
      currentPage: 'POS_INIT',
      scratchpad: 'KJFK',
    };
    const step = preflightScenario.steps[1]; // KJFK entry on POS_INIT
    expect(isStepComplete(step as any, state as FMCState)).toBe(true);
  });

  it('provides the correct scenarios for Boeing and Airbus', () => {
    expect(preflightScenario.name).toContain('Full Preflight');
    expect(airbusTutorialScenarios[0].name).toContain('Basics');
    expect(airbusTutorialScenarios[1].name).toContain('Preflight');
  });
});
