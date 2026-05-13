interface MCPKnobProps {
  label: string;
  value: number;
  onRotate: (delta: number) => void;
  onPress?: () => void;
  unit?: string;
  highlighted?: boolean;
}

export function MCPKnob({ label, value, onRotate, onPress, unit, highlighted }: MCPKnobProps) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-cdu">{label}</span>
      
      <div className="relative group">
        {/* Outer Panel Recess (Shadow) */}
        <div className="absolute -inset-2 rounded-full bg-black/40 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]" />
        
        <div 
          className={`relative h-14 w-14 cursor-ns-resize rounded-full bg-[#1c1c1c] shadow-[0_6px_12px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.15)] transition-all active:scale-95 group-hover:bg-[#252525] ${
            highlighted ? 'ring-2 ring-cdu-cyan shadow-[0_0_15px_rgba(0,255,255,0.4)]' : ''
          }`}
          onWheel={(e) => {
            const delta = e.deltaY < 0 ? 1 : -1;
            onRotate(delta);
          }}
          onClick={onPress}
        >
          {/* Physical Knurling (Texture) */}
          <div className="absolute inset-[1px] rounded-full border-[2px] border-dashed border-black/80 opacity-40 mix-blend-multiply" />
          <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          
          {/* Rotational Lighting & Depth */}
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 via-transparent to-white/10"
            style={{ transform: `rotate(${value * 10}deg)` }}
          />

          {/* Inner Cap */}
          <div className="absolute inset-2.5 rounded-full bg-[#2a2d2d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_2px_rgba(255,255,255,0.05)] border border-white/5" />
          
          {/* Position Indicator (Physical Dot) */}
          <div 
            className="absolute top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]" 
            style={{ transformOrigin: `center 21px`, transform: `translateX(-50%) rotate(${value * 12}deg)` }}
          />
        </div>
        
        {/* Unit/Value Hint (Subtle) */}
        {unit && (
          <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-[8px] font-bold text-[#444] rotate-90 uppercase tracking-tighter">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
