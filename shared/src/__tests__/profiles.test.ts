import { describe, expect, it } from 'vitest';
import { BOEING_737NG_AIRCRAFT_PROFILE, BOEING_737NG_DISPLAY_PROFILE } from '../avionics/profiles';

describe('avionics profiles', () => {
  it('defines the first production-fidelity slice as a non-certified Boeing trainer', () => {
    expect(BOEING_737NG_AIRCRAFT_PROFILE.aircraftType).toBe('BOEING_737');
    expect(BOEING_737NG_AIRCRAFT_PROFILE.certificationClaim).toBe('none');
    expect(BOEING_737NG_AIRCRAFT_PROFILE.limitations.join(' ')).toContain('not certified');
  });

  it('keeps CDU display geometry as a 24x14 measured profile contract', () => {
    expect(BOEING_737NG_DISPLAY_PROFILE.textGrid).toEqual({ cols: 24, rows: 14 });
    expect(BOEING_737NG_DISPLAY_PROFILE.shell.leftLskCenters).toHaveLength(6);
    expect(BOEING_737NG_DISPLAY_PROFILE.shell.rightLskCenters).toHaveLength(6);
    expect(BOEING_737NG_DISPLAY_PROFILE.inputs.minTouchTargetPx).toBeGreaterThanOrEqual(44);
  });

  it('contains day and night lighting modes for display review', () => {
    expect(BOEING_737NG_DISPLAY_PROFILE.lighting.day.displayBrightness).toBeGreaterThan(
      BOEING_737NG_DISPLAY_PROFILE.lighting.night.displayBrightness,
    );
    expect(BOEING_737NG_DISPLAY_PROFILE.lighting.night.reflectionOpacity).toBeLessThanOrEqual(0.02);
  });
});
