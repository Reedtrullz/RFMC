import type { ReactNode } from 'react';
import type { LayoutPresetId } from '../../config/trainingModes';

interface CockpitLayoutGridProps {
  preset: LayoutPresetId;
  modeClass: string;
  children: ReactNode;
}

export function CockpitLayoutGrid({ preset, modeClass, children }: CockpitLayoutGridProps) {
  return (
    <div
      className={`cockpit-stage cockpit-stage--${preset} ${modeClass}`}
      style={
        preset === 'mobileSwipeDeck'
          ? { gridTemplateColumns: 'minmax(0, 1fr)', gridAutoRows: '100%', overflow: 'auto' }
          : undefined
      }
    >
      {children}
    </div>
  );
}
