interface AttitudeSphereProps {
  pitch: number;
  bank: number;
}

export function AttitudeSphere({ pitch, bank }: AttitudeSphereProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0055ff]">
      {/* Sky/Ground transition */}
      <div 
        className="absolute inset-0 flex flex-col transition-transform duration-100"
        style={{ transform: `translateY(${pitch * 2}px) rotate(${-bank}deg)` }}
      >
        <div className="h-full w-full bg-[#0055ff]" />
        <div className="h-[2px] w-full bg-white" />
        <div className="h-full w-full bg-[#8b4513]" />
      </div>
      
      {/* Fixed Aircraft Reference */}
      <div className="relative z-10 flex h-2 w-20 items-center justify-between">
         <div className="h-2 w-8 bg-black border border-white/40" />
         <div className="h-2 w-2 bg-black border border-white/40" />
         <div className="h-2 w-8 bg-black border border-white/40" />
      </div>
      
      {/* Bank Scale */}
      <div className="absolute top-4 h-32 w-32 rounded-full border border-white/20" />
    </div>
  );
}
