import { useState, useRef } from 'react';
import { tactile } from '../../../../utils/tactile';

interface MCPKnobProps {
  label: string;
  value: number;
  onRotate: (delta: number) => void;
  onPress?: () => void;
  unit?: string;
  highlighted?: boolean;
}

export function MCPKnob({ label, value, onRotate, onPress, unit, highlighted }: MCPKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const lastY = useRef(0);
  const hasDragged = useRef(false);

  const triggerRotate = (delta: number) => {
    tactile.vibrate(5);
    onRotate(delta);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    hasDragged.current = false;
    lastY.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = lastY.current - e.clientY;
    if (Math.abs(deltaY) > 5) {
      hasDragged.current = true;
      triggerRotate(deltaY > 0 ? 1 : -1);
      lastY.current = e.clientY;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-cdu">{label}</span>

      <div className="relative group">
        {/* Outer Panel Recess (Deep Shadow) */}
        <div className="absolute -inset-3 rounded-full bg-black/50 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]" />

        <div
          role="slider"
          aria-label={label}
          aria-valuenow={value}
          data-testid={`mcp-${label.toLowerCase().replace(/[\s\/]/g, '-')}-knob`}
          className={`relative h-14 w-14 cursor-ns-resize rounded-full bg-[#1c1c1c] shadow-[0_8px_16px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] transition-all active:scale-95 group-hover:bg-[#252525] touch-none outline-none ${
            highlighted ? 'highlighted-boeing' : ''
          } ${isDragging ? 'ring-2 ring-cdu-cyan/50' : ''}`}
          onWheel={(e) => {
            const delta = e.deltaY < 0 ? 1 : -1;
            onRotate(delta);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => {
            if (!hasDragged.current && onPress) {
              onPress();
            }
          }}
        >
          {/* Radial Knurling (Industrial Texture) */}
          <div className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay overflow-hidden">
            {[...Array(36)].map((_, i) => (
              <div
                key={`knurl-${i}`}
                className="absolute top-1/2 left-1/2 w-full h-[1px] bg-black/40 origin-left"
                style={{ transform: `translate(-50%, -50%) rotate(${i * 10}deg)` }}
              />
            ))}
          </div>

          {/* Surface Wear & Scratches */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05),transparent)] mix-blend-screen opacity-50" />

          {/* High-Contrast Lighting & Rim Highlight */}
          <div className="absolute inset-0 rounded-full border border-white/5 bg-gradient-to-tr from-black/60 via-transparent to-white/10" />

          {/* Inner Cap (Matte Finish) */}
          <div className="absolute inset-2.5 rounded-full bg-[#2a2d2d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.05)] border border-white/5" />

          {/* Position Indicator (Physical Recessed Dot) */}
          <div
            className="absolute top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,1),inset_0_1px_2px_rgba(0,0,0,0.4)]"
            style={{
              transformOrigin: `center 21px`,
              transform: `translateX(-50%) rotate(${value * 12}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          />

          {/* Backlight Bleed (Ambient) */}
          <div className="absolute -inset-[1px] rounded-full border border-cdu-cyan/10 opacity-20" />
        </div>

        {/* Unit/Value Hint (Industrial Type) */}
        {unit && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/20 rotate-90 uppercase tracking-widest font-cdu">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
