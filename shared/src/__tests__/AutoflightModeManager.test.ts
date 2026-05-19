import { describe, expect, it } from 'vitest';
import { AutoflightModeManager } from '../autopilot/AutoflightModeManager';
import { calculateAltStarCaptureVs } from '../autopilot/boeingMcpLogic';
import type { FMCState } from '../types/fmc';

describe('AutoflightModeManager', () => {
  it('calculates the ALT* exponential vertical speed correctly', () => {
    const vs1 = calculateAltStarCaptureVs(2000, 200, 0.005);
    expect(vs1).toBeGreaterThan(0);
    expect(vs1).toBeLessThan(2000);

    const vsZero = calculateAltStarCaptureVs(2000, 10, 0.005);
    expect(vsZero).toBe(0);
  });

  it('calculates alt star capture VS correctly using the static method', () => {
    const vs = AutoflightModeManager.calculateAltStarCaptureVs(1500, 100, 0.005);
    expect(vs).toBeGreaterThan(0);
    expect(vs).toBeLessThan(1500);
  });

  it('prevents LNAV engagement and returns "NAV DATA OUT" when there are unresolved legs', () => {
    const mockState = {
      aircraft: 'BOEING_737',
      flightPlan: {
        waypoints: [
          { ident: 'KSEA', lat: 47.4489, lon: -122.3093, discontinuity: false },
          { ident: 'UNRESOLVED_FIX', coordinateSource: 'UNRESOLVED', discontinuity: false },
        ],
      },
      position: { irsState: 'NAV' },
    } as unknown as FMCState;

    const result = AutoflightModeManager.canEngageLateral('LNAV', mockState);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('NAV DATA OUT');
  });
});
