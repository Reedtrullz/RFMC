import { ReactNode } from 'react';

interface PFDFrameProps {
  children: ReactNode;
  aircraft: 'boeing' | 'airbus';
}

export function PFDFrame({ children, aircraft }: PFDFrameProps) {
  return (
    <div
      className={`relative flex aspect-[4/5] w-full flex-col overflow-hidden rounded-sm border-4 bg-[#0a0c0c] shadow-2xl ${aircraft === 'boeing' ? 'border-[#1a1c1c]' : 'border-[#3a3d3d]'}`}
    >
      {/* CRT Scanline / Glass overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.03] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
        style={{
          background:
            'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%',
        }}
      />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]" />

      <div className="flex h-full w-full flex-col p-1">{children}</div>
    </div>
  );
}
