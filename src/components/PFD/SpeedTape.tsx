interface SpeedTapeProps {
  speed: number;
  targetSpeed: number | null;
}

export function SpeedTape({ speed, targetSpeed }: SpeedTapeProps) {
  const range = 40;
  const pixelsPerUnit = 2;
  
  return (
    <div className="relative flex h-full w-14 bg-[#1a1c1c] border-r border-white/20 overflow-hidden">
      {/* Tape scale */}
      <div className="absolute w-full" style={{ transform: `translateY(${speed * pixelsPerUnit}px)` }}>
        {[...Array(20)].map((_, i) => {
          const val = i * 20;
          const y = -val * pixelsPerUnit;
          return (
            <div key={val} className="absolute w-full border-t border-white/40" style={{ top: y }}>
              <span className="absolute left-1 -top-2 font-mono text-[10px] text-white font-bold">{val}</span>
            </div>
          );
        })}
      </div>
      
      {/* Target speed bug */}
      {targetSpeed !== null && (
        <div className="absolute right-0 w-4 h-4 bg-[#ff00ff] transform -translate-y-1/2" 
             style={{ top: `${50 - (targetSpeed - speed) * pixelsPerUnit}%` }} />
      )}
      
      {/* Center readout */}
      <div className="absolute top-1/2 left-0 right-0 z-10 flex h-8 -translate-y-1/2 items-center bg-black border-y border-white/40">
        <span className="w-full text-center font-mono text-xl font-black text-white">{Math.round(speed)}</span>
      </div>
    </div>
  );
}
