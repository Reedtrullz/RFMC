import { ReactNode } from 'react';
import { InstrumentShell } from '../../instruments/common/InstrumentShell';
import { PanelLabel } from '../../instruments/common/PanelLabel';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';
import { AirbusAnnunciators } from '../../../store/aircraftStore';

interface AirbusMCDUShellProps {
  annunciators: AirbusAnnunciators;
  children: ReactNode;
}

export function AirbusMCDUShell({ annunciators, children }: AirbusMCDUShellProps) {
  return (
    <InstrumentShell variant="airbus-mcdu" className="airbus-mcdu-shell" data-testid="airbus-mcdu">
      <div className="mb-2 flex w-full items-center justify-between px-5 h-8">
        <PanelLabel tone="amber">AIRBUS A320</PanelLabel>
        <div className="flex gap-3">
          <AnnunciatorLight label="FAIL" active={annunciators.fail} color="red" />
          <AnnunciatorLight label="MCDU MENU" active={annunciators.mcduMenu} color="white" />
          <AnnunciatorLight label="FM" active={annunciators.fm} color="white" />
          <AnnunciatorLight label="IND" active={annunciators.ind} color="amber" />
          <AnnunciatorLight label="RDY" active={annunciators.rdy} color="green" />
        </div>
      </div>

      <div className="instrument-shell__content">{children}</div>
    </InstrumentShell>
  );
}
