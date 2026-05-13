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
        className={`relative cursor-pointer transition-transform duration-150 ${isPressing ? 'scale-90' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <RotaryKnob value={value} onRotate={onRotate} highlighted={highlighted} />
        
        {/* Visual indicators for push/pull */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-[7px] text-white/30 uppercase">Tap: Push (MGD)</span>
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-[7px] text-white/30 uppercase">Hold: Pull (SEL)</span>
        </div>
      </div>
    </div>
  );
}
