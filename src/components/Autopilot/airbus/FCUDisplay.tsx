import React from 'react';

interface FCUDisplayProps {
  value: number;
  label?: string;
  managed?: boolean;
}

export function FCUDisplay({ value, label, managed }: FCUDisplayProps) {
  return (
    <div className="relative flex h-10 w-24 items-center justify-center rounded-sm bg-black/80 border border-white/10 shadow-inner overflow-hidden font-mono">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <span className="text-xl text-[#00f0ff] tracking-tighter drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
        {label || value}
      </span>
      {managed && (
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_5px_rgba(0,240,255,1)]" />
      )}
    </div>
  );
}
