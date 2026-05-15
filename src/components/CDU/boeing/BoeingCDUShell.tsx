import { ReactNode } from 'react';
import { InstrumentShell } from '../../instruments/common/InstrumentShell';
import { PanelLabel } from '../../instruments/common/PanelLabel';
import { AnnunciatorLight } from '../../instruments/common/AnnunciatorLight';
import { BoeingAnnunciators } from '../../../store/aircraftStore';

interface BoeingCDUShellProps {
  annunciators: BoeingAnnunciators;
  children: ReactNode;
}

export function BoeingCDUShell({ annunciators, children }: BoeingCDUShellProps) {
  return (
    <InstrumentShell
      variant="boeing-cdu"
      className="boeing-cdu-shell"
      data-testid="boeing-cdu cdu-panel"
    >

      <div className="mb-2 flex w-full items-center justify-between px-5 h-8">
        <PanelLabel>BOEING 737-800</PanelLabel>
        <div className="flex gap-4">
          <AnnunciatorLight label="FAIL" active={annunciators.fail} color="amber" />
          <AnnunciatorLight label="MSG" active={annunciators.msg} color="amber" />
          <AnnunciatorLight label="OFST" active={annunciators.ofst} color="amber" />
        </div>
      </div>
      
      <div className="instrument-shell__content">
        <div className="relative">
          {/* LSK Labels L1-L6 */}
          <div className="absolute -left-1 top-2 flex h-[300px] flex-col justify-around text-[7px] font-bold text-white/20">
            <span>L1</span><span>L2</span><span>L3</span><span>L4</span><span>L5</span><span>L6</span>
          </div>
          {/* LSK Labels R1-R6 */}
          <div className="absolute -right-1 top-2 flex h-[300px] flex-col justify-around text-right text-[7px] font-bold text-white/20">
            <span>R1</span><span>R2</span><span>R3</span><span>R4</span><span>R5</span><span>R6</span>
          </div>
          {children}
        </div>
      </div>
    </InstrumentShell>
  );
}
