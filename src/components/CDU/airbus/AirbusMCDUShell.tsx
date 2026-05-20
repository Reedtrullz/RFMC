import { ReactNode } from 'react';
import { InstrumentShell } from '../../instruments/common/InstrumentShell';
import { PanelLabel } from '../../instruments/common/PanelLabel';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';
import { AirbusAnnunciators } from '../../../store/aircraftStore';
import { BezelScrew } from '../../instruments/common/BezelScrew';

interface AirbusMCDUShellProps {
  annunciators: AirbusAnnunciators;
  children: ReactNode;
}

export function AirbusMCDUShell({ annunciators, children }: AirbusMCDUShellProps) {
  return (
    <InstrumentShell variant="airbus-mcdu" className="airbus-mcdu-shell relative" data-testid="airbus-mcdu">
      <BezelScrew className="absolute top-2.5 left-3 z-20 scale-[0.8]" rotation={45} />
      <BezelScrew className="absolute top-2.5 right-3 z-20 scale-[0.8]" rotation={120} />
      <BezelScrew className="absolute bottom-2.5 left-3 z-20 scale-[0.8]" rotation={290} />
      <BezelScrew className="absolute bottom-2.5 right-3 z-20 scale-[0.8]" rotation={15} />

      <div className="mb-2 flex w-full items-center justify-between px-10 h-8 mt-1">
        <PanelLabel tone="amber">AIRBUS A320</PanelLabel>
        <div className="flex gap-3">
          <AnnunciatorLight label="FAIL" active={annunciators.fail} color="red" />
          <AnnunciatorLight label="MCDU MENU" active={annunciators.mcduMenu} color="white" />
          <AnnunciatorLight label="FM" active={annunciators.fm} color="white" />
          <AnnunciatorLight label="IND" active={annunciators.ind} color="amber" />
          <AnnunciatorLight label="RDY" active={annunciators.rdy} color="green" />
        </div>
      </div>

      <div className="instrument-shell__content px-3 pb-3">{children}</div>
    </InstrumentShell>
  );
}
