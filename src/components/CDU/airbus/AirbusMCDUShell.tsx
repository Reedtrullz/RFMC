import type { ReactNode } from 'react';
import { InstrumentShell } from '../../instruments/common/InstrumentShell';
import { BezelScrew } from '../../instruments/common/BezelScrew';
import { PanelLabel } from '../../instruments/common/PanelLabel';

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
