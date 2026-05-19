export interface ScreenEffectProfile {
  scanlineOpacity: number;
  reflectionOpacity: number;
  vignetteOpacity: number;
  grainOpacity: number;
  smudgeOpacity: number;
  phosphorGlow: number;
  lcdBloom: number;
}

export const EffectProfiles = {
  CRT: {
    scanlineOpacity: 0.18,
    reflectionOpacity: 0.12,
    vignetteOpacity: 0.25,
    grainOpacity: 0.05,
    smudgeOpacity: 0.15,
    phosphorGlow: 0.75,
    lcdBloom: 0,
  } as ScreenEffectProfile,

  LCD: {
    scanlineOpacity: 0.04,
    reflectionOpacity: 0.08,
    vignetteOpacity: 0.1,
    grainOpacity: 0.02,
    smudgeOpacity: 0.1,
    phosphorGlow: 0.25,
    lcdBloom: 0.4,
  } as ScreenEffectProfile,

  BOEING_ND: {
    scanlineOpacity: 0.08,
    reflectionOpacity: 0.1,
    vignetteOpacity: 0.15,
    grainOpacity: 0.03,
    smudgeOpacity: 0.08,
    phosphorGlow: 0.4,
    lcdBloom: 0,
  } as ScreenEffectProfile,

  AIRBUS_ND: {
    scanlineOpacity: 0.02,
    reflectionOpacity: 0.05,
    vignetteOpacity: 0.05,
    grainOpacity: 0.01,
    smudgeOpacity: 0.05,
    phosphorGlow: 0.1,
    lcdBloom: 0.25,
  } as ScreenEffectProfile,
};
