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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDragged = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only respond to left clicks for mouse events
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    // Do not start if clicking explicit buttons
    const target = e.target as HTMLElement;
    if (target.closest('.push-pull-btn')) return;

    setIsPressing(true);
    hasDragged.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };

    timerRef.current = setTimeout(() => {
      if (!hasDragged.current) {
        onPull(); // Long press = pull
      }
      setIsPressing(false);
      timerRef.current = null;
    }, 600);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPressing) return;
    const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
    if (dist > 10) {
      hasDragged.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsPressing(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (timerRef.current && !hasDragged.current) {
      clearTimeout(timerRef.current);
      onPush(); // Short click = push
    }
    setIsPressing(false);
    timerRef.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        data-testid={label ? `push-pull-${label.toLowerCase().replace(/[\s\/]/g, '-')}` : undefined}
        className={`relative cursor-pointer rounded-full transition-transform duration-150 touch-none select-none ${isPressing ? 'scale-90' : ''} ${highlighted ? 'highlighted-airbus' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.07),rgba(0,0,0,0.72)_70%)] shadow-[inset_0_6px_14px_rgba(0,0,0,0.85)] pointer-events-none" />
        <div className="absolute -left-6 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-white/24 pointer-events-none" />
        <div className="absolute -right-6 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-white/24 pointer-events-none" />

        {/* Clickable PUSH Overlay Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPush();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="push-pull-btn absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-black/40 hover:bg-black/80 border border-white/5 active:scale-95 text-[7px] font-black tracking-widest text-white/50 hover:text-white px-1.5 py-0.5 transition-all z-20"
        >
          PUSH
        </button>

        {/* Clickable PULL Overlay Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPull();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="push-pull-btn absolute -bottom-5 left-1/2 -translate-x-1/2 rounded bg-black/40 hover:bg-black/80 border border-white/5 active:scale-95 text-[7px] font-black tracking-widest text-white/50 hover:text-white px-1.5 py-0.5 transition-all z-20"
        >
          PULL
        </button>

        <RotaryKnob value={value} onRotate={onRotate} highlighted={highlighted} variant="airbus" />
      </div>
    </div>
  );
}
