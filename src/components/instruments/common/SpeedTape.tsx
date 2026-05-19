import React from 'react';

interface SpeedTapeProps {
  speed: number;
  targetSpeed: number | null;
  variant?: 'boeing' | 'airbus';
  managed?: boolean;
}

export const SpeedTape = React.memo(function SpeedTape({
  speed,
  targetSpeed,
  trend,
  variant = 'boeing',
  managed = false,
}: SpeedTapeProps & { trend?: number }) {
  const pixelsPerUnit = 2;
  const bugColor = variant === 'airbus' ? '#39ffef' : '#ff00ff';
  const readoutColor = variant === 'airbus' ? '#ffd400' : '#00ff44';

  return (
    <div
      className="relative flex h-full w-16 shrink-0 overflow-hidden border-r border-white/20 bg-[#101414]"
      data-testid={`${variant}-speed-tape`}
    >
      <div className="absolute left-1 top-2 z-20 text-[8px] font-black text-white/60">IAS</div>
      {managed && (
        <div
          className="absolute right-1 top-2 z-20 h-2 w-2 rounded-full bg-[#39ffef] shadow-[0_0_6px_#39ffef]"
          aria-label="managed speed"
        />
      )}
      <div
        className="absolute w-full"
        style={{ transform: `translate3d(0, ${speed * pixelsPerUnit}px, 0)`, willChange: 'transform' }}
      >
        {[...Array(50)].map((_, i) => {
          const val = i * 10;
          const y = -val * pixelsPerUnit;
          if (val % 20 !== 0)
            return <div key={val} className="absolute right-0 w-3 border-t border-white/25" style={{ top: y }} />;
          return (
            <div key={val} className="absolute w-full border-t border-white/60" style={{ top: y }}>
              <span className="absolute left-2 -top-2 font-mono text-[10px] font-bold text-white">{val}</span>
            </div>
          );
        })}
      </div>

      {trend && Math.abs(trend) > 1 && (
        <div
          className="absolute right-1 w-1 bg-[#00ff44] shadow-[0_0_6px_#00ff44]"
          style={{
            height: `${Math.abs(trend) * pixelsPerUnit}px`,
            top: `calc(50% ${trend > 0 ? `- ${trend * pixelsPerUnit}px` : ''})`,
            transform: trend > 0 ? '' : 'translateY(100%)',
          }}
        />
      )}

      {targetSpeed !== null && (
        <div
          className="absolute right-0 flex h-4 w-5 items-center justify-center"
          style={{ top: `${50 - (targetSpeed - speed) * pixelsPerUnit}%`, transform: 'translateY(-50%)' }}
        >
          <div
            className="h-0 w-0 border-y-[5px] border-r-[10px] border-y-transparent"
            style={{ borderRightColor: bugColor, filter: `drop-shadow(0 0 5px ${bugColor})` }}
          />
        </div>
      )}

      <div className="absolute top-1/2 left-0 right-0 z-10 flex h-9 -translate-y-1/2 items-center border-y border-white/60 bg-black shadow-[0_0_10px_rgba(0,0,0,0.8)]">
        <span className="w-full text-center font-mono text-xl font-black tabular-nums" style={{ color: readoutColor }}>
          {Math.round(speed)}
        </span>
      </div>
    </div>
  );
});
