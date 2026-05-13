interface AttitudeSphereProps {
  pitch: number;
  bank: number;
  fd?: {
    visible: boolean;
    pitch: number;
    roll: number;
  };
}

export function AttitudeSphere({ pitch, bank, fd }: AttitudeSphereProps) {
  const pixelsPerDegree = 4;

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#003cff]">
      {/* Sky/Ground transition */}
      <div 
        className="absolute inset-0 flex flex-col transition-transform duration-100"
        style={{ transform: `translateY(${pitch * pixelsPerDegree}px) rotate(${-bank}deg)` }}
      >
        <div className="h-[2000px] w-full bg-[#0055ff] flex flex-col items-center justify-end pb-2">
           {/* Pitch scale lines could go here */}
        </div>
        <div className="h-[2px] w-full bg-white shadow-[0_0_10px_white]" />
        <div className="h-[2000px] w-full bg-[#8b4513]" />
      </div>
      
      {/* Flight Director Bars (Magenta) */}
      {fd?.visible && (
        <div className="absolute inset-0 pointer-events-none z-20">
           {/* Pitch Bar */}
           <div 
             className="absolute left-1/2 w-48 h-[1.5px] bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]"
             style={{ 
               top: `calc(50% - ${(fd.pitch - pitch) * pixelsPerDegree}px)`,
               left: '50%',
               transform: `translate(-50%, -50%) rotate(${-bank}deg)` 
             }}
           />
           {/* Roll Bar */}
           <div 
             className="absolute top-1/2 w-[1.5px] h-48 bg-[#ff00ff] shadow-[0_0_8px_#ff00ff]"
             style={{ 
               left: `calc(50% + ${(fd.roll - bank) * pixelsPerDegree}px)`,
               top: '50%',
               transform: `translate(-50%, -50%) rotate(${-bank}deg)` 
             }}
           />
        </div>
      )}

      {/* Fixed Aircraft Reference */}
      <div className="relative z-30 flex h-2 w-20 items-center justify-between">
         <div className="h-1.5 w-8 bg-black border border-white/60 shadow-lg" />
         <div className="h-1.5 w-1.5 bg-black border border-white/60 shadow-lg" />
         <div className="h-1.5 w-8 bg-black border border-white/60 shadow-lg" />
      </div>
      
      {/* Bank Scale */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full border border-white/10 pointer-events-none" />
    </div>
  );
}

