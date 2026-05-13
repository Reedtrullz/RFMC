interface AltitudeTapeProps {
  altitude: number;
  targetAltitude: number | null;
}

export function AltitudeTape({ altitude, targetAltitude }: AltitudeTapeProps) {
  const pixelsPerFoot = 0.2;
  
  // VNAV Path Deviation (Mocked or calculated from store)
  // 1 dot = 100ft, max 2 dots (200ft)
  const pathDev = 120; // Feet (high)
  const devScaleY = Math.max(-40, Math.min(40, (pathDev / 100) * 20));

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
      
      {/* VNAV Path Deviation Scale (V-PATH) */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center h-40 w-4">
        <div className="flex flex-col justify-between h-full py-4 items-center">
          <div className="w-1 h-1 bg-white rounded-full" /> {/* +2 dots */}
          <div className="w-1.5 h-1.5 bg-white rounded-full" /> {/* +1 dot */}
          <div className="w-3 h-[1px] bg-white opacity-40" /> {/* Center */}
          <div className="w-1.5 h-1.5 bg-white rounded-full" /> {/* -1 dot */}
          <div className="w-1 h-1 bg-white rounded-full" /> {/* -2 dots */}
        </div>
        
        {/* The Diamond */}
        <div 
          className="absolute w-3 h-3 border-2 border-[#ff00ff] rotate-45 bg-[#ff00ff]/20 z-20"
          style={{ 
            top: `calc(50% - ${devScaleY}px)`,
            transform: 'translateY(-50%) rotate(45deg)'
          }}
        />
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
