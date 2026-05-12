import { useState, useRef, useEffect } from 'react';

interface RotaryKnobProps {
  value: number;
  onRotate: (delta: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function RotaryKnob({ value, onRotate, size = 'md', label }: RotaryKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastY = useRef(0);

  const sizeMap = {
    sm: 'h-[52px] w-[52px]', // Cockpit minimum
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    lastY.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = lastY.current - e.clientY;
    if (Math.abs(deltaY) > 5) {
      onRotate(deltaY > 0 ? 1 : -1);
      lastY.current = e.clientY;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      {label && <span className="text-[9px] font-bold text-[#c8c8c8] uppercase tracking-wider">{label}</span>}
      
      <div 
        className={`
          ${sizeMap[size]} relative cursor-ns-resize rounded-full bg-[#1a1a1a] 
          shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] 
          transition-transform active:scale-95 touch-none
          ${isDragging ? 'ring-2 ring-cdu-cyan/50' : ''}
        `}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={(e) => {
          const delta = e.deltaY < 0 ? 1 : -1;
          onRotate(delta);
        }}
      >
        {/* Grip ridges */}
        <div className="absolute inset-2 rounded-full border-[2px] border-dashed border-[#333] opacity-50" />
        
        {/* Top cap */}
        <div className="absolute inset-3 rounded-full bg-[#2a2a2a] shadow-inner" />
        
        {/* Position pointer */}
        <div 
          className="absolute top-2 left-1/2 h-3 w-1 -translate-x-1/2 rounded-full bg-white/30" 
          style={{ transform: `translateX(-50%) rotate(${value * 2}deg)` }}
        />

        {/* Tap area indicators for small screens */}
        <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity">
           <span className="text-white text-[8px]">-</span>
           <span className="text-white text-[8px]">+</span>
        </div>
      </div>
    </div>
  );
}
