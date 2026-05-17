import React, { useState, useRef, useEffect } from 'react';
import { RotaryKnob } from './RotaryKnob';

interface PushPullRotaryProps {
  value: number;
  onRotate: (delta: number) => void;
  onPush: () => void; // managed
  onPull: () => void; // selected
  label?: string;
  highlighted?: boolean;
}

export function PushPullRotary({ value, onRotate, onPush, onPull, label, highlighted }: PushPullRotaryProps) {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onPull(); // Long press = pull
      setIsPressing(false);
      timerRef.current = null;
    }, 600);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onPush(); // Short click = push
    }
    setIsPressing(false);
    timerRef.current = null;
  };

  const handleTouchStart = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onPull();
      setIsPressing(false);
      timerRef.current = null;
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      onPush();
    }
    setIsPressing(false);
    timerRef.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        data-testid={label ? `push-pull-${label.toLowerCase().replace(/[\s\/]/g, '-')}` : undefined}
        className={`relative cursor-pointer rounded-full transition-transform duration-150 ${isPressing ? 'scale-90' : ''} ${highlighted ? 'ring-2 ring-cdu-amber shadow-[0_0_18px_rgba(255,184,77,0.55)]' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07),rgba(0,0,0,0.72)_70%)] shadow-[inset_0_6px_14px_rgba(0,0,0,0.85)]" />
        <div className="absolute -left-6 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-white/24" />
        <div className="absolute -right-6 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-white/24" />
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[7px] font-black tracking-widest text-white/35">PUSH</div>
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[7px] font-black tracking-widest text-white/35">PULL</div>
        <RotaryKnob value={value} onRotate={onRotate} highlighted={highlighted} />
      </div>
    </div>
  );
}
