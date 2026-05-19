import { ReactNode } from 'react';
import { WearTexture } from './WearTexture';
import { ScrewHead } from './ScrewHead';

interface CockpitPanelProps {
  children: ReactNode;
  variant?: 'boeing' | 'airbus';
  showScrews?: boolean;
  className?: string;
}

export function CockpitPanel({ children, variant = 'boeing', showScrews = true, className = '' }: CockpitPanelProps) {
  const panelBg = variant === 'boeing' ? 'bg-[#25292c]' : 'bg-[#3a3f43]';

  return (
    <div className={`relative rounded-xl ${panelBg} p-6 shadow-2xl ${className}`}>
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.1),inset_0_-2px_10px_rgba(0,0,0,0.5)]" />

      {showScrews && (
        <>
          <ScrewHead className="absolute top-3 left-3" />
          <ScrewHead className="absolute top-3 right-3" />
          <ScrewHead className="absolute bottom-3 left-3" />
          <ScrewHead className="absolute bottom-3 right-3" />
        </>
      )}

      <WearTexture />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
