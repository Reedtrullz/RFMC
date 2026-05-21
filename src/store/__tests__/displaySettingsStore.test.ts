import { describe, it, expect, beforeEach } from 'vitest';
import { useDisplaySettings } from '../displaySettingsStore';

describe('displaySettingsStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useDisplaySettings.getState().resetRealism();
  });

  it('should have correct default values', () => {
    const state = useDisplaySettings.getState();
    expect(state.crtIntensity).toBe(65);
    expect(state.wearIntensity).toBe(35);
    expect(state.bloomIntensity).toBe(40);
    expect(state.scanlineIntensity).toBe(25);
  });

  it('should clamp intensity values between 0 and 100', () => {
    const { setBloomIntensity, setWearIntensity } = useDisplaySettings.getState();

    setBloomIntensity(150);
    expect(useDisplaySettings.getState().bloomIntensity).toBe(100);

    setWearIntensity(-20);
    expect(useDisplaySettings.getState().wearIntensity).toBe(0);
  });

  it('should reset all realism values', () => {
    const { setCrtIntensity, setWearIntensity, resetRealism } = useDisplaySettings.getState();

    setCrtIntensity(90);
    setWearIntensity(80);
    resetRealism();

    const state = useDisplaySettings.getState();
    expect(state.crtIntensity).toBe(65);
    expect(state.wearIntensity).toBe(35);
    expect(state.bloomIntensity).toBe(40);
    expect(state.scanlineIntensity).toBe(25);
  });
});
