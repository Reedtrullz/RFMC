import type { ReactNode } from 'react';
import { InstrumentShell } from '../../visual/InstrumentShell';
import { BezelScrew } from '../../visual/BezelScrew';
import { PanelLabel } from '../../visual/PanelLabel';

interface AirbusMCDUShellProps {
  msgLight: ReactNode;
  children: ReactNode;
}

export function AirbusMCDUShell({ msgLight, children }: AirbusMCDUShellProps) {
  return (
    <InstrumentShell
      variant="airbus-mcdu"
      className="airbus-mcdu-shell"
      data-testid="airbus-mcdu"
    >
      <BezelScrew className="absolute left-3 top-3" rotation={12} />
      <BezelScrew className="absolute right-3 top-3" rotation={-24} />
      <BezelScrew className="absolute left-3 bottom-3" rotation={47} />
      <BezelScrew className="absolute right-3 bottom-3" rotation={-8} />

      <div className="mb-2 flex w-full items-center justify-between px-5">
        <PanelLabel tone="amber">AIRBUS A320</PanelLabel>
        {msgLight}
      </div>
      
      <div className="instrument-shell__content">
        {children}
      </div>
    </InstrumentShell>
  );
}
