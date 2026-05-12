interface AltitudeTapeProps {
  altitude: number;
  targetAltitude: number | null;
}

export function AltitudeTape({ altitude, targetAltitude }: AltitudeTapeProps) {
  const pixelsPerFoot = 0.2;
  
  return (
    <div className="relative flex h-full w-16 bg-[#1a1c1c] border-l border-white/20 overflow-hidden">
      {/* Tape scale */}
      <div className="absolute w-full" style={{ transform: `translateY(${altitude * pixelsPerFoot}px)` }}>
        {[...Array(50)].map((_, i) => {
          const val = i * 500;
          const y = -val * pixelsPerFoot;
          return (
            <div key={val} className="absolute w-full border-t border-white/40" style={{ top: y }}>
              <span className="absolute right-1 -top-2 font-mono text-[9px] text-white font-bold">{val}</span>
            </div>
          );
        })}
      </div>
      
      {/* Target altitude bug */}
      {targetAltitude !== null && (
        <div className="absolute left-0 w-4 h-4 bg-[#ff00ff] transform -translate-y-1/2" 
             style={{ top: `${50 - (targetAltitude - altitude) * pixelsPerFoot}%` }} />
      )}
      
      {/* Center readout */}
      <div className="absolute top-1/2 left-0 right-0 z-10 flex h-8 -translate-y-1/2 items-center bg-black border-y border-white/40">
        <span className="w-full text-center font-mono text-sm font-black text-white">{Math.round(altitude)}</span>
      </div>
    </div>
  );
}
