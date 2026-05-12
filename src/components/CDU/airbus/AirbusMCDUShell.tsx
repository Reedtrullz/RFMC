import type { ReactNode } from 'react';
import { InstrumentShell } from '../../visual/InstrumentShell';
import { AnnunciatorLight } from '../../visual/AnnunciatorLight';

interface AirbusMCDUShellProps {
  msgLight: boolean;
  children: ReactNode;
}

export function AirbusMCDUShell({ msgLight, children }: AirbusMCDUShellProps) {
  return (
    <InstrumentShell
      title="AIRBUS A320"
      rightSlot={<AnnunciatorLight label="MSG" active={msgLight} tone="amber" />}
      className="airbus-mcdu-bezel"
      data-testid="airbus-mcdu"
    >
      {children}
    </InstrumentShell>
  );
}
