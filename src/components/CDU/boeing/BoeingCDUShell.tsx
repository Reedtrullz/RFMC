import type { ReactNode } from 'react';
import { InstrumentShell } from '../../visual/InstrumentShell';
import { AnnunciatorLight } from '../../visual/AnnunciatorLight';

interface BoeingCDUShellProps {
  msgLight: boolean;
  children: ReactNode;
}

export function BoeingCDUShell({ msgLight, children }: BoeingCDUShellProps) {
  return (
    <InstrumentShell
      title="BOEING 737-800"
      rightSlot={<AnnunciatorLight label="MSG" active={msgLight} tone="amber" />}
    >
      {children}
    </InstrumentShell>
  );
}
