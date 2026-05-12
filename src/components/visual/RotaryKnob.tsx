interface RotaryKnobProps {
  value: number;
  onRotate: (delta: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function RotaryKnob({ value, onRotate, size = 'md', label }: RotaryKnobProps) {
  const sizeMap = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-[9px] font-bold text-[#c8c8c8] uppercase tracking-wider">{label}</span>}
      
      <div 
        className={`${sizeMap[size]} relative cursor-ns-resize rounded-full bg-[#1a1a1a] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] transition-transform active:scale-95`}
        onWheel={(e) => {
          const delta = e.deltaY < 0 ? 1 : -1;
          onRotate(delta);
        }}
      >
        {/* Grip ridges */}
        <div className="absolute inset-1 rounded-full border-[2px] border-dashed border-[#333] opacity-50" />
        
        {/* Top cap */}
        <div className="absolute inset-2 rounded-full bg-[#2a2a2a] shadow-inner" />
        
        {/* Position pointer */}
        <div 
          className="absolute top-1.5 left-1/2 h-2.5 w-1 -translate-x-1/2 rounded-full bg-white/30" 
          style={{ transform: `translateX(-50%) rotate(${value * 2}deg)` }}
        />
      </div>
    </div>
  );
}
