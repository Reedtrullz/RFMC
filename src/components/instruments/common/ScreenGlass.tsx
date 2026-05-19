import { type ReactNode } from 'react';
import { EffectProfiles, type ScreenEffectProfile } from './EffectProfiles';

interface ScreenGlassProps {
  children: ReactNode;
  variant?: 'boeing' | 'airbus' | 'airbus-crt' | 'nd' | 'pfd';
  brightness?: number;
  className?: string;
  effectProfile?: Partial<ScreenEffectProfile>;
}

export function ScreenGlass({
  children,
  variant = 'boeing',
  brightness = 100,
  className = '',
  effectProfile,
}: ScreenGlassProps) {
  const defaults: Record<string, ScreenEffectProfile> = {
    boeing: EffectProfiles.CRT,
    airbus: EffectProfiles.LCD,
    'airbus-crt': EffectProfiles.CRT,
    nd: EffectProfiles.BOEING_ND,
    pfd: EffectProfiles.AIRBUS_ND,
  };

  const profile = { ...defaults[variant], ...effectProfile };

  const style = {
    '--screen-brightness': `${brightness}%`,
    '--scanline-opacity': profile.scanlineOpacity,
    '--reflection-opacity': profile.reflectionOpacity,
    '--vignette-opacity': profile.vignetteOpacity,
    '--grain-opacity': profile.grainOpacity,
    '--smudge-opacity': profile.smudgeOpacity,
    '--phosphor-glow': profile.phosphorGlow,
    '--lcd-bloom': profile.lcdBloom,
  } as React.CSSProperties;

  return (
    <div className={`screen-glass screen-glass--${variant} ${className}`} style={style}>
      <div className="instrument-shell__inner-bevel" />
      <div className="screen-glass__content">{children}</div>
      <div className="screen-glass__scanlines" />
      <div className="screen-glass__reflection" />
      <div className="screen-glass__vignette" />
      <div className="screen-glass__grain" />
      <div className="screen-glass__smudges" />
      <div className="screen-glass__glow" />
    </div>
  );
}
