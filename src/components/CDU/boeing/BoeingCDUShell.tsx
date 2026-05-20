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
    <InstrumentShell variant="boeing-cdu" className="boeing-cdu-shell" data-testid="boeing-cdu">
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
          <div className="absolute -left-1.5 top-2 flex h-[300px] flex-col justify-around text-[8px] font-bold text-white/40 tracking-wider">
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">L1</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">L2</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">L3</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">L4</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">L5</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">L6</span>
          </div>
          {/* LSK Labels R1-R6 */}
          <div className="absolute -right-1.5 top-2 flex h-[300px] flex-col justify-around text-right text-[8px] font-bold text-white/40 tracking-wider">
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">R1</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">R2</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">R3</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">R4</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">R5</span>
            <span className="drop-shadow-[0_0_2px_rgba(255,255,255,0.15)] select-none">R6</span>
          </div>
          {children}
        </div>
      </div>
    </InstrumentShell>
  );
}
