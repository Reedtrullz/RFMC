import React from 'react';

interface VerticalSpeedIndicatorProps {
  verticalSpeed: number;
  targetVerticalSpeed: number | null;
  variant?: 'boeing' | 'airbus';
}

export const VerticalSpeedIndicator = React.memo(function VerticalSpeedIndicator({
  verticalSpeed,
  targetVerticalSpeed,
  variant = 'boeing',
}: VerticalSpeedIndicatorProps) {
  const maxFpm = 6000;
  const clamped = Math.max(-maxFpm, Math.min(maxFpm, verticalSpeed));
  const pointerY = 50 - (clamped / maxFpm) * 42;
  const bugColor = variant === 'airbus' ? '#39ffef' : '#ff00ff';

  return (
    <div
      className="relative h-full w-9 shrink-0 border-l border-white/10 bg-black/80"
      data-testid={`${variant}-vertical-speed`}
    >
      <div className="absolute right-1 top-2 text-[7px] font-black text-white/50">V/S</div>
      <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-white/25" />
      {[-6, -4, -2, 0, 2, 4, 6].map((mark) => (
        <div
          key={mark}
          className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1"
          style={{ top: `${50 - (mark / 6) * 42}%` }}
        >
          <div className="h-px w-3 bg-white/60" />
          {mark !== 0 && <span className="text-[7px] font-bold text-white/70">{Math.abs(mark)}</span>}
        </div>
      ))}
      {targetVerticalSpeed !== null && (
        <div
          className="absolute left-1 h-0 w-0 border-y-[4px] border-l-[8px] border-y-transparent"
          style={{
            top: `${50 - (Math.max(-maxFpm, Math.min(maxFpm, targetVerticalSpeed)) / maxFpm) * 42}%`,
            borderLeftColor: bugColor,
            filter: `drop-shadow(0 0 5px ${bugColor})`,
          }}
        />
      )}
      <div
        className="absolute right-0 h-0 w-0 border-y-[5px] border-r-[12px] border-y-transparent border-r-white"
        style={{ top: `${pointerY}%`, transform: 'translateY(-50%)' }}
      />
      <div className="absolute bottom-2 left-0 right-0 text-center text-[8px] font-black text-white/70">
        {Math.round(verticalSpeed / 100) * 100}
      </div>
    </div>
  );
});
