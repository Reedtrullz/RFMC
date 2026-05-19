import React from 'react';

interface AltitudeTapeProps {
  altitude: number;
  targetAltitude: number | null;
  variant?: 'boeing' | 'airbus';
  managed?: boolean;
}

export const AltitudeTape = React.memo(function AltitudeTape({
  altitude,
  targetAltitude,
  variant = 'boeing',
  managed = false,
}: AltitudeTapeProps) {
  const pixelsPerFoot = 0.2;
  const bugColor = variant === 'airbus' ? '#39ffef' : '#ff00ff';
  const readoutColor = variant === 'airbus' ? '#ffd400' : '#00ff44';

  const pathDev = 120; // Feet (high)
  const devScaleY = Math.max(-40, Math.min(40, (pathDev / 100) * 20));

  return (
    <div
      className="relative flex h-full w-[72px] shrink-0 overflow-hidden border-l border-white/20 bg-[#101414]"
      data-testid={`${variant}-altitude-tape`}
    >
      <div className="absolute right-1 top-2 z-20 text-[8px] font-black text-white/60">ALT</div>
      {managed && (
        <div
          className="absolute left-1 top-2 z-20 h-2 w-2 rounded-full bg-[#39ffef] shadow-[0_0_6px_#39ffef]"
          aria-label="managed altitude"
        />
      )}
      <div
        className="absolute w-full"
        style={{ transform: `translate3d(0, ${altitude * pixelsPerFoot}px, 0)`, willChange: 'transform' }}
      >
        {[...Array(50)].map((_, i) => {
          const val = i * 500;
          const y = -val * pixelsPerFoot;
          return (
            <div key={val} className="absolute w-full border-t border-white/50" style={{ top: y }}>
              <span className="absolute right-2 -top-2 font-mono text-[9px] font-bold text-white">{val}</span>
            </div>
          );
        })}
      </div>

      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center h-40 w-4">
        <div className="flex flex-col justify-between h-full py-4 items-center">
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          <div className="w-3 h-[1px] bg-white opacity-40" />
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>

        <div
          className="absolute z-20 h-3 w-3 rotate-45 border-2 bg-transparent"
          style={{
            borderColor: bugColor,
            top: `calc(50% - ${devScaleY}px)`,
            transform: 'translateY(-50%) rotate(45deg)',
            boxShadow: `0 0 8px ${bugColor}`,
          }}
        />
      </div>

      {targetAltitude !== null && (
        <div
          className="absolute left-0 flex h-4 w-full items-center"
          style={{ top: `${50 - (targetAltitude - altitude) * pixelsPerFoot}%`, transform: 'translateY(-50%)' }}
        >
          <div className="h-0.5 w-1/2" style={{ backgroundColor: bugColor, boxShadow: `0 0 8px ${bugColor}` }} />
        </div>
      )}

      <div className="absolute top-1/2 left-0 right-0 z-10 flex h-9 -translate-y-1/2 items-center border-y border-white/60 bg-black">
        <span className="w-full text-center font-mono text-sm font-black tabular-nums" style={{ color: readoutColor }}>
          {Math.round(altitude)}
        </span>
      </div>
    </div>
  );
});
