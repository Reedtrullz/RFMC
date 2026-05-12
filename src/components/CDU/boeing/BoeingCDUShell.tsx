import type { ReactNode } from 'react';
import { InstrumentShell } from '../../visual/InstrumentShell';
import { BezelScrew } from '../../visual/BezelScrew';
import { PanelLabel } from '../../visual/PanelLabel';

interface BoeingCDUShellProps {
  msgLight: ReactNode;
  children: ReactNode;
}

export function BoeingCDUShell({ msgLight, children }: BoeingCDUShellProps) {
  return (
    <InstrumentShell
      variant="boeing-cdu"
      className="boeing-cdu-shell"
      data-testid="boeing-cdu"
    >
      <BezelScrew className="absolute left-3 top-3" rotation={12} />
      <BezelScrew className="absolute right-3 top-3" rotation={-24} />
      <BezelScrew className="absolute left-3 bottom-3" rotation={47} />
      <BezelScrew className="absolute right-3 bottom-3" rotation={-8} />

      <div className="mb-2 flex w-full items-center justify-between px-5">
        <PanelLabel>BOEING 737-800</PanelLabel>
        {msgLight}
      </div>
      
      <div className="instrument-shell__content">
        {children}
      </div>
    </InstrumentShell>
  );
}
