import type { ReactNode } from 'react';
import { BezelScrew } from './BezelScrew';

interface InstrumentShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title: string;
  rightSlot?: ReactNode;
}

export function InstrumentShell({ children, title, rightSlot, className = '', ...props }: InstrumentShellProps) {
  return (
    <div
      className={[
        'relative flex flex-col items-center rounded-[8px] bg-[#171717] p-3 pt-2',
        'w-[520px] max-w-[96vw] max-md:w-[420px] max-sm:w-full max-sm:rounded-none',
        'border border-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-18px_30px_rgba(0,0,0,0.35),0_10px_30px_rgba(0,0,0,0.55)]',
        className,
      ].join(' ')}
      {...props}
    >
      <div className="absolute left-2 top-2"><BezelScrew /></div>
      <div className="absolute right-2 top-2"><BezelScrew /></div>
      <div className="absolute bottom-2 left-2"><BezelScrew /></div>
      <div className="absolute bottom-2 right-2"><BezelScrew /></div>
      <div className="mb-1 flex w-full items-center justify-between px-5">
        <span className="font-cdu text-[9px] uppercase tracking-[0.32em] text-cdu-white/35">
          {title}
        </span>
        {rightSlot}
      </div>
      {children}
    </div>
  );
}
