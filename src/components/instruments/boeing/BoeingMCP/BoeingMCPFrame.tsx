import { ReactNode } from 'react';

interface BoeingMCPFrameProps {
  children: ReactNode;
}

export function BoeingMCPFrame({ children }: BoeingMCPFrameProps) {
  return (
    <div className="relative w-full rounded-xl border-4 border-[#2a2d2d] bg-[#3a3d3d] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.1)]">
      {/* Panel texture and screws */}
      <div className="absolute top-2 left-2 h-3 w-3 rounded-full bg-[#1a1a1a] shadow-inner" />
      <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-[#1a1a1a] shadow-inner" />
      <div className="absolute bottom-2 left-2 h-3 w-3 rounded-full bg-[#1a1a1a] shadow-inner" />
      <div className="absolute bottom-2 right-2 h-3 w-3 rounded-full bg-[#1a1a1a] shadow-inner" />

      {/* Main content */}
      <div className="flex flex-col gap-8">
        <div className="flex w-full items-center justify-between border-b border-black/20 pb-4">
          <span className="text-sm font-black italic tracking-widest text-[#2a2a2a] opacity-40">
            BOEING 737-800 MCP
          </span>
          <div className="flex gap-4">
            <div className="h-4 w-12 rounded-sm bg-[#1a1a1a] shadow-inner" />
            <div className="h-4 w-12 rounded-sm bg-[#1a1a1a] shadow-inner" />
          </div>
        </div>

        {children}
      </div>

      {/* Subtle overlay for metal texture */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent mix-blend-overlay" />
    </div>
  );
}
