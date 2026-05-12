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
