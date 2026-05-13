interface SpeedTapeProps {
  speed: number;
  targetSpeed: number | null;
}

export function SpeedTape({ speed, targetSpeed, trend }: SpeedTapeProps & { trend?: number }) {
  const range = 40;
  const pixelsPerUnit = 2;
  
  return (
    <div className="relative flex h-full w-14 bg-[#1a1c1c] border-r border-white/20 overflow-hidden">
      {/* Tape scale */}
      <div className="absolute w-full" style={{ transform: `translateY(${speed * pixelsPerUnit}px)` }}>
        {[...Array(50)].map((_, i) => {
          const val = i * 10;
          const y = -val * pixelsPerUnit;
          if (val % 20 !== 0) return <div key={val} className="absolute right-0 w-2 border-t border-white/20" style={{ top: y }} />;
          return (
            <div key={val} className="absolute w-full border-t border-white/40" style={{ top: y }}>
              <span className="absolute left-1 -top-2 font-mono text-[10px] text-white font-bold">{val}</span>
            </div>
          );
        })}
      </div>

      {/* Speed Trend Vector (Green) */}
      {trend && Math.abs(trend) > 1 && (
        <div 
          className="absolute right-0 w-1 bg-[#00ff44]"
          style={{ 
            height: `${Math.abs(trend) * pixelsPerUnit}px`,
            top: `calc(50% ${trend > 0 ? `- ${trend * pixelsPerUnit}px` : ''})`,
            transform: trend > 0 ? '' : 'translateY(100%)'
          }}
        />
      )}
      
      {/* Target speed bug (Magenta) */}
      {targetSpeed !== null && (
        <div className="absolute right-0 w-4 h-4 flex items-center justify-center" 
             style={{ top: `${50 - (targetSpeed - speed) * pixelsPerUnit}%`, transform: 'translateY(-50%)' }}>
           <div className="w-full h-1 bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]" />
        </div>
      )}
      
      {/* Center readout */}
      <div className="absolute top-1/2 left-0 right-0 z-10 flex h-8 -translate-y-1/2 items-center bg-black border-y border-white/40">
        <span className="w-full text-center font-mono text-xl font-black text-[#00ff44]">{Math.round(speed)}</span>
      </div>
    </div>
  );
}
