import React, { type CSSProperties } from 'react';

interface AttitudeSphereProps {
  pitch: number;
  bank: number;
  variant?: 'boeing' | 'airbus';
  fd?: {
    visible: boolean;
    pitch: number;
    roll: number;
  };
  failed?: boolean;
}

const pitchMarks = [-30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30];
const bankMarks = [-45, -30, -20, -10, 10, 20, 30, 45];

export const AttitudeSphere = React.memo(function AttitudeSphere({
  pitch,
  bank,
  variant = 'boeing',
  fd,
  failed = false,
}: AttitudeSphereProps) {
  const pixelsPerDegree = 4;
  const sky = variant === 'airbus' ? '#1767c7' : '#0055ff';
  const ground = variant === 'airbus' ? '#8d4d22' : '#7a3f18';
  const fdColor = variant === 'airbus' ? '#39ffef' : '#ff00ff';
  const referenceColor = variant === 'airbus' ? '#ffd400' : '#101010';

  if (failed) {
    const isAirbus = variant === 'airbus';
    const flagColor = isAirbus ? '#ff3131' : '#ffcc00';
    const secondaryColor = isAirbus ? '#ff9a9a' : '#00ff44';

    return (
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0"
          style={{
            background: isAirbus
              ? 'radial-gradient(circle at center, rgba(120,0,0,0.28), rgba(0,0,0,0.96) 64%)'
              : 'radial-gradient(circle at center, rgba(80,64,0,0.18), rgba(0,0,0,0.96) 64%)',
          }}
        />
        <div
          className="z-10 grid min-w-36 gap-1 border bg-black px-5 py-3 text-center font-mono shadow-[0_0_18px_rgba(0,0,0,0.7)]"
          style={{ borderColor: flagColor, color: flagColor }}
        >
          <div className="text-2xl font-black tracking-[0.18em]">ATT</div>
          <div className="text-[10px] font-bold tracking-[0.14em]" style={{ color: secondaryColor }}>
            {isAirbus ? 'ADR/IR' : 'IRS NAV'}
          </div>
        </div>
      </div>
    );
  }

  // CSS custom properties for animated values — avoids per-element inline style creation on each frame
  const animVars = {
    '--pitch-offset': `${pitch * pixelsPerDegree}px`,
    '--bank-rotate': `${-bank}deg`,
    '--bank-rotate-abs': `${bank}deg`,
    '--sky-fill': sky,
    '--ground-fill': ground,
  } as CSSProperties;

  return (
    <div
      className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden"
      data-testid={`${variant}-attitude-sphere`}
      style={{
        ...animVars,
        background: `linear-gradient(to bottom, ${sky} 0 49.5%, #ffffff 49.5% 50.5%, ${ground} 50.5% 100%)`,
      }}
    >
      <div
        className="absolute left-[-50%] top-1/2 flex h-[4002px] w-[200%] flex-col transition-transform duration-100"
        style={{ transform: 'translateY(calc(-50% + var(--pitch-offset))) rotate(var(--bank-rotate))' }}
      >
        <div
          className="relative h-[2000px] w-full flex flex-col items-center justify-end pb-2"
          style={{ backgroundColor: sky }}
        >
          {pitchMarks
            .filter((mark) => mark > 0)
            .map((mark) => (
              <PitchMark key={mark} mark={mark} pixelsPerDegree={pixelsPerDegree} variant={variant} />
            ))}
        </div>
        <div className="h-[2px] w-full bg-white shadow-[0_0_10px_white]" />
        <div className="relative h-[2000px] w-full" style={{ backgroundColor: ground }}>
          {pitchMarks
            .filter((mark) => mark < 0)
            .map((mark) => (
              <PitchMark key={mark} mark={mark} pixelsPerDegree={pixelsPerDegree} variant={variant} />
            ))}
        </div>
      </div>

      {fd?.visible && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div
            className="absolute left-1/2 h-[2px] w-40 shadow-[0_0_8px_currentColor]"
            style={{
              backgroundColor: fdColor,
              color: fdColor,
              top: `calc(50% - ${(fd.pitch - pitch) * pixelsPerDegree}px)`,
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(var(--bank-rotate))',
            }}
          />
          <div
            className="absolute top-1/2 h-36 w-[2px] shadow-[0_0_8px_currentColor]"
            style={{
              backgroundColor: fdColor,
              color: fdColor,
              left: `calc(50% + ${(fd.roll - bank) * pixelsPerDegree}px)`,
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(var(--bank-rotate))',
            }}
          />
        </div>
      )}

      <div className="absolute top-3 left-1/2 z-30 h-20 w-44 -translate-x-1/2 pointer-events-none">
        {bankMarks.map((mark) => (
          <div
            key={mark}
            className="absolute left-1/2 top-0 h-3 w-[2px] origin-[50%_72px] bg-white/80"
            style={{
              transform: `translateX(-50%) rotate(${mark}deg)`,
              height: Math.abs(mark) === 30 ? 16 : 10,
            }}
          />
        ))}
        <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[10px] border-x-transparent border-t-white" />
        <div
          className="absolute left-1/2 top-12 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[9px] border-x-transparent border-b-white"
          style={{ transform: 'translateX(-50%) rotate(var(--bank-rotate-abs))', transformOrigin: '50% 28px' }}
        />
      </div>

      <div className="relative z-30 flex h-3 w-24 items-center justify-between">
        <div
          className="h-2 w-9 border shadow-lg"
          style={{
            backgroundColor: referenceColor,
            borderColor: variant === 'airbus' ? '#201400' : 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          className="h-2 w-2 border shadow-lg"
          style={{
            backgroundColor: referenceColor,
            borderColor: variant === 'airbus' ? '#201400' : 'rgba(255,255,255,0.7)',
          }}
        />
        <div
          className="h-2 w-9 border shadow-lg"
          style={{
            backgroundColor: referenceColor,
            borderColor: variant === 'airbus' ? '#201400' : 'rgba(255,255,255,0.7)',
          }}
        />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-white/10 pointer-events-none" />
    </div>
  );
});

function PitchMark({
  mark,
  pixelsPerDegree,
  variant,
}: {
  mark: number;
  pixelsPerDegree: number;
  variant: 'boeing' | 'airbus';
}) {
  const isMajor = Math.abs(mark) % 10 === 0;
  const width = isMajor ? 'w-24' : 'w-14';
  const label = Math.abs(mark).toString();
  const top = mark > 0 ? `${2000 - mark * pixelsPerDegree}px` : `${Math.abs(mark) * pixelsPerDegree}px`;

  return (
    <div
      className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-2 text-[9px] font-black text-white"
      style={{ top }}
    >
      {isMajor && <span className={variant === 'airbus' ? 'text-[#ffd400]' : 'text-white'}>{label}</span>}
      <div className={`${width} border-t-2 ${isMajor ? 'border-white' : 'border-white/80'}`} />
      {isMajor && <span className={variant === 'airbus' ? 'text-[#ffd400]' : 'text-white'}>{label}</span>}
    </div>
  );
}
