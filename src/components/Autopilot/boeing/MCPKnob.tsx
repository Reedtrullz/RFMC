interface MCPKnobProps {
  label: string;
  value: number;
  onRotate: (delta: number) => void;
  onPress?: () => void;
  unit?: string;
}

export function MCPKnob({ label, value, onRotate, onPress, unit }: MCPKnobProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold text-[#c8c8c8] uppercase tracking-wider">{label}</span>
      
      <div className="group relative">
        {/* The physical knob */}
        <div 
          className="relative h-14 w-14 cursor-ns-resize rounded-full bg-[#1a1a1a] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] transition-transform active:scale-95"
          onWheel={(e) => {
            const delta = e.deltaY < 0 ? 1 : -1;
            onRotate(delta);
          }}
          onClick={onPress}
        >
          {/* Grip ridges */}
          <div className="absolute inset-2 rounded-full border-[3px] border-dashed border-[#333] opacity-50" />
          
          {/* Top cap */}
          <div className="absolute inset-3 rounded-full bg-[#2a2a2a] shadow-inner" />
          
          {/* Position indicator */}
          <div 
            className="absolute top-1 left-1/2 h-2 w-1 -translate-x-1/2 rounded-full bg-white/20" 
            style={{ transform: `translateX(-50%) rotate(${value * 2}deg)` }}
          />
        </div>
        
        {/* Interaction hint */}
        <div className="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
           <span className="whitespace-nowrap text-[8px] text-[#666]">SCROLL TO TURN</span>
        </div>
      </div>
    </div>
  );
}
