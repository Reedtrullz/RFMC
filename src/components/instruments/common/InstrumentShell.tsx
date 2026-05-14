import type { ReactNode } from 'react';
import { BOEING_CDU_GEOMETRY, AIRBUS_MCDU_GEOMETRY, type InstrumentGeometryProfile } from './GeometryProfiles';
import { BezelScrew } from './BezelScrew';

export type InstrumentShellVariant =
  | 'boeing-cdu'
  | 'airbus-mcdu'
  | 'boeing-nd'
  | 'airbus-nd'
  | 'boeing-mcp'
  | 'airbus-fcu';

interface InstrumentShellProps {
  variant: InstrumentShellVariant;
  children: ReactNode;
  className?: string;
  id?: string;
  'data-testid'?: string;
  geometryProfile?: Partial<InstrumentGeometryProfile>;
}

export function InstrumentShell({ 
  variant, 
  children, 
  className = '', 
  id,
  'data-testid': dataTestId,
  geometryProfile
}: InstrumentShellProps) {
  const defaults: Partial<Record<InstrumentShellVariant, InstrumentGeometryProfile>> = {
    'boeing-cdu': BOEING_CDU_GEOMETRY,
    'airbus-mcdu': AIRBUS_MCDU_GEOMETRY,
  };

  const profile = { ...defaults[variant], ...geometryProfile };

  const style = {
    '--shell-width-mm': profile?.outerWidthMm ? `${profile.outerWidthMm}mm` : undefined,
    '--shell-height-mm': profile?.outerHeightMm ? `${profile.outerHeightMm}mm` : undefined,
    '--bezel-radius-mm': profile?.bezelRadiusMm ? `${profile.bezelRadiusMm}mm` : undefined,
  } as React.CSSProperties;

  return (
    <div 
      id={id}
      data-testid={dataTestId}
      className={`instrument-shell instrument-shell--${variant} ${className}`}
      style={style}
    >
      <div className="instrument-shell__edge-highlight" />
      <div className="instrument-shell__wear" />
      
      {profile?.screwPositions?.map((pos, idx) => {
        const left = profile?.outerWidthMm ? `${(pos.x / profile.outerWidthMm) * 100}%` : '0%';
        const top = profile?.outerHeightMm ? `${(pos.y / profile.outerHeightMm) * 100}%` : '0%';
        return (
          <BezelScrew 
            key={idx}
            className="absolute" 
            style={{ 
              left,
              top,
              transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`
            }} 
            rotation={pos.rotation} 
          />
        );
      })}

      <div className="instrument-shell__content">
        {children}
      </div>
    </div>
  );
}
